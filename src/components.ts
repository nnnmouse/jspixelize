import { PixelizerGenerator, type RawImageData } from "./pixelizer.js";

export class SyncedSlider extends HTMLElement {
  private rangeInput!: HTMLInputElement;
  private numberInput!: HTMLInputElement;

  static get observedAttributes() {
    return ["value"];
  }

  attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
    if (name === "value" && this.numberInput && this.rangeInput) {
      this.numberInput.value = newVal;
      this.rangeInput.value = newVal;
    }
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const min = this.getAttribute("min") || "0";
    const max = this.getAttribute("max") || "100";
    const step = this.getAttribute("step") || "1";
    const value = this.getAttribute("value") || "0";
    const label = this.getAttribute("label") || "";
    const helper = this.getAttribute("helper") || "";

    this.shadowRoot!.innerHTML = /* HTML */ `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: var(--font-family, system-ui, sans-serif);
        }
        .slider-group {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        label {
          font-weight: 600;
          font-size: 0.9em;
          color: var(--text-color);
        }
        small {
          font-size: 0.8em;
          color: var(--info-text-color);
          line-height: 1.4;
        }
        input[type="number"] {
          width: 60px;
          text-align: center;
          padding: 6px;
          background-color: var(--input-bg-color);
          color: var(--input-text-color);
          border: 1px solid var(--input-border-color);
          border-radius: 6px;
          font-size: 1em;
          box-sizing: border-box;
          font-family: inherit;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }
        input[type="number"]:focus {
          outline: none;
          border-color: var(--input-focus-border-color);
          box-shadow: 0 0 0 3px var(--input-focus-shadow-color);
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          background: var(--border-color);
          outline: none;
          border-radius: 4px;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: var(--input-focus-border-color);
          border-radius: 50%;
          transition: background-color 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background-color: var(--button-hover-bg-color);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--input-focus-border-color);
          border-radius: 50%;
          border: none;
          transition: background-color 0.2s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          background-color: var(--button-hover-bg-color);
        }
      </style>
      <div class="slider-group">
        <label>${label}</label>
        <input
          type="number"
          min="${min}"
          max="${max}"
          step="${step}"
          value="${value}"
        />
      </div>
      <input
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
      />
      ${helper ? `<small>${helper}</small>` : ""}
    `;

    this.rangeInput = this.shadowRoot!.querySelector('input[type="range"]')!;
    this.numberInput = this.shadowRoot!.querySelector('input[type="number"]')!;

    const handleInput = () => {
      this.dispatchEvent(
        new Event("change", { bubbles: true, composed: true }),
      );
    };

    this.rangeInput.addEventListener("input", () => {
      this.numberInput.value = this.rangeInput.value;
      handleInput();
    });

    this.numberInput.addEventListener("input", () => {
      this.rangeInput.value = this.numberInput.value;
      handleInput();
    });
  }

  get value(): number {
    return parseFloat(
      this.numberInput?.value || this.getAttribute("value") || "0",
    );
  }

  set value(val: number) {
    if (this.numberInput && this.rangeInput) {
      this.numberInput.value = val.toString();
      this.rangeInput.value = val.toString();
    }
    this.setAttribute("value", val.toString());
  }
}

export class ImageUploader extends HTMLElement {
  private fileInput!: HTMLInputElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const label = this.getAttribute("label") || "Upload File";
    const accept = this.getAttribute("accept") || "*/*";

    this.shadowRoot!.innerHTML = /* HTML */ `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: var(--font-family, system-ui, sans-serif);
        }
        label {
          font-weight: 600;
          font-size: 0.9em;
          color: var(--text-color);
        }
        input[type="file"] {
          width: 100%;
          padding: 4px;
          background-color: var(--input-bg-color);
          color: var(--input-text-color);
          border: 1px solid var(--input-border-color);
          border-radius: 6px;
          font-size: 1em;
          box-sizing: border-box;
          font-family: inherit;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }
        input[type="file"]:focus {
          outline: none;
          border-color: var(--input-focus-border-color);
          box-shadow: 0 0 0 3px var(--input-focus-shadow-color);
        }
        input[type="file"]::file-selector-button {
          padding: 6px 12px;
          margin: 2px 8px 2px 2px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--button-bg-color);
          color: var(--button-text-color);
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        input[type="file"]::file-selector-button:hover {
          background-color: var(--button-hover-bg-color);
        }
      </style>
      <label>${label}</label>
      <input type="file" accept="${accept}" />
    `;

