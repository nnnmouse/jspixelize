export type RawImageData = {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

type RGBColor = [number, number, number];
type RGBAColor = [number, number, number, number];
type LABColor = [number, number, number, number?]; // [L, a, b]
type Palette = RGBColor[];

export type PixelizerOptions = {
  paletteMode: "kmeans" | "custom";
  nColors: number;
  shouldPixelize: boolean;
  relativeScale: number;
  weightC: number;
  outputSize: number | null;
  fixPaletteData: RawImageData | null;
  noDownscale: boolean;
  customPaletteStr: string;
  preserveDetails: boolean;
  preserveStrength: number;
};

export type PixelizerResults = {
  finalImageData: RawImageData;
  paletteRGB: Palette;
};

export class PixelizerGenerator {
  parseCustomPalette(paletteStr: string): Palette {
    const hexCodes = paletteStr
      .split(",")
      .map((s) => s.trim().replace(/^#/, ""))
      .filter((s) => s.length > 0);
    if (hexCodes.some((h) => !/^[0-9a-fA-F]{6}$/.test(h))) {
      throw new Error(
        "Invalid hex code format. Use 6-digit codes like FFFFFF.",
      );
    }
    return hexCodes.map((hex) => [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ]);
  }

  rgbToLab(rgb: RGBColor): LABColor {
    const [r, g, b] = rgb;
    let R = r / 255,
      G = g / 255,
      B = b / 255;
    R = R > 0.04045 ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
    G = G > 0.04045 ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
    B = B > 0.04045 ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;
    let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    let Y = (R * 0.2126 + G * 0.7152 + B * 0.0722) / 1.0;
    let Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    X = X > 0.008856 ? Math.pow(X, 1 / 3) : 7.787 * X + 16 / 116;
    Y = Y > 0.008856 ? Math.pow(Y, 1 / 3) : 7.787 * Y + 16 / 116;
    Z = Z > 0.008856 ? Math.pow(Z, 1 / 3) : 7.787 * Z + 16 / 116;
    return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  }

  labToRgb(lab: LABColor): RGBColor {
    const [l, a, b] = lab;
    let y = (l + 16) / 116,
      x = a / 500 + y,
      z = y - b / 200;
    x = Math.pow(x, 3) > 0.008856 ? Math.pow(x, 3) : (x - 16 / 116) / 7.787;
    y = Math.pow(y, 3) > 0.008856 ? Math.pow(y, 3) : (y - 16 / 116) / 7.787;
    z = Math.pow(z, 3) > 0.008856 ? Math.pow(z, 3) : (z - 16 / 116) / 7.787;
    x *= 0.95047;
    y *= 1.0;
    z *= 1.08883;
    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b_ = x * 0.0557 + y * -0.204 + z * 1.057;
    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b_ = b_ > 0.0031308 ? 1.055 * Math.pow(b_, 1 / 2.4) - 0.055 : 12.92 * b_;
    return [
      Math.round(Math.max(0, Math.min(255, r * 255))),
      Math.round(Math.max(0, Math.min(255, g * 255))),
      Math.round(Math.max(0, Math.min(255, b_ * 255))),
    ];
  }

  labColorDistanceSq(a: LABColor, b: LABColor): number {
    const dl = a[0] - b[0],
      da = a[1] - b[1],
      db = a[2] - b[2];
    return dl * dl + da * da + db * db;
  }

  /**
   * Detects high-contrast strokes (text, line art, thin details) using local contrast.
   * Dynamic threshold & stroke expansion adapt smoothly to preserveStrength (1 to 10).
   */
  generateHighContrastMask(
    imageData: RawImageData,
    preserveStrength = 5.0,
  ): Float32Array {
    const { width: w, height: h, data } = imageData;
    const n = w * h;
    const lum = new Float32Array(n);
    let mask = new Float32Array(n);

    for (let i = 0; i < n; i++) {
      const idx = i * 4;
      const a = data[idx + 3]!;
      if (a < 128) {
        lum[i] = -1; // Ignore transparent pixels
      } else {
        lum[i] =
          0.2126 * data[idx]! +
          0.7152 * data[idx + 1]! +
          0.0722 * data[idx + 2]!;
      }
    }

    // Separable 5x5 box filter (radius = 2) for local mean luminance
    const R = 2;
    const hMean = new Float32Array(n);
    for (let y = 0; y < h; y++) {
      const yOff = y * w;
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let count = 0;
        const x0 = Math.max(0, x - R);
        const x1 = Math.min(w - 1, x + R);
        for (let xi = x0; xi <= x1; xi++) {
          const l = lum[yOff + xi]!;
          if (l >= 0) {
            sum += l;
            count++;
          }
        }
        hMean[yOff + x] = count > 0 ? sum / count : Math.max(0, lum[yOff + x]!);
      }
    }

    // Dynamic contrast threshold governed by preserveStrength:
    // Strength 1 -> ~46 (only extreme stark contrast)
    // Strength 5 -> ~28 (balanced text & outlines)
    // Strength 10 -> ~8 (subtle contrast, colored text, thin serifs)
    const threshold = Math.max(8, 50.0 - preserveStrength * 4.2);

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const idx = y * w + x;
        const l = lum[idx]!;
        if (l < 0) continue;
        let sum = 0;
        let count = 0;
        const y0 = Math.max(0, y - R);
        const y1 = Math.min(h - 1, y + R);
        for (let yi = y0; yi <= y1; yi++) {
          sum += hMean[yi * w + x]!;
          count++;
        }
        const mean = count > 0 ? sum / count : l;
        const contrast = Math.abs(l - mean);

        if (contrast >= threshold) {
          // Continuous weight based on contrast magnitude
          const excess = contrast - threshold;
          mask[idx] = Math.min(1.0, 0.25 + excess / 40.0);
        }
      }
    }

    // At higher strengths (> 5), perform soft stroke dilation to prevent
    // broken characters and reinforce thin letters into contiguous pixel art
    if (preserveStrength > 5.0) {
      const dilateFactor = (preserveStrength - 5.0) / 5.0; // 0.0 to 1.0
      const dilated = new Float32Array(mask);
      for (let y = 1; y < h - 1; y++) {
        const yOff = y * w;
        for (let x = 1; x < w - 1; x++) {
          const idx = yOff + x;
          const m = mask[idx]!;
          if (m > 0.3) {
            const spread = m * 0.65 * dilateFactor;
            if (spread > dilated[idx - 1]!) dilated[idx - 1] = spread;
            if (spread > dilated[idx + 1]!) dilated[idx + 1] = spread;
            if (spread > dilated[idx - w]!) dilated[idx - w] = spread;
            if (spread > dilated[idx + w]!) dilated[idx + w] = spread;
          }
        }
      }
      mask = dilated;
    }

    return mask;
  }

  sampleLabPixels(
    imageData: RawImageData,
    maxSamples: number,
    noDownscale = false,
    protectedMask: Float32Array | null = null,
  ): LABColor[] {
    const pixels: LABColor[] = [];
    const data = imageData.data;
    const total = data.length / 4;

    const effectiveMaxSamples = noDownscale ? 60000 : maxSamples;
    const samplingRate = Math.max(1, Math.floor(total / effectiveMaxSamples));

    for (let i = 0; i < data.length; i += 4 * samplingRate) {
      if (data[i + 3]! > 128) {
        pixels.push(this.rgbToLab([data[i]!, data[i + 1]!, data[i + 2]!]));
      }
    }

    // Inject protected detail pixels so text colors survive K-Means clustering
    if (protectedMask) {
      const protectedIndices: number[] = [];
      for (let i = 0; i < total; i++) {
        if (protectedMask[i]! > 0.25 && data[i * 4 + 3]! > 128) {
          protectedIndices.push(i);
        }
      }

      if (protectedIndices.length > 0) {
        const sampleLimit = Math.min(protectedIndices.length, 2500);
        const step = Math.max(
          1,
          Math.floor(protectedIndices.length / sampleLimit),
        );
        for (let i = 0; i < protectedIndices.length; i += step) {
          const idx = protectedIndices[i]! * 4;
          pixels.push(
            this.rgbToLab([data[idx]!, data[idx + 1]!, data[idx + 2]!]),
          );
        }
      }
    }

    return pixels;
  }

  kmeans(data: LABColor[], k: number, maxIterations = 20): LABColor[] {
    if (!data.length) return [];
    let centroids: LABColor[] = [];
    const uniquePoints = Array.from(
      new Set(data.map((p) => JSON.stringify(p))),
    ).map((s) => JSON.parse(s) as LABColor);
    uniquePoints.sort((a, b) => a[0] - b[0]);

    if (uniquePoints.length <= k) {
      centroids = uniquePoints.slice();
    } else {
      const step = Math.floor(uniquePoints.length / k);
      for (let i = 0; i < k; i++) centroids.push(uniquePoints[i * step]!);
    }

    for (let iter = 0; iter < maxIterations; iter++) {
      const clusters: LABColor[][] = Array.from(
        { length: centroids.length },
        () => [],
      );
      for (const p of data) {
        let best = 0;
        let min = Infinity;
        for (let i = 0; i < centroids.length; i++) {
          const d = this.labColorDistanceSq(p, centroids[i]!);
          if (d < min) {
            min = d;
            best = i;
          }
        }
        clusters[best]!.push(p);
      }

      const newCentroids: LABColor[] = [];
      let converged = true;
      for (let i = 0; i < centroids.length; i++) {
        const cluster = clusters[i]!;
        const centroid = centroids[i]!;
        if (!cluster.length) {
          newCentroids[i] = centroid;
        } else {
          const sum = cluster.reduce(
            (acc, pt) => [acc[0] + pt[0], acc[1] + pt[1], acc[2] + pt[2]],
            [0, 0, 0] as LABColor,
          );
          newCentroids[i] = [
            sum[0] / cluster.length,
            sum[1] / cluster.length,
            sum[2] / cluster.length,
          ];
        }
        if (this.labColorDistanceSq(newCentroids[i]!, centroid) > 1e-4)
          converged = false;
      }
      centroids = newCentroids;
      if (converged) break;
    }
    return centroids;
  }

  applyPaletteQuantization(
    imageData: RawImageData,
    paletteRGB: Palette,
  ): RawImageData {
    const paletteLab = paletteRGB.map((rgb) => this.rgbToLab(rgb));
    const { width, height, data } = imageData;
    const out = new Uint8ClampedArray(data.length);
    const cache = new Map<number, RGBColor>();

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!,
        g = data[i + 1]!,
        b = data[i + 2]!,
        a = data[i + 3]!;
      if (a === 0) {
        out.set([0, 0, 0, 0], i);
        continue;
      }
      const key = (r << 16) | (g << 8) | b;
      let best = cache.get(key);
      if (!best) {
        const lab = this.rgbToLab([r, g, b]);
        let bestIdx = 0;
        let min = Infinity;
        for (let j = 0; j < paletteLab.length; j++) {
          const d = this.labColorDistanceSq(lab, paletteLab[j]!);
          if (d < min) {
            min = d;
            bestIdx = j;
          }
        }
        best = paletteRGB[bestIdx]!;
        cache.set(key, best);
      }
      out.set([best[0], best[1], best[2], a], i);
    }
    return { data: out, width, height };
  }

  estimateDownscaleResolution(
    w: number,
    h: number,
    relativeScale: number,
  ): number {
    const longest = Math.max(w, h);
    return Math.max(
      1.0,
      Math.round(longest * (2.0 / Math.sqrt(longest * relativeScale * 0.5))),
    );
  }

  resizeNearestNeighbor(
    imageData: RawImageData,
    newWidth: number,
    newHeight: number,
  ): RawImageData {
    const { data: inData, width: inW, height: inH } = imageData;
    const outData = new Uint8ClampedArray(newWidth * newHeight * 4);
    const scaleX = inW / newWidth;
    const scaleY = inH / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
        const srcIdx = (srcY * inW + srcX) * 4;
        const destIdx = (y * newWidth + x) * 4;
        outData[destIdx] = inData[srcIdx]!;
        outData[destIdx + 1] = inData[srcIdx + 1]!;
        outData[destIdx + 2] = inData[srcIdx + 2]!;
        outData[destIdx + 3] = inData[srcIdx + 3]!;
      }
    }
    return { data: outData, width: newWidth, height: newHeight };
  }

  /**
   * 2D Cell Mode Downscale with continuous detail weighting.
   */
  modeDownscale(
    imageData: RawImageData,
    outW: number,
    outH: number,
    weightC = 0.0,
    protectedMask: Float32Array | null = null,
    preserveStrength = 0.0,
  ): RawImageData {
    const inData = imageData.data;
    const inW = imageData.width;
    const inH = imageData.height;
    if (outW === inW && outH === inH) return { ...imageData };

    const outData = new Uint8ClampedArray(outW * outH * 4);
    const scaleX = inW / outW;
    const scaleY = inH / outH;

    type CellEntry = {
      color: RGBAColor;
      lum: number;
      count: number;
      protectedWeightSum: number;
    };

    for (let yOut = 0; yOut < outH; yOut++) {
      const yStart = Math.floor(yOut * scaleY);
      const yEnd = Math.min(
        inH,
        Math.max(yStart + 1, Math.floor((yOut + 1) * scaleY)),
      );

      for (let xOut = 0; xOut < outW; xOut++) {
        const xStart = Math.floor(xOut * scaleX);
        const xEnd = Math.min(
          inW,
          Math.max(xStart + 1, Math.floor((xOut + 1) * scaleX)),
        );
        const cellArea = (yEnd - yStart) * (xEnd - xStart);

        const cellMap = new Map<number, CellEntry>();
        let transparentCount = 0;
        let totalCount = 0;

        for (let y = yStart; y < yEnd; y++) {
          const yOff = y * inW;
          for (let x = xStart; x < xEnd; x++) {
            totalCount++;
            const idx = (yOff + x) * 4;
            const a = inData[idx + 3]!;

            if (a < 128) {
              transparentCount++;
              continue;
            }

            const r = inData[idx]!;
            const g = inData[idx + 1]!;
            const b = inData[idx + 2]!;
            const key = (r << 16) | (g << 8) | b;

            const protWeight = protectedMask ? protectedMask[yOff + x]! : 0;
            let entry = cellMap.get(key);
            if (!entry) {
              const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
              entry = {
                color: [r, g, b, a],
                lum,
                count: 0,
                protectedWeightSum: 0,
              };
              cellMap.set(key, entry);
            }
            entry.count++;
            if (protWeight > 0) {
              entry.protectedWeightSum += protWeight;
            }
          }
        }

        const destIdx = (yOut * outW + xOut) * 4;

        if (transparentCount > totalCount / 2 || cellMap.size === 0) {
          outData[destIdx] = 0;
          outData[destIdx + 1] = 0;
          outData[destIdx + 2] = 0;
          outData[destIdx + 3] = 0;
          continue;
        }

        let bestColor: RGBAColor = [0, 0, 0, 255];
        let bestScore = -Infinity;
        let bestLum = Infinity;

        // Boost factor scales smoothly from mild (at 1) to bold/unbreakable (at 10)
        const boostPower =
          preserveStrength > 0
            ? Math.pow(preserveStrength / 5.0, 1.4) * 1.6
            : 0;

        for (const entry of cellMap.values()) {
          const normalizedLum = entry.lum / 255.0;
          const preference = Math.exp((weightC / 2) * (0.5 - normalizedLum));
          let score = entry.count * preference;

          if (entry.protectedWeightSum > 0 && preserveStrength > 0) {
            // Protected boost accounts for stroke strength and cell size
            score +=
              entry.protectedWeightSum * preference * cellArea * boostPower;
          }

          const prefersTie =
            weightC > 1e-4
              ? entry.lum < bestLum
              : weightC < -1e-4
                ? entry.lum > bestLum
                : false;

          if (
            score > bestScore ||
            (Math.abs(score - bestScore) < 1e-6 && prefersTie)
          ) {
            bestScore = score;
            bestColor = entry.color;
            bestLum = entry.lum;
          }
        }

        outData[destIdx] = bestColor[0];
        outData[destIdx + 1] = bestColor[1];
        outData[destIdx + 2] = bestColor[2];
        outData[destIdx + 3] = bestColor[3];
      }
    }

    return { data: outData, width: outW, height: outH };
  }

  processImage(
    mainImageData: RawImageData,
    options: PixelizerOptions,
  ): PixelizerResults {
    const { width: origW, height: origH } = mainImageData;
    let paletteRGB: Palette;

    let protectedMask: Float32Array | null = null;
    if (options.preserveDetails) {
      protectedMask = this.generateHighContrastMask(
        mainImageData,
        options.preserveStrength,
      );
    }

    if (options.paletteMode === "custom") {
      paletteRGB = this.parseCustomPalette(options.customPaletteStr);
    } else {
      const paletteSourceData = options.fixPaletteData || mainImageData;
      const maskForPalette = options.fixPaletteData ? null : protectedMask;

      const labPixels = this.sampleLabPixels(
        paletteSourceData,
        5000,
        options.noDownscale,
        maskForPalette,
      );
      if (labPixels.length === 0)
        throw new Error(
          "No non-transparent pixels found for palette generation.",
        );

      const centroidsLab = this.kmeans(labPixels, options.nColors);
      paletteRGB = centroidsLab.map((lab) => this.labToRgb(lab));
    }

    const quantizedImageData = this.applyPaletteQuantization(
      mainImageData,
      paletteRGB,
    );

    let finalImageData = quantizedImageData;
    if (options.shouldPixelize) {
      const scalePx = this.estimateDownscaleResolution(
        origW,
        origH,
        options.relativeScale,
      );
      const ratioDown = scalePx / Math.max(origW, origH);
      const downW = Math.max(1, Math.round(origW * ratioDown));
      const downH = Math.max(1, Math.round(origH * ratioDown));

      const downscaledImageData = this.modeDownscale(
        quantizedImageData,
        downW,
        downH,
        options.weightC,
        protectedMask,
        options.preserveDetails ? options.preserveStrength : 0,
      );

      let finalW = origW;
      let finalH = origH;
      if (options.outputSize) {
        const ratioUp = options.outputSize / Math.max(origW, origH);
        finalW = Math.max(1, Math.round(origW * ratioUp));
        finalH = Math.max(1, Math.round(origH * ratioUp));
      }

      finalImageData = this.resizeNearestNeighbor(
        downscaledImageData,
        finalW,
        finalH,
      );
    }

    return { finalImageData, paletteRGB };
  }
}
