import { Injectable, signal } from '@angular/core';

declare global {
  interface Window {
    $typst?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class TypstCompilerService {
  readonly isReady = signal<boolean>(false);
  readonly isCompiling = signal<boolean>(false);
  readonly lastDurationMs = signal<number | null>(null);
  readonly lastError = signal<string | null>(null);

  private isInitializing = false;

  constructor() {
    this.pollAndInit();
  }

  private pollAndInit(): void {
    if (typeof window === 'undefined') return;

    const check = () => {
      if (window.$typst && typeof window.$typst.svg === 'function') {
        this.configureWasm();
      } else {
        setTimeout(check, 50);
      }
    };
    check();
  }

  private async configureWasm(): Promise<void> {
    if (this.isReady() || this.isInitializing) return;
    this.isInitializing = true;

    try {
      window.$typst.setCompilerInitOptions({
        getModule: () =>
          'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler@0.7.0/pkg/typst_ts_web_compiler_bg.wasm'
      });

      window.$typst.setRendererInitOptions({
        getModule: () =>
          'https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-renderer@0.7.0/pkg/typst_ts_renderer_bg.wasm'
      });

      this.isReady.set(true);
      this.lastError.set(null);
      console.log('Typst WASM initialized successfully in Angular');
    } catch (err: any) {
      console.error('Failed to configure Typst WASM:', err);
      this.lastError.set(err?.message || 'WASM configure error');
    } finally {
      this.isInitializing = false;
    }
  }

  async compileToSvg(typstCode: string): Promise<string> {
    // Wait for $typst if not ready yet
    if (!this.isReady()) {
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if (this.isReady() && window.$typst) {
            clearInterval(interval);
            resolve();
          } else if (attempts > 80) {
            clearInterval(interval);
            reject(new Error('Typst WASM engine timeout after 4 seconds'));
          }
        }, 50);
      });
    }

    this.isCompiling.set(true);
    this.lastError.set(null);
    const start = performance.now();

    try {
      const svg = await window.$typst.svg({ mainContent: typstCode });
      const duration = Math.round(performance.now() - start);
      this.lastDurationMs.set(duration);
      return svg;
    } catch (err: any) {
      console.error('Typst compile error:', err);
      const msg = err?.message || String(err);
      this.lastError.set(msg);
      throw err;
    } finally {
      this.isCompiling.set(false);
    }
  }

  /**
   * Compiles Typst markup and returns an array of individual SVG strings (one per page).
   *
   * Handles:
   * 1. Multiple <svg> elements concatenated directly by Typst
   * 2. Multiple <g class="typst-page"> page containers inside a single root <svg>
   * 3. Oversized single SVG viewBox splitting (e.g. US Letter 612x792pt)
   */
  async compileToPages(typstCode: string): Promise<string[]> {
    const rawSvg = await this.compileToSvg(typstCode);
    return this.splitSvgToPages(rawSvg);
  }

  /**
   * Robust multi-page splitter for Typst SVG output.
   */
  splitSvgToPages(rawSvg: string): string[] {
    if (!rawSvg || !rawSvg.trim()) return [];

    // Case 1: Typst returned multiple concatenated <svg> root elements
    const svgRootMatches = rawSvg.split(/(?=<svg[\s>])/i).filter(chunk => chunk.trim().length > 0 && chunk.includes('</svg>'));
    if (svgRootMatches.length > 1) {
      return svgRootMatches;
    }

    // Case 2: In-browser DOM parsing for <g class="typst-page">
    if (typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawSvg, 'image/svg+xml');
        const rootSvg = doc.querySelector('svg');

        if (rootSvg) {
          // Look for Typst page container groups
          const pageGroups = Array.from(rootSvg.querySelectorAll('.typst-page'));

          if (pageGroups.length > 1) {
            const serializer = new XMLSerializer();
            // Preserve shared defs (fonts, glyphs, styles)
            const defsList = Array.from(rootSvg.querySelectorAll('defs, style, script'));
            const defsMarkup = defsList.map(node => serializer.serializeToString(node)).join('\n');

            return pageGroups.map((pageGroup) => {
              const pageWidth = pageGroup.getAttribute('data-page-width') ||
                rootSvg.getAttribute('data-page-width') ||
                '612';
              const pageHeight = pageGroup.getAttribute('data-page-height') ||
                rootSvg.getAttribute('data-page-height') ||
                '792';

              // Reset transform on page group if it was shifted vertically in the unified canvas
              const clonedPage = pageGroup.cloneNode(true) as SVGGElement;
              clonedPage.setAttribute('transform', 'translate(0, 0)');
              // clonedPage.setAttribute('style', `${clonedPage.getAttribute('style') || ''}; transform: scaleX(0.89); transform-origin: left top;`);

              const pageInner = serializer.serializeToString(clonedPage);
              return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${pageWidth} ${pageHeight}" width="100%" class="typst-doc page-sheet" style="overflow: visible; height: auto;">${defsMarkup}\n${pageInner}</svg>`;
            });
          }

          // Case 3: Single root SVG whose viewBox height exceeds a single page
          // Standard US-Letter aspect ratio: 612 x 792 pt (height/width = ~1.294)
          const viewBoxAttr = rootSvg.getAttribute('viewBox');
          if (viewBoxAttr) {
            const vbParts = viewBoxAttr.trim().split(/[\s,]+/).map(Number);
            if (vbParts.length === 4) {
              const [minX, minY, vbWidth, vbHeight] = vbParts;
              const standardPageHeight = Math.round(vbWidth * (792 / 612)); // 11 / 8.5 ratio

              // If content height is noticeably larger than 1 page (e.g. > 1.2x page height)
              if (vbHeight > standardPageHeight * 1.15) {
                const totalPages = Math.ceil(vbHeight / standardPageHeight);
                const pages: string[] = [];
                const rawSvgStr = rawSvg;

                for (let i = 0; i < totalPages; i++) {
                  const currentMinY = minY + (i * standardPageHeight);
                  const currentHeight = Math.min(standardPageHeight, vbHeight - (i * standardPageHeight));

                  // Clone root SVG with sliced viewBox and clean attributes
                  const slicedSvg = rawSvgStr
                    .replace(
                      /viewBox="[^"]*"/i,
                      `viewBox="${minX} ${currentMinY} ${vbWidth} ${currentHeight}"`
                    )
                    .replace(/(<svg\b[^>]*)\bheight="auto"/i, '$1')
                    .replace(/(<svg\b[^>]*)\bwidth="[^"]*"/i, '$1 width="100%"');
                  pages.push(slicedSvg);
                }
                return pages;
              }
            }
          }
        }
      } catch (domErr) {
        console.warn('DOMParser SVG multi-page extraction failed, falling back to regex', domErr);
      }
    }

    const singleSvg = rawSvg
      // .replace(/(class="[^"]*typst-page[^"]*")/i, '$1 style="transform: scaleX(0.95); transform-origin: left top;"')
      .replace(/(<svg\b[^>]*)\bwidth="[^"]*"/i, '$1 width="100%"')
      .replace(/(<svg\b[^>]*)\bheight="[^"]*"/i, '$1 style="height: auto;"');
    return [singleSvg];
  }

  async compileToPdf(typstCode: string): Promise<Uint8Array> {
    if (!this.isReady()) {
      await this.compileToSvg(typstCode);
    }

    this.isCompiling.set(true);
    this.lastError.set(null);

    try {
      const pdfBytes = await window.$typst.pdf({ mainContent: typstCode });
      return pdfBytes;
    } catch (err: any) {
      console.error('Typst PDF generation error:', err);
      const msg = err?.message || String(err);
      this.lastError.set(msg);
      throw err;
    } finally {
      this.isCompiling.set(false);
    }
  }

  async downloadPdf(typstCode: string, filename = 'Resume.pdf'): Promise<void> {
    const pdfBytes = await this.compileToPdf(typstCode);
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