    this.fileInput = this.shadowRoot!.querySelector('input[type="file"]')!;
    this.fileInput.addEventListener("change", () => {
      const file = this.fileInput.files?.[0] || null;
      this.dispatchEvent(
        new CustomEvent("file-selected", {
          bubbles: true,
          composed: true,
          detail: { file },
        }),
      );
    });
  }

  get file(): File | null {
    return this.fileInput?.files?.[0] || null;
  }

  get files(): FileList | null {
    return this.fileInput?.files || null;
  }
}

export class PixelViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.renderPlaceholder();
  }

  renderPlaceholder() {
    this.shadowRoot!.innerHTML = /* HTML */ `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-family: var(--font-family, system-ui, sans-serif);
        }
        #output-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        .placeholder {
          color: var(--info-text-color);
          text-align: center;
          font-size: 1.2rem;
          border: 2px dashed var(--border-color);
          padding: 40px;
          border-radius: 12px;
        }
      </style>
      <div id="output-container">
        <div class="placeholder">
          <p>Upload an image and click "Process" to see the result.</p>
        </div>
      </div>
    `;
  }

  renderResult(
    dataUrl: string,
    palette: number[][],
    fileName: string,
    pixelized: boolean,
  ) {
    this.shadowRoot!.innerHTML = /* HTML */ `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-family: var(--font-family, system-ui, sans-serif);
        }
        #output-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }
        #result-image {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 4px 15px var(--shadow-color);
        }
        .palette-display {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .palette-color {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          box-shadow: 0 1px 2px var(--shadow-color);
        }
        #download-link {
          display: inline-block;
          padding: 10px 18px;
          background-color: var(--button-bg-color);
          color: var(--button-text-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          text-decoration: none;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        #download-link:hover {
          background-color: var(--button-hover-bg-color);
        }
      </style>
      <div id="output-container">
        <img id="result-image" src="${dataUrl}" alt="Processed output" />
        <div id="result-palette" class="palette-display"></div>
        <a id="download-link" href="${dataUrl}">Download Image</a>
      </div>
    `;

    const paletteContainer = this.shadowRoot!.querySelector("#result-palette")!;
    palette.forEach((rgb) => {
      const swatch = document.createElement("div");
      swatch.className = "palette-color";
      swatch.style.backgroundColor = `rgb(${rgb[0]!}, ${rgb[1]!}, ${rgb[2]!})`;
      swatch.title = `#${rgb
        .map((c) => c.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()}`;
      paletteContainer.appendChild(swatch);
    });

    const downloadLink = this.shadowRoot!.querySelector(
      "#download-link",
    ) as HTMLAnchorElement;
    const baseName = fileName.replace(/\.[^.]+$/, "");
    downloadLink.download =
      (pixelized ? "pixelated_" : "quantized_") + baseName + ".png";
  }
}

