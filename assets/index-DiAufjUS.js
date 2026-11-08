(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=class{parseCustomPalette(e){let t=e.split(`,`).map(e=>e.trim().replace(/^#/,``)).filter(e=>e.length>0);if(t.some(e=>!/^[0-9a-fA-F]{6}$/.test(e)))throw Error(`Invalid hex code format. Use 6-digit codes like FFFFFF.`);return t.map(e=>[parseInt(e.substring(0,2),16),parseInt(e.substring(2,4),16),parseInt(e.substring(4,6),16)])}rgbToLab(e){let[t,n,r]=e,i=t/255,a=n/255,o=r/255;i=i>.04045?((i+.055)/1.055)**2.4:i/12.92,a=a>.04045?((a+.055)/1.055)**2.4:a/12.92,o=o>.04045?((o+.055)/1.055)**2.4:o/12.92;let s=(i*.4124+a*.3576+o*.1805)/.95047,c=(i*.2126+a*.7152+o*.0722)/1,l=(i*.0193+a*.1192+o*.9505)/1.08883;return s=s>.008856?s**(1/3):7.787*s+16/116,c=c>.008856?c**(1/3):7.787*c+16/116,l=l>.008856?l**(1/3):7.787*l+16/116,[116*c-16,500*(s-c),200*(c-l)]}labToRgb(e){let[t,n,r]=e,i=(t+16)/116,a=n/500+i,o=i-r/200;a=a**3>.008856?a**3:(a-16/116)/7.787,i=i**3>.008856?i**3:(i-16/116)/7.787,o=o**3>.008856?o**3:(o-16/116)/7.787,a*=.95047,i*=1,o*=1.08883;let s=a*3.2406+i*-1.5372+o*-.4986,c=a*-.9689+i*1.8758+o*.0415,l=a*.0557+i*-.204+o*1.057;return s=s>.0031308?1.055*s**(1/2.4)-.055:12.92*s,c=c>.0031308?1.055*c**(1/2.4)-.055:12.92*c,l=l>.0031308?1.055*l**(1/2.4)-.055:12.92*l,[Math.round(Math.max(0,Math.min(255,s*255))),Math.round(Math.max(0,Math.min(255,c*255))),Math.round(Math.max(0,Math.min(255,l*255)))]}labColorDistanceSq(e,t){let n=e[0]-t[0],r=e[1]-t[1],i=e[2]-t[2];return n*n+r*r+i*i}generateHighContrastMask(e,t=5){let{width:n,height:r,data:i}=e,a=n*r,o=new Float32Array(a),s=new Float32Array(a);for(let e=0;e<a;e++){let t=e*4;i[t+3]<128?o[e]=-1:o[e]=.2126*i[t]+.7152*i[t+1]+.0722*i[t+2]}let c=new Float32Array(a);for(let e=0;e<r;e++){let t=e*n;for(let e=0;e<n;e++){let r=0,i=0,a=Math.max(0,e-2),s=Math.min(n-1,e+2);for(let e=a;e<=s;e++){let n=o[t+e];n>=0&&(r+=n,i++)}c[t+e]=i>0?r/i:Math.max(0,o[t+e])}}let l=Math.max(8,50-t*4.2);for(let e=0;e<n;e++)for(let t=0;t<r;t++){let i=t*n+e,a=o[i];if(a<0)continue;let u=0,d=0,f=Math.max(0,t-2),p=Math.min(r-1,t+2);for(let t=f;t<=p;t++)u+=c[t*n+e],d++;let m=d>0?u/d:a,h=Math.abs(a-m);if(h>=l){let e=h-l;s[i]=Math.min(1,.25+e/40)}}if(t>5){let e=(t-5)/5,i=new Float32Array(s);for(let t=1;t<r-1;t++){let r=t*n;for(let t=1;t<n-1;t++){let a=r+t,o=s[a];if(o>.3){let t=o*.65*e;t>i[a-1]&&(i[a-1]=t),t>i[a+1]&&(i[a+1]=t),t>i[a-n]&&(i[a-n]=t),t>i[a+n]&&(i[a+n]=t)}}}s=i}return s}sampleLabPixels(e,t,n=!1,r=null){let i=[],a=e.data,o=a.length/4,s=Math.max(1,Math.floor(o/(n?6e4:t)));for(let e=0;e<a.length;e+=4*s)a[e+3]>128&&i.push(this.rgbToLab([a[e],a[e+1],a[e+2]]));if(r){let e=[];for(let t=0;t<o;t++)r[t]>.25&&a[t*4+3]>128&&e.push(t);if(e.length>0){let t=Math.min(e.length,2500),n=Math.max(1,Math.floor(e.length/t));for(let t=0;t<e.length;t+=n){let n=e[t]*4;i.push(this.rgbToLab([a[n],a[n+1],a[n+2]]))}}}return i}kmeans(e,t,n=20){if(!e.length)return[];let r=[],i=Array.from(new Set(e.map(e=>JSON.stringify(e)))).map(e=>JSON.parse(e));if(i.sort((e,t)=>e[0]-t[0]),i.length<=t)r=i.slice();else{let e=Math.floor(i.length/t);for(let n=0;n<t;n++)r.push(i[n*e])}for(let t=0;t<n;t++){let t=Array.from({length:r.length},()=>[]);for(let n of e){let e=0,i=1/0;for(let t=0;t<r.length;t++){let a=this.labColorDistanceSq(n,r[t]);a<i&&(i=a,e=t)}t[e].push(n)}let n=[],i=!0;for(let e=0;e<r.length;e++){let a=t[e],o=r[e];if(!a.length)n[e]=o;else{let t=a.reduce((e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]],[0,0,0]);n[e]=[t[0]/a.length,t[1]/a.length,t[2]/a.length]}this.labColorDistanceSq(n[e],o)>1e-4&&(i=!1)}if(r=n,i)break}return r}applyPaletteQuantization(e,t){let n=t.map(e=>this.rgbToLab(e)),{width:r,height:i,data:a}=e,o=new Uint8ClampedArray(a.length),s=new Map;for(let e=0;e<a.length;e+=4){let r=a[e],i=a[e+1],c=a[e+2],l=a[e+3];if(l===0){o.set([0,0,0,0],e);continue}let u=r<<16|i<<8|c,d=s.get(u);if(!d){let e=this.rgbToLab([r,i,c]),a=0,o=1/0;for(let t=0;t<n.length;t++){let r=this.labColorDistanceSq(e,n[t]);r<o&&(o=r,a=t)}d=t[a],s.set(u,d)}o.set([d[0],d[1],d[2],l],e)}return{data:o,width:r,height:i}}estimateDownscaleResolution(e,t,n){let r=Math.max(e,t);return Math.max(1,Math.round(r*(2/Math.sqrt(r*n*.5))))}resizeNearestNeighbor(e,t,n){let{data:r,width:i,height:a}=e,o=new Uint8ClampedArray(t*n*4),s=i/t,c=a/n;for(let e=0;e<n;e++)for(let n=0;n<t;n++){let a=Math.floor(n*s),l=(Math.floor(e*c)*i+a)*4,u=(e*t+n)*4;o[u]=r[l],o[u+1]=r[l+1],o[u+2]=r[l+2],o[u+3]=r[l+3]}return{data:o,width:t,height:n}}modeDownscale(e,t,n,r=0,i=null,a=0){let o=e.data,s=e.width,c=e.height;if(t===s&&n===c)return{...e};let l=new Uint8ClampedArray(t*n*4),u=s/t,d=c/n;for(let e=0;e<n;e++){let n=Math.floor(e*d),f=Math.min(c,Math.max(n+1,Math.floor((e+1)*d)));for(let c=0;c<t;c++){let d=Math.floor(c*u),p=Math.min(s,Math.max(d+1,Math.floor((c+1)*u))),m=(f-n)*(p-d),h=new Map,g=0,_=0;for(let e=n;e<f;e++){let t=e*s;for(let e=d;e<p;e++){_++;let n=(t+e)*4,r=o[n+3];if(r<128){g++;continue}let a=o[n],s=o[n+1],c=o[n+2],l=a<<16|s<<8|c,u=i?i[t+e]:0,d=h.get(l);if(!d){let e=.2126*a+.7152*s+.0722*c;d={color:[a,s,c,r],lum:e,count:0,protectedWeightSum:0},h.set(l,d)}d.count++,u>0&&(d.protectedWeightSum+=u)}}let v=(e*t+c)*4;if(g>_/2||h.size===0){l[v]=0,l[v+1]=0,l[v+2]=0,l[v+3]=0;continue}let y=[0,0,0,255],b=-1/0,x=1/0,S=a>0?(a/5)**1.4*1.6:0;for(let e of h.values()){let t=e.lum/255,n=Math.exp(r/2*(.5-t)),i=e.count*n;e.protectedWeightSum>0&&a>0&&(i+=e.protectedWeightSum*n*m*S);let o=r>1e-4?e.lum<x:r<-1e-4&&e.lum>x;(i>b||Math.abs(i-b)<1e-6&&o)&&(b=i,y=e.color,x=e.lum)}l[v]=y[0],l[v+1]=y[1],l[v+2]=y[2],l[v+3]=y[3]}}return{data:l,width:t,height:n}}processImage(e,t){let{width:n,height:r}=e,i,a=null;if(t.preserveDetails&&(a=this.generateHighContrastMask(e,t.preserveStrength)),t.paletteMode===`custom`)i=this.parseCustomPalette(t.customPaletteStr);else{let n=t.fixPaletteData||e,r=t.fixPaletteData?null:a,o=this.sampleLabPixels(n,5e3,t.noDownscale,r);if(o.length===0)throw Error(`No non-transparent pixels found for palette generation.`);i=this.kmeans(o,t.nColors).map(e=>this.labToRgb(e))}let o=this.applyPaletteQuantization(e,i),s=o;if(t.shouldPixelize){let e=this.estimateDownscaleResolution(n,r,t.relativeScale)/Math.max(n,r),i=Math.max(1,Math.round(n*e)),c=Math.max(1,Math.round(r*e)),l=this.modeDownscale(o,i,c,t.weightC,a,t.preserveDetails?t.preserveStrength:0),u=n,d=r;if(t.outputSize){let e=t.outputSize/Math.max(n,r);u=Math.max(1,Math.round(n*e)),d=Math.max(1,Math.round(r*e))}s=this.resizeNearestNeighbor(l,u,d)}return{finalImageData:s,paletteRGB:i}}},t=class extends HTMLElement{rangeInput;numberInput;static get observedAttributes(){return[`value`]}attributeChangedCallback(e,t,n){e===`value`&&this.numberInput&&this.rangeInput&&(this.numberInput.value=n,this.rangeInput.value=n)}constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){let e=this.getAttribute(`min`)||`0`,t=this.getAttribute(`max`)||`100`,n=this.getAttribute(`step`)||`1`,r=this.getAttribute(`value`)||`0`,i=this.getAttribute(`label`)||``,a=this.getAttribute(`helper`)||``;this.shadowRoot.innerHTML=`
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
        <label>${i}</label>
        <input
          type="number"
          min="${e}"
          max="${t}"
          step="${n}"
          value="${r}"
        />
      </div>
      <input
        type="range"
        min="${e}"
        max="${t}"
        step="${n}"
        value="${r}"
      />
      ${a?`<small>${a}</small>`:``}
    `,this.rangeInput=this.shadowRoot.querySelector(`input[type="range"]`),this.numberInput=this.shadowRoot.querySelector(`input[type="number"]`);let o=()=>{this.dispatchEvent(new Event(`change`,{bubbles:!0,composed:!0}))};this.rangeInput.addEventListener(`input`,()=>{this.numberInput.value=this.rangeInput.value,o()}),this.numberInput.addEventListener(`input`,()=>{this.rangeInput.value=this.numberInput.value,o()})}get value(){return parseFloat(this.numberInput?.value||this.getAttribute(`value`)||`0`)}set value(e){this.numberInput&&this.rangeInput&&(this.numberInput.value=e.toString(),this.rangeInput.value=e.toString()),this.setAttribute(`value`,e.toString())}},n=class extends HTMLElement{fileInput;constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){let e=this.getAttribute(`label`)||`Upload File`,t=this.getAttribute(`accept`)||`*/*`;this.shadowRoot.innerHTML=`
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
      <label>${e}</label>
      <input type="file" accept="${t}" />
    `,this.fileInput=this.shadowRoot.querySelector(`input[type="file"]`),this.fileInput.addEventListener(`change`,()=>{let e=this.fileInput.files?.[0]||null;this.dispatchEvent(new CustomEvent(`file-selected`,{bubbles:!0,composed:!0,detail:{file:e}}))})}get file(){return this.fileInput?.files?.[0]||null}get files(){return this.fileInput?.files||null}},r=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){this.renderPlaceholder()}renderPlaceholder(){this.shadowRoot.innerHTML=`
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
    `}renderResult(e,t,n,r){this.shadowRoot.innerHTML=`
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
        <img id="result-image" src="${e}" alt="Processed output" />
        <div id="result-palette" class="palette-display"></div>
        <a id="download-link" href="${e}">Download Image</a>
      </div>
    `;let i=this.shadowRoot.querySelector(`#result-palette`);t.forEach(e=>{let t=document.createElement(`div`);t.className=`palette-color`,t.style.backgroundColor=`rgb(${e[0]}, ${e[1]}, ${e[2]})`,t.title=`#${e.map(e=>e.toString(16).padStart(2,`0`)).join(``).toUpperCase()}`,i.appendChild(t)});let a=this.shadowRoot.querySelector(`#download-link`),o=n.replace(/\.[^.]+$/,``);a.download=(r?`pixelated_`:`quantized_`)+o+`.png`}},i=class extends HTMLElement{processor=new e;inputFileName=`image.png`;loadedImageElement=null;constructor(){super(),this.attachShadow({mode:`open`})}connectedCallback(){this.shadowRoot.innerHTML=`
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
    `;let e=localStorage.getItem(`theme`),t=`light`;e===`light`||e===`dark`?t=e:window.matchMedia(`(prefers-color-scheme: dark)`).matches&&(t=`dark`),this.applyTheme(t),window.matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,e=>{localStorage.getItem(`theme`)||this.applyTheme(e.matches?`dark`:`light`)}),this.shadowRoot.querySelector(`#theme-toggle`)?.addEventListener(`click`,()=>{let e=document.documentElement.getAttribute(`data-theme`)===`dark`?`light`:`dark`;localStorage.setItem(`theme`,e),this.applyTheme(e)});let n=this.shadowRoot.querySelector(`#palette-mode-group`),r=this.shadowRoot.querySelector(`#kmeans-options`),i=this.shadowRoot.querySelector(`#custom-options`);n?.addEventListener(`change`,e=>{let t=e.target;t&&t.name===`palette-mode`&&(r?.classList.toggle(`hidden`,t.value!==`kmeans`),i?.classList.toggle(`hidden`,t.value!==`custom`))});let a=this.shadowRoot.querySelector(`#enable-pixelization`),o=this.shadowRoot.querySelector(`#pixelization-options`);a?.addEventListener(`change`,()=>{o?.classList.toggle(`hidden`,!a.checked)});let s=this.shadowRoot.querySelector(`#preserve-details`),c=this.shadowRoot.querySelector(`#detail-strength-container`);s?.addEventListener(`change`,()=>{c?.classList.toggle(`hidden`,!s.checked)});let l=this.shadowRoot.querySelector(`#main-image-uploader`),u=this.shadowRoot.querySelector(`#viewer`);l?.addEventListener(`file-selected`,e=>{let t=e.detail.file;if(!t)return;this.inputFileName=t.name;let n=new FileReader;n.onload=e=>{let t=e.target?.result;if(typeof t!=`string`)return;let n=new Image;n.onload=()=>{this.loadedImageElement=n,u.shadowRoot.innerHTML=`
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
              <img src="${t}" alt="Preview" />
            </div>
          `,this.updateStatus(`Image loaded. Adjust settings and process.`)},n.src=t},n.readAsDataURL(t)}),this.shadowRoot.querySelector(`#process-btn`)?.addEventListener(`click`,()=>void this.handleProcess())}applyTheme(e){document.documentElement.setAttribute(`data-theme`,e),this.className=e===`dark`?`theme-dark`:`theme-light`}extractImageData(e){let t=document.createElement(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);if(!n)throw Error(`2D context unavailable`);n.drawImage(e,0,0);let{data:r,width:i,height:a}=n.getImageData(0,0,e.width,e.height);return{data:r,width:i,height:a}}convertImageDataToDataUrl(e){let t=document.createElement(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);if(!n)throw Error(`2D context unavailable`);let r=new ImageData(new Uint8ClampedArray(e.data),e.width,e.height);return n.putImageData(r,0,0),t.toDataURL(`image/png`)}loadImageElementFromFile(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=e=>{if(!e.target?.result||typeof e.target.result!=`string`)return n(Error(`Could not read file as data URL`));let r=new Image;r.onload=()=>t(r),r.onerror=()=>n(Error(`Image failed to load`)),r.src=e.target.result},r.onerror=()=>n(Error(`FileReader error`)),r.readAsDataURL(e)})}async handleProcess(){if(!this.shadowRoot.querySelector(`#main-image-uploader`)?.file||!this.loadedImageElement){this.updateStatus(`Error: Please upload an image first.`,!0);return}let e=this.shadowRoot.querySelector(`#n-colors-ctrl`).value,t=this.shadowRoot.querySelector(`#palette-mode-group`)?.querySelector(`input[name="palette-mode"]:checked`)?.value||`kmeans`,n=this.shadowRoot.querySelector(`#custom-palette`)?.value||``;if(Number.isNaN(e)||e<2||e>64)this.updateStatus(`Error: Number of colors must be between 2 and 64.`,!0);else if(t===`custom`&&!n.trim())this.updateStatus(`Error: Custom palette cannot be empty.`,!0);else{this.toggleLoadingState(!0),this.updateStatus(`Processing started...`);try{let r=!!this.shadowRoot.querySelector(`#enable-pixelization`)?.checked,i=this.shadowRoot.querySelector(`#relative-scale-ctrl`).value,a=this.shadowRoot.querySelector(`#weight-c-ctrl`).value,o=this.shadowRoot.querySelector(`#output-size`),s=o?.value?parseInt(o.value,10):null,c=this.shadowRoot.querySelector(`#fix-palette-input`)?.files?.[0]||null,l=!!this.shadowRoot.querySelector(`#no-downscale`)?.checked,u=!!this.shadowRoot.querySelector(`#preserve-details`)?.checked,d=this.shadowRoot.querySelector(`#preserve-strength-ctrl`)?.value??5;this.updateStatus(`Processing...`),await new Promise(e=>setTimeout(e,10));let f=this.extractImageData(this.loadedImageElement),p=null;if(c){let e=await this.loadImageElementFromFile(c);p=this.extractImageData(e)}let m={paletteMode:t,nColors:e,shouldPixelize:r,relativeScale:i,weightC:a,outputSize:s,fixPaletteData:p,noDownscale:l,customPaletteStr:n,preserveDetails:u,preserveStrength:d},h=this.processor.processImage(f,m),g=this.convertImageDataToDataUrl(h.finalImageData);this.shadowRoot.querySelector(`#viewer`).renderResult(g,h.paletteRGB,this.inputFileName,r),this.updateStatus(`Success! Processing complete.`)}catch(e){let t=e instanceof Error?e.message:String(e);console.error(e),this.updateStatus(`Error: ${t}`,!0)}finally{this.toggleLoadingState(!1)}}}updateStatus(e,t=!1){let n=this.shadowRoot.querySelector(`#status`);n&&(n.textContent=e,n.classList.toggle(`error`,t))}toggleLoadingState(e){let t=this.shadowRoot.querySelector(`#process-btn`);t&&(t.disabled=e),this.shadowRoot.querySelector(`#spinner`)?.classList.toggle(`hidden`,!e)}};customElements.define(`synced-slider`,t),customElements.define(`image-uploader`,n),customElements.define(`pixel-viewer`,r),customElements.define(`pixelizer-app`,i);