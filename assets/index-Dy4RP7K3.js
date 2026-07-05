(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();var E=class{parseCustomPalette(o){const e=o.split(",").map(t=>t.trim().replace(/^#/,"")).filter(t=>t.length>0);if(e.some(t=>!/^[0-9a-fA-F]{6}$/.test(t)))throw new Error("Invalid hex code format. Use 6-digit codes like FFFFFF.");return e.map(t=>[parseInt(t.substring(0,2),16),parseInt(t.substring(2,4),16),parseInt(t.substring(4,6),16)])}rgbToLab(o){const[e,t,i]=o;let a=e/255,r=t/255,n=i/255;a=a>.04045?Math.pow((a+.055)/1.055,2.4):a/12.92,r=r>.04045?Math.pow((r+.055)/1.055,2.4):r/12.92,n=n>.04045?Math.pow((n+.055)/1.055,2.4):n/12.92;let c=(a*.4124+r*.3576+n*.1805)/.95047,s=(a*.2126+r*.7152+n*.0722)/1,l=(a*.0193+r*.1192+n*.9505)/1.08883;return c=c>.008856?Math.pow(c,1/3):7.787*c+16/116,s=s>.008856?Math.pow(s,1/3):7.787*s+16/116,l=l>.008856?Math.pow(l,1/3):7.787*l+16/116,[116*s-16,500*(c-s),200*(s-l)]}labToRgb(o){const[e,t,i]=o;let a=(e+16)/116,r=t/500+a,n=a-i/200;r=Math.pow(r,3)>.008856?Math.pow(r,3):(r-16/116)/7.787,a=Math.pow(a,3)>.008856?Math.pow(a,3):(a-16/116)/7.787,n=Math.pow(n,3)>.008856?Math.pow(n,3):(n-16/116)/7.787,r*=.95047,a*=1,n*=1.08883;let c=r*3.2406+a*-1.5372+n*-.4986,s=r*-.9689+a*1.8758+n*.0415,l=r*.0557+a*-.204+n*1.057;return c=c>.0031308?1.055*Math.pow(c,1/2.4)-.055:12.92*c,s=s>.0031308?1.055*Math.pow(s,1/2.4)-.055:12.92*s,l=l>.0031308?1.055*Math.pow(l,1/2.4)-.055:12.92*l,[Math.round(Math.max(0,Math.min(255,c*255))),Math.round(Math.max(0,Math.min(255,s*255))),Math.round(Math.max(0,Math.min(255,l*255)))]}labColorDistanceSq(o,e){const t=o[0]-e[0],i=o[1]-e[1],a=o[2]-e[2];return t*t+i*i+a*a}sampleLabPixels(o,e){const t=[],i=o.data,a=i.length/4,r=Math.max(1,Math.floor(a/e));for(let n=0;n<i.length;n+=4*r)i[n+3]>0&&t.push(this.rgbToLab([i[n],i[n+1],i[n+2]]));return t}kmeans(o,e,t=20){if(!o.length)return[];let i=[];const a=Array.from(new Set(o.map(r=>JSON.stringify(r)))).map(r=>JSON.parse(r));if(a.sort((r,n)=>r[0]-n[0]),a.length<=e)i=a.slice();else{const r=Math.floor(a.length/e);for(let n=0;n<e;n++)i.push(a[n*r])}for(let r=0;r<t;r++){const n=Array.from({length:i.length},()=>[]);for(const l of o){let u=0,m=1/0;for(let p=0;p<i.length;p++){const d=this.labColorDistanceSq(l,i[p]);d<m&&(m=d,u=p)}n[u].push(l)}const c=[];let s=!0;for(let l=0;l<i.length;l++){const u=n[l],m=i[l];if(!u.length)c[l]=m;else{const p=u.reduce((d,h)=>[d[0]+h[0],d[1]+h[1],d[2]+h[2]],[0,0,0]);c[l]=[p[0]/u.length,p[1]/u.length,p[2]/u.length]}this.labColorDistanceSq(c[l],m)>1e-4&&(s=!1)}if(i=c,s)break}return i}applyPaletteQuantization(o,e){const t=e.map(s=>this.rgbToLab(s)),{width:i,height:a,data:r}=o,n=new Uint8ClampedArray(r.length),c=new Map;for(let s=0;s<r.length;s+=4){const l=r[s],u=r[s+1],m=r[s+2],p=r[s+3];if(p===0){n.set([0,0,0,0],s);continue}const d=l<<16|u<<8|m;let h=c.get(d);if(!h){const v=this.rgbToLab([l,u,m]);let k=0,g=1/0;for(let f=0;f<t.length;f++){const b=this.labColorDistanceSq(v,t[f]);b<g&&(g=b,k=f)}h=e[k],c.set(d,h)}n.set([h[0],h[1],h[2],p],s)}return{data:n,width:i,height:a}}estimateDownscaleResolution(o,e,t){const i=Math.max(o,e);return Math.max(1,Math.round(i*(2/Math.sqrt(i*t*.5))))}resizeNearestNeighbor(o,e,t){const{data:i,width:a,height:r}=o,n=new Uint8ClampedArray(e*t*4),c=a/e,s=r/t;for(let l=0;l<t;l++)for(let u=0;u<e;u++){const m=Math.floor(u*c),p=(Math.floor(l*s)*a+m)*4,d=(l*e+u)*4;n[d]=i[p],n[d+1]=i[p+1],n[d+2]=i[p+2],n[d+3]=i[p+3]}return{data:n,width:e,height:t}}modeDownscale(o,e,t,i=64,a=0){const r=o.data,n=o.width,c=o.height;if(e===n&&t===c)return{...o};const s=(d,h,v)=>{if(v===0)return[0,0,0,0];let k=0,g=-1/0,f=1/0;for(let b=0;b<v;b++){const w=d[b],y=h[b],S=.2126*w[0]+.7152*w[1]+.0722*w[2],I=y*(1+a*(1-S/255));(I>g||Math.abs(I-g)<1e-6&&S<f)&&(g=I,k=b,f=S)}return d[k]},l=new Uint8ClampedArray(n*t*4),u=c/t;for(let d=0;d<n;d++)for(let h=0;h<t;h++){const v=Math.floor(h*u),k=Math.min(c,Math.ceil((h+1)*u)),g=[],f=[];let b=0;for(let w=v;w<k;w++){const y=(w*n+d)*4,S=r[y],I=r[y+1],z=r[y+2],R=r[y+3];let M=-1;for(let x=0;x<b;x++)if(g[x][0]===S&&g[x][1]===I&&g[x][2]===z&&g[x][3]===R){M=x;break}M!==-1?f[M]++:b<i&&(g.push([S,I,z,R]),f.push(1),b++)}l.set(s(g,f,b),(h*n+d)*4)}const m=new Uint8ClampedArray(e*t*4),p=n/e;for(let d=0;d<t;d++)for(let h=0;h<e;h++){const v=Math.floor(h*p),k=Math.min(n,Math.ceil((h+1)*p)),g=[],f=[];let b=0;for(let w=v;w<k;w++){const y=(d*n+w)*4,S=l[y],I=l[y+1],z=l[y+2],R=l[y+3];let M=-1;for(let x=0;x<b;x++)if(g[x][0]===S&&g[x][1]===I&&g[x][2]===z&&g[x][3]===R){M=x;break}M!==-1?f[M]++:b<i&&(g.push([S,I,z,R]),f.push(1),b++)}m.set(s(g,f,b),(d*e+h)*4)}return{data:m,width:e,height:t}}processImage(o,e){const{width:t,height:i}=o;let a;if(e.paletteMode==="custom")a=this.parseCustomPalette(e.customPaletteStr);else{const c=e.fixPaletteData||o,s=this.sampleLabPixels(c,5e3);if(s.length===0)throw new Error("No non-transparent pixels found for palette generation.");a=this.kmeans(s,e.nColors).map(l=>this.labToRgb(l))}const r=this.applyPaletteQuantization(o,a);let n=r;if(e.shouldPixelize){const c=this.estimateDownscaleResolution(t,i,e.relativeScale)/Math.max(t,i),s=Math.max(1,Math.round(t*c)),l=Math.max(1,Math.round(i*c)),u=this.modeDownscale(r,s,l,e.nColors,e.weightC);let m=t,p=i;if(e.outputSize){const d=e.outputSize/Math.max(t,i);m=Math.max(1,Math.round(t*d)),p=Math.max(1,Math.round(i*d))}n=this.resizeNearestNeighbor(u,m,p)}return{finalImageData:n,paletteRGB:a}}},P=class extends HTMLElement{rangeInput;numberInput;static get observedAttributes(){return["value"]}attributeChangedCallback(o,e,t){o==="value"&&this.numberInput&&this.rangeInput&&(this.numberInput.value=t,this.rangeInput.value=t)}constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const o=this.getAttribute("min")||"0",e=this.getAttribute("max")||"100",t=this.getAttribute("step")||"1",i=this.getAttribute("value")||"0",a=this.getAttribute("label")||"",r=this.getAttribute("helper")||"";this.shadowRoot.innerHTML=`
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
        <label>${a}</label>
        <input
          type="number"
          min="${o}"
          max="${e}"
          step="${t}"
          value="${i}"
        />
      </div>
      <input
        type="range"
        min="${o}"
        max="${e}"
        step="${t}"
        value="${i}"
      />
      ${r?`<small>${r}</small>`:""}
    `,this.rangeInput=this.shadowRoot.querySelector('input[type="range"]'),this.numberInput=this.shadowRoot.querySelector('input[type="number"]');const n=()=>{this.dispatchEvent(new Event("change",{bubbles:!0,composed:!0}))};this.rangeInput.addEventListener("input",()=>{this.numberInput.value=this.rangeInput.value,n()}),this.numberInput.addEventListener("input",()=>{this.rangeInput.value=this.numberInput.value,n()})}get value(){return parseFloat(this.numberInput?.value||this.getAttribute("value")||"0")}set value(o){this.numberInput&&this.rangeInput&&(this.numberInput.value=o.toString(),this.rangeInput.value=o.toString()),this.setAttribute("value",o.toString())}},L=class extends HTMLElement{fileInput;constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){const o=this.getAttribute("label")||"Upload File",e=this.getAttribute("accept")||"*/*";this.shadowRoot.innerHTML=`
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
      <label>${o}</label>
      <input type="file" accept="${e}" />
    `,this.fileInput=this.shadowRoot.querySelector('input[type="file"]'),this.fileInput.addEventListener("change",()=>{const t=this.fileInput.files?.[0]||null;this.dispatchEvent(new CustomEvent("file-selected",{bubbles:!0,composed:!0,detail:{file:t}}))})}get file(){return this.fileInput?.files?.[0]||null}get files(){return this.fileInput?.files||null}},C=class extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.renderPlaceholder()}renderPlaceholder(){this.shadowRoot.innerHTML=`
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
    `}renderResult(o,e,t,i){this.shadowRoot.innerHTML=`
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
        <img id="result-image" src="${o}" alt="Processed output" />
        <div id="result-palette" class="palette-display"></div>
        <a id="download-link" href="${o}">Download Image</a>
      </div>
    `;const a=this.shadowRoot.querySelector("#result-palette");e.forEach(c=>{const s=document.createElement("div");s.className="palette-color",s.style.backgroundColor=`rgb(${c[0]}, ${c[1]}, ${c[2]})`,s.title=`#${c.map(l=>l.toString(16).padStart(2,"0")).join("").toUpperCase()}`,a.appendChild(s)});const r=this.shadowRoot.querySelector("#download-link"),n=t.replace(/\.[^.]+$/,"");r.download=(i?"pixelated_":"quantized_")+n+".png"}},q=class extends HTMLElement{processor=new E;inputFileName="image.png";loadedImageElement=null;constructor(){super(),this.attachShadow({mode:"open"})}connectedCallback(){this.shadowRoot.innerHTML=`
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
        }
        .pixelize-label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: var(--text-color);
        }
        input[type="checkbox"] {
          margin-right: 8px;
          width: 1.1em;
          height: 1.1em;
          accent-color: var(--input-focus-border-color);
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
          display: none;
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
              helper="Positive values prefer darker colors. Negative values prefer lighter colors."
            ></synced-slider>
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
    `;const o=localStorage.getItem("theme");let e="light";o==="light"||o==="dark"?e=o:window.matchMedia("(prefers-color-scheme: dark)").matches&&(e="dark"),this.applyTheme(e),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",l=>{localStorage.getItem("theme")||this.applyTheme(l.matches?"dark":"light")}),this.shadowRoot.querySelector("#theme-toggle")?.addEventListener("click",()=>{const l=document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark";localStorage.setItem("theme",l),this.applyTheme(l)});const t=this.shadowRoot.querySelector("#palette-mode-group"),i=this.shadowRoot.querySelector("#kmeans-options"),a=this.shadowRoot.querySelector("#custom-options");t?.addEventListener("change",l=>{const u=l.target;u&&u.name==="palette-mode"&&(i?.classList.toggle("hidden",u.value!=="kmeans"),a?.classList.toggle("hidden",u.value!=="custom"))});const r=this.shadowRoot.querySelector("#enable-pixelization"),n=this.shadowRoot.querySelector("#pixelization-options");r?.addEventListener("change",()=>{n?.classList.toggle("hidden",!r.checked)});const c=this.shadowRoot.querySelector("#main-image-uploader"),s=this.shadowRoot.querySelector("#viewer");c?.addEventListener("file-selected",l=>{const u=l.detail.file;if(!u)return;this.inputFileName=u.name;const m=new FileReader;m.onload=p=>{const d=p.target?.result;if(typeof d!="string")return;const h=new Image;h.onload=()=>{this.loadedImageElement=h,s.shadowRoot.innerHTML=`
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
              <img src="${d}" alt="Preview" />
            </div>
          `,this.updateStatus("Image loaded. Adjust settings and process.")},h.src=d},m.readAsDataURL(u)}),this.shadowRoot.querySelector("#process-btn")?.addEventListener("click",()=>{this.handleProcess()})}applyTheme(o){document.documentElement.setAttribute("data-theme",o),this.className=o==="dark"?"theme-dark":"theme-light"}extractImageData(o){const e=document.createElement("canvas");e.width=o.width,e.height=o.height;const t=e.getContext("2d");if(!t)throw new Error("2D context unavailable");t.drawImage(o,0,0);const{data:i,width:a,height:r}=t.getImageData(0,0,o.width,o.height);return{data:i,width:a,height:r}}convertImageDataToDataUrl(o){const e=document.createElement("canvas");e.width=o.width,e.height=o.height;const t=e.getContext("2d");if(!t)throw new Error("2D context unavailable");const i=new ImageData(new Uint8ClampedArray(o.data),o.width,o.height);return t.putImageData(i,0,0),e.toDataURL("image/png")}loadImageElementFromFile(o){return new Promise((e,t)=>{const i=new FileReader;i.onload=a=>{if(!a.target?.result||typeof a.target.result!="string")return t(new Error("Could not read file as data URL"));const r=new Image;r.onload=()=>e(r),r.onerror=()=>t(new Error("Image failed to load")),r.src=a.target.result},i.onerror=()=>t(new Error("FileReader error")),i.readAsDataURL(o)})}async handleProcess(){if(!this.shadowRoot.querySelector("#main-image-uploader")?.file||!this.loadedImageElement){this.updateStatus("Error: Please upload an image first.",!0);return}const o=this.shadowRoot.querySelector("#n-colors-ctrl").value,e=this.shadowRoot.querySelector("#palette-mode-group")?.querySelector('input[name="palette-mode"]:checked')?.value||"kmeans",t=this.shadowRoot.querySelector("#custom-palette")?.value||"";if(Number.isNaN(o)||o<2||o>64){this.updateStatus("Error: Number of colors must be between 2 and 64.",!0);return}if(e==="custom"&&!t.trim()){this.updateStatus("Error: Custom palette cannot be empty.",!0);return}this.toggleLoadingState(!0),this.updateStatus("Processing started...");try{const i=!!this.shadowRoot.querySelector("#enable-pixelization")?.checked,a=this.shadowRoot.querySelector("#relative-scale-ctrl").value,r=this.shadowRoot.querySelector("#weight-c-ctrl").value,n=this.shadowRoot.querySelector("#output-size"),c=n?.value?parseInt(n.value,10):null,s=this.shadowRoot.querySelector("#fix-palette-input")?.files?.[0]||null,l=!!this.shadowRoot.querySelector("#no-downscale")?.checked;this.updateStatus("Processing..."),await new Promise(v=>setTimeout(v,10));const u=this.extractImageData(this.loadedImageElement);let m=null;if(s){const v=await this.loadImageElementFromFile(s);m=this.extractImageData(v)}const p={paletteMode:e,nColors:o,shouldPixelize:i,relativeScale:a,weightC:r,outputSize:c,fixPaletteData:m,noDownscale:l,customPaletteStr:t},d=this.processor.processImage(u,p),h=this.convertImageDataToDataUrl(d.finalImageData);this.shadowRoot.querySelector("#viewer").renderResult(h,d.paletteRGB,this.inputFileName,i),this.updateStatus("Success! Processing complete.")}catch(i){const a=i instanceof Error?i.message:String(i);console.error(i),this.updateStatus(`Error: ${a}`,!0)}finally{this.toggleLoadingState(!1)}}updateStatus(o,e=!1){const t=this.shadowRoot.querySelector("#status");t&&(t.textContent=o,t.classList.toggle("error",e))}toggleLoadingState(o){const e=this.shadowRoot.querySelector("#process-btn");e&&(e.disabled=o),this.shadowRoot.querySelector("#spinner")?.classList.toggle("hidden",!o)}};customElements.define("synced-slider",P);customElements.define("image-uploader",L);customElements.define("pixel-viewer",C);customElements.define("pixelizer-app",q);