export class PixelizerApp extends HTMLElement {
  private processor = new PixelizerGenerator();
  private inputFileName: string = "image.png";
  private loadedImageElement: HTMLImageElement | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot!.innerHTML = /* HTML */ `
      <style>
        :host {
          display: flex;
          width: 100%;
          height: 100vh;
          font-family: var(--font-family, system-ui, sans-serif);
          background-color: var(--bg-color);
          color: var(--text-color);
        }
        .sidebar {
          width: var(--sidebar-width, 340px);
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background-color: var(--header-bg-color);
          border-right: 1px solid var(--border-color);
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-sizing: border-box;
          transition:
            background-color 0.3s ease,
            border-color 0.3s ease;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }
        .sidebar h1 {
          font-size: 1.5rem;
          margin: 0;
          color: var(--header-text-color);
        }
        .theme-toggle-btn {
          background: transparent;
          border: none;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-color);
          transition: background-color 0.2s;
          padding: 0;
        }
        .theme-toggle-btn:hover {
          background-color: var(--theme-toggle-hover-bg);
        }
        .theme-toggle-btn svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .sun-icon {
          display: none;
        }
        .moon-icon {
          display: none;
        }
        :host(.theme-light) .moon-icon {
          display: block;
        }
        :host(.theme-dark) .sun-icon {
          display: block;
        }

        .main-content {
          flex-grow: 1;
          margin-left: var(--sidebar-width, 340px);
          height: 100vh;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: auto;
          box-sizing: border-box;
        }
        .controls-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .control-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        label {
          font-weight: 600;
          font-size: 0.9em;
          color: var(--text-color);
        }
        small {
          font-size: 0.8em;
          color: var(--info-text-color);
          line-height: 1.4;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          font-weight: normal;
          font-size: 0.9em;
          color: var(--text-color);
          cursor: pointer;
        }
        .pixelize-label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: var(--text-color);
          cursor: pointer;
        }
        input[type="checkbox"] {
          margin-right: 8px;
          width: 1.1em;
          height: 1.1em;
          accent-color: var(--input-focus-border-color);
          cursor: pointer;
        }
        .radio-group {
          display: flex;
          gap: 15px;
        }
        .radio-group label {
          font-weight: normal;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.9em;
          cursor: pointer;
        }
        input[type="radio"] {
          accent-color: var(--input-focus-border-color);
        }
        textarea,
        input[type="number"] {
          width: 100%;
          padding: 10px;
          background-color: var(--input-bg-color);
          color: var(--input-text-color);
          border: 1px solid var(--input-border-color);
          border-radius: 6px;
          font-size: 1em;
          font-family: inherit;
          box-sizing: border-box;
          transition:
            border-color 0.2s,
            box-shadow 0.2s;
        }
        textarea:focus,
        input:focus {
          outline: none;
          border-color: var(--input-focus-border-color);
          box-shadow: 0 0 0 3px var(--input-focus-shadow-color);
        }
        button {
          padding: 12px 20px;
          background-color: var(--button-bg-color);
          color: var(--button-text-color);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 1.1em;
          font-weight: bold;
          font-family: inherit;
          cursor: pointer;
          transition:
            background-color 0.2s,
            transform 0.1s;
          width: 100%;
        }
        button:hover:not(:disabled) {
          background-color: var(--button-hover-bg-color);
          transform: translateY(-1px);
        }
        button:disabled {
          background-color: var(--button-disabled-bg-color);
          cursor: not-allowed;
        }
        #status {
          padding: 10px;
          border-radius: 6px;
          margin-top: 10px;
          font-family: monospace;
          white-space: pre-wrap;
          background-color: var(--input-bg-color);
          color: var(--input-text-color);
          border: 1px solid var(--border-color);
          min-height: 50px;
          font-size: 0.9em;
          box-sizing: border-box;
        }
        #status.error {
          border-color: #f5c2c7;
          color: #dc3545;
        }
        .spinner {
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--input-focus-border-color);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 10px auto;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .hidden {
          display: none !important;
        }
        @media (max-width: 900px) {
          :host {
            display: block;
            height: 100dvh;
            overflow-y: auto;
          }
          .sidebar {
            position: static;
            width: 100%;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-color);
          }
          .main-content {
            margin-left: 0;
            height: auto;
            min-height: 50vh;
            padding: 16px;
          }
        }
        .sidebar,
        .main-content,
        :host {
          scrollbar-width: thin;
          scrollbar-color: var(--scrollbar-thumb-color)
            var(--scrollbar-track-color);
        }
        .sidebar::-webkit-scrollbar,
        .main-content::-webkit-scrollbar,
        :host::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .sidebar::-webkit-scrollbar-track,
        .main-content::-webkit-scrollbar-track,
        :host::-webkit-scrollbar-track {
          background: var(--scrollbar-track-color);
        }

        .sidebar::-webkit-scrollbar-thumb,
        .main-content::-webkit-scrollbar-thumb,
        :host::-webkit-scrollbar-thumb {
          background: var(--scrollbar-thumb-color);
          border-radius: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover,
        .main-content::-webkit-scrollbar-thumb:hover,
        :host::-webkit-scrollbar-thumb:hover {
          background: var(--scrollbar-thumb-hover-color);
        }
      </style>
      <aside class="sidebar">
        <div class="header-container">
          <h1>Pixel Converter</h1>
          <button
            id="theme-toggle"
            class="theme-toggle-btn"
            aria-label="Toggle Theme"
          >
            <svg
              class="icon sun-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M4.93 4.93l1.41 1.41" />
              <path d="M17.66 17.66l1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="M6.34 17.66l-1.41 1.41" />
              <path d="M19.07 4.93l-1.41 1.41" />
            </svg>
            <svg
              class="icon moon-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>
        </div>
        <div class="controls-panel">
          <image-uploader
            id="main-image-uploader"
            label="1. Upload Image"
            accept="image/*"
          ></image-uploader>

          <div class="control-group">
            <label>2. Palette Source</label>
            <div class="radio-group" id="palette-mode-group">
              <label>
                <input
                  type="radio"
                  name="palette-mode"
                  value="kmeans"
                  checked
                />
                Generate
              </label>
              <label>
                <input type="radio" name="palette-mode" value="custom" />
                Custom
              </label>
            </div>
          </div>

          <div id="kmeans-options">
            <synced-slider
              id="n-colors-ctrl"
              label="Number of Colors"
              min="2"
              max="64"
              value="16"
              step="1"
            ></synced-slider>

            <div class="control-group">
              <label for="fix-palette-input"
                >Use Reference Image for Palette (Optional)</label
              >
              <input type="file" id="fix-palette-input" accept="image/*" />
              <label class="checkbox-label">
                <input type="checkbox" id="no-downscale" /> No downscale for
                palette extraction
              </label>
            </div>
          </div>

          <div id="custom-options" class="hidden">
            <div class="control-group">
              <label for="custom-palette"
                >Custom Palette (comma-separated hex)</label
              >
              <textarea
                id="custom-palette"
                rows="3"
                placeholder="e.g., #FF0000, 00FF00, 0000FF"
              ></textarea>
            </div>
          </div>

          <div class="control-group">
            <label class="pixelize-label">
              <input type="checkbox" id="enable-pixelization" checked />
              3. Pixelize Image
            </label>
            <small
              >Uncheck this to only reduce colors without making the image
              pixelized.</small
            >
          </div>

          <div id="pixelization-options">
            <synced-slider
              id="relative-scale-ctrl"
              label="Pixel Size"
              min="0.01"
              max="10"
              value="1.0"
              step="0.05"
              helper="Smaller values = smaller pixels (more detail). Larger values = larger pixels."
            ></synced-slider>

            <div class="control-group">
              <label for="output-size">Final Image Size (Optional)</label>
              <input type="number" id="output-size" placeholder="e.g., 512" />
              <small>If blank, uses original image dimensions.</small>
            </div>

            <synced-slider
              id="weight-c-ctrl"
              label="Dark Color Preference"
              min="-2.0"
              max="2.0"
              value="0.0"
              step="0.05"
              helper="0.0 = completely neutral. Positive = prefer darker colors. Negative = prefer lighter colors."
            ></synced-slider>

            <div class="control-group">
              <label class="checkbox-label">
                <input type="checkbox" id="preserve-details" checked />
                Preserve Text / Fine Details
              </label>
              <small
                >Detects high-contrast strokes (text, line art) to prevent them
                from being erased during downscaling.</small
              >
            </div>

        <synced-slider
  id="preserve-strength-ctrl"
  label="Detail Protection Strength"
  min="1"
  max="10"
  value="5"
  step="0.5"
  helper="1 = delicate/subtle (sharpest text only), 5 = balanced, 10 = bold (bridges character gaps & catches subtle text)."
></synced-slider>
            </div>
          </div>
        </div>

        <div>
          <button id="process-btn">Process Image!</button>
          <div id="status">Ready. Upload an image to start.</div>
          <div id="spinner" class="spinner hidden"></div>
        </div>
      </aside>

      <main class="main-content">
        <pixel-viewer id="viewer"></pixel-viewer>
      </main>
    `;

    // Detect theme
    const savedTheme = localStorage.getItem("theme");
    let theme: "light" | "dark" = "light";
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
    this.applyTheme(theme);

    // Watch system color scheme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("theme")) {
          this.applyTheme(e.matches ? "dark" : "light");
        }
      });

    const toggleBtn = this.shadowRoot!.querySelector("#theme-toggle");
    toggleBtn?.addEventListener("click", () => {
      const currentTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      localStorage.setItem("theme", currentTheme);
      this.applyTheme(currentTheme);
    });

    const paletteModeGroup = this.shadowRoot!.querySelector(
      "#palette-mode-group",
    );
    const kmeansOptions = this.shadowRoot!.querySelector(
      "#kmeans-options",
    ) as HTMLElement;
    const customOptions = this.shadowRoot!.querySelector(
      "#custom-options",
    ) as HTMLElement;

    paletteModeGroup?.addEventListener("change", (e) => {
      const target = e.target as HTMLInputElement;
      if (target && target.name === "palette-mode") {
        kmeansOptions?.classList.toggle("hidden", target.value !== "kmeans");
        customOptions?.classList.toggle("hidden", target.value !== "custom");
      }
    });

    const enablePixelizationCheckbox = this.shadowRoot!.querySelector(
      "#enable-pixelization",
    ) as HTMLInputElement;
    const pixelizationOptions = this.shadowRoot!.querySelector(
      "#pixelization-options",
    ) as HTMLElement;
    enablePixelizationCheckbox?.addEventListener("change", () => {
      pixelizationOptions?.classList.toggle(
        "hidden",
        !enablePixelizationCheckbox.checked,
      );
    });

    const preserveDetailsCheckbox = this.shadowRoot!.querySelector(
      "#preserve-details",
    ) as HTMLInputElement;
    const detailStrengthContainer = this.shadowRoot!.querySelector(
      "#detail-strength-container",
    ) as HTMLElement;
    preserveDetailsCheckbox?.addEventListener("change", () => {
      detailStrengthContainer?.classList.toggle(
        "hidden",
        !preserveDetailsCheckbox.checked,
      );
    });

    const mainUploader = this.shadowRoot!.querySelector(
      "#main-image-uploader",
    ) as ImageUploader;
    const viewer = this.shadowRoot!.querySelector("#viewer") as PixelViewer;

    mainUploader?.addEventListener("file-selected", (e: Event) => {
      const customEvent = e as CustomEvent<{ file: File | null }>;
      const file = customEvent.detail.file;
      if (!file) return;
      this.inputFileName = file.name;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result !== "string") return;

        const img = new Image();
        img.onload = () => {
          this.loadedImageElement = img;
          viewer.shadowRoot!.innerHTML = /* HTML */ `
            <style>
              :host {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
              }
              #output-container {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              }
              img {
                max-width: 100%;
                max-height: 70vh;
                object-fit: contain;
                border-radius: 4px;
                box-shadow: 0 4px 15px var(--shadow-color);
              }
            </style>
            <div id="output-container">
              <img src="${result}" alt="Preview" />
            </div>
          `;
          this.updateStatus("Image loaded. Adjust settings and process.");
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });

    const processBtn = this.shadowRoot!.querySelector(
      "#process-btn",
    ) as HTMLButtonElement;
    processBtn?.addEventListener("click", () => void this.handleProcess());
  }

  private applyTheme(theme: "light" | "dark") {
    document.documentElement.setAttribute("data-theme", theme);
    this.className = theme === "dark" ? "theme-dark" : "theme-light";
  }

  private extractImageData(img: HTMLImageElement): RawImageData {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");
    ctx.drawImage(img, 0, 0);
    const { data, width, height } = ctx.getImageData(
      0,
      0,
      img.width,
      img.height,
    );
    return { data, width, height };
  }

  private convertImageDataToDataUrl(imageData: RawImageData): string {
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable");

    const imgDataObj = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height,
    );
    ctx.putImageData(imgDataObj, 0, 0);
    return canvas.toDataURL("image/png");
  }

  private loadImageElementFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        if (!e.target?.result || typeof e.target.result !== "string") {
          return reject(new Error("Could not read file as data URL"));
        }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image failed to load"));
        img.src = e.target.result;
      };
      fileReader.onerror = () => reject(new Error("FileReader error"));
      fileReader.readAsDataURL(file);
    });
  }

  private async handleProcess(): Promise<void> {
    const uploader = this.shadowRoot!.querySelector(
      "#main-image-uploader",
    ) as ImageUploader;
    const file = uploader?.file;
    if (!file || !this.loadedImageElement) {
      this.updateStatus("Error: Please upload an image first.", true);
      return;
    }

    const nColorsCtrl = this.shadowRoot!.querySelector(
      "#n-colors-ctrl",
    ) as SyncedSlider;
    const nColors = nColorsCtrl.value;

    const paletteModeGroup = this.shadowRoot!.querySelector(
      "#palette-mode-group",
    );
    const checkedRadio = paletteModeGroup?.querySelector(
      'input[name="palette-mode"]:checked',
    ) as HTMLInputElement;
    const paletteMode = (checkedRadio?.value || "kmeans") as
      | "kmeans"
      | "custom";

    const customPaletteEl = this.shadowRoot!.querySelector(
      "#custom-palette",
    ) as HTMLTextAreaElement;
    const customPaletteStr = customPaletteEl?.value || "";

    if (Number.isNaN(nColors) || nColors < 2 || nColors > 64) {
      this.updateStatus(
        "Error: Number of colors must be between 2 and 64.",
        true,
      );
      return;
    }
    if (paletteMode === "custom" && !customPaletteStr.trim()) {
      this.updateStatus("Error: Custom palette cannot be empty.", true);
      return;
    }

    this.toggleLoadingState(true);
    this.updateStatus("Processing started...");

    try {
      const enablePixelizationCheckbox = this.shadowRoot!.querySelector(
        "#enable-pixelization",
      ) as HTMLInputElement;
      const shouldPixelize = !!enablePixelizationCheckbox?.checked;

      const relativeScaleCtrl = this.shadowRoot!.querySelector(
        "#relative-scale-ctrl",
      ) as SyncedSlider;
      const relativeScale = relativeScaleCtrl.value;

      const weightCCtrl = this.shadowRoot!.querySelector(
        "#weight-c-ctrl",
      ) as SyncedSlider;
      const weightC = weightCCtrl.value;

      const outputSizeInput = this.shadowRoot!.querySelector(
        "#output-size",
      ) as HTMLInputElement;
      const outputSize = outputSizeInput?.value
        ? parseInt(outputSizeInput.value, 10)
        : null;

      const fixPaletteInput = this.shadowRoot!.querySelector(
        "#fix-palette-input",
      ) as HTMLInputElement;
      const fixPaletteFile = fixPaletteInput?.files?.[0] || null;

      const noDownscaleCheckbox = this.shadowRoot!.querySelector(
        "#no-downscale",
      ) as HTMLInputElement;
      const noDownscale = !!noDownscaleCheckbox?.checked;

      const preserveDetailsCheckbox = this.shadowRoot!.querySelector(
        "#preserve-details",
      ) as HTMLInputElement;
      const preserveDetails = !!preserveDetailsCheckbox?.checked;

      const preserveStrengthCtrl = this.shadowRoot!.querySelector(
        "#preserve-strength-ctrl",
      ) as SyncedSlider;
      const preserveStrength = preserveStrengthCtrl?.value ?? 5;

      this.updateStatus("Processing...");
      await new Promise<void>((resolve) => setTimeout(resolve, 10));

      const mainImageData = this.extractImageData(this.loadedImageElement);

      let fixPaletteData: RawImageData | null = null;
      if (fixPaletteFile) {
        const paletteImage =
          await this.loadImageElementFromFile(fixPaletteFile);
        fixPaletteData = this.extractImageData(paletteImage);
      }

      const options = {
        paletteMode,
        nColors,
        shouldPixelize,
        relativeScale,
        weightC,
        outputSize,
        fixPaletteData,
        noDownscale,
        customPaletteStr,
        preserveDetails,
        preserveStrength,
      };

      const result = this.processor.processImage(mainImageData, options);
      const dataUrl = this.convertImageDataToDataUrl(result.finalImageData);

      const viewer = this.shadowRoot!.querySelector("#viewer") as PixelViewer;
      viewer.renderResult(
        dataUrl,
        result.paletteRGB,
        this.inputFileName,
        shouldPixelize,
      );

      this.updateStatus("Success! Processing complete.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      this.updateStatus(`Error: ${msg}`, true);
    } finally {
      this.toggleLoadingState(false);
    }
  }

  private updateStatus(msg: string, isError = false) {
    const statusEl = this.shadowRoot!.querySelector("#status") as HTMLElement;
    if (statusEl) {
      statusEl.textContent = msg;
      statusEl.classList.toggle("error", isError);
    }
  }

  private toggleLoadingState(isLoading: boolean) {
    const processBtn = this.shadowRoot!.querySelector(
      "#process-btn",
    ) as HTMLButtonElement;
    if (processBtn) processBtn.disabled = isLoading;

    const spinner = this.shadowRoot!.querySelector("#spinner") as HTMLElement;
    spinner?.classList.toggle("hidden", !isLoading);
  }
}

customElements.define("synced-slider", SyncedSlider);
customElements.define("image-uploader", ImageUploader);
customElements.define("pixel-viewer", PixelViewer);
customElements.define("pixelizer-app", PixelizerApp);
