import { TestBed } from '@angular/core/testing';
import { TypstCompilerService } from './typst-compiler.service';

describe('TypstCompilerService', () => {
  let service: TypstCompilerService;

  beforeEach(() => {
    // Clean up window.$typst before initializing service
    delete (window as any).$typst;
    TestBed.configureTestingModule({
      providers: [TypstCompilerService]
    });
    service = TestBed.inject(TypstCompilerService);
  });

  afterEach(() => {
    delete (window as any).$typst;
  });

  it('should initialize with expected default signal states', () => {
    expect(service).toBeTruthy();
    expect(service.isCompiling()).toBeFalse();
    expect(service.lastError()).toBeNull();
  });

  it('should compile to SVG when window.$typst is available', async () => {
    const mockSvgOutput = '<svg><text>Resume Mock</text></svg>';
    window.$typst = {
      setCompilerInitOptions: () => {},
      setRendererInitOptions: () => {},
      svg: jasmine.createSpy('svg').and.resolveTo(mockSvgOutput)
    };

    // Force service isReady signal to true
    (service.isReady as any).set(true);

    const result = await service.compileToSvg('#eval("test")');
    expect(result).toBe(mockSvgOutput);
    expect(service.isCompiling()).toBeFalse();
    expect(service.lastError()).toBeNull();
    expect(service.lastDurationMs()).not.toBeNull();
  });

  it('should record error signal when compilation fails', async () => {
    window.$typst = {
      svg: jasmine.createSpy('svg').and.rejectWith(new Error('Typst Syntax Error'))
    };
    (service.isReady as any).set(true);

    try {
      await service.compileToSvg('invalid typst code');
      fail('Expected compileToSvg to throw');
    } catch (err: any) {
      expect(err.message).toBe('Typst Syntax Error');
      expect(service.lastError()).toBe('Typst Syntax Error');
      expect(service.isCompiling()).toBeFalse();
    }
  });

  it('should compile to pages array using compileToPages', async () => {
    spyOn(service, 'compileToSvg').and.resolveTo('<svg viewBox="0 0 100 100"><circle /></svg>');
    const pages = await service.compileToPages('sample typst');
    expect(pages.length).toBe(1);
    expect(pages[0]).toContain('<circle');
  });

  it('should split multiple SVG roots into page chunks', () => {
    const rawMultiSvg = '<svg viewBox="0 0 100 100"><circle /></svg><svg viewBox="0 0 100 100"><rect /></svg>';
    const pages = service.splitSvgToPages(rawMultiSvg);
    expect(pages.length).toBe(2);
    expect(pages[0]).toContain('<circle');
    expect(pages[1]).toContain('<rect');
  });

  it('should handle empty or whitespace string in splitSvgToPages', () => {
    expect(service.splitSvgToPages('')).toEqual([]);
    expect(service.splitSvgToPages('   ')).toEqual([]);
  });

  it('should split multi-page SVG container with typst-page classes', () => {
    const mockSvgWithPages = `
      <svg viewBox="0 0 612 1584">
        <defs><style>.t { fill: #000; }</style></defs>
        <g class="typst-page" data-page-width="612" data-page-height="792"><text>P1</text></g>
        <g class="typst-page" data-page-width="612" data-page-height="792"><text>P2</text></g>
      </svg>
    `;
    const pages = service.splitSvgToPages(mockSvgWithPages);
    expect(pages.length).toBe(2);
    expect(pages[0]).toContain('P1');
    expect(pages[1]).toContain('P2');
  });

  it('should slice tall single-page viewBox into multiple pages', () => {
    // 612 x 1800 viewBox (taller than 1.15 * 792)
    const tallSvg = '<svg viewBox="0 0 612 1800" width="612" height="1800"><text>Tall Document</text></svg>';
    const pages = service.splitSvgToPages(tallSvg);
    expect(pages.length).toBeGreaterThan(1);
  });

  it('should compile to PDF bytes using compileToPdf', async () => {
    const mockPdfBytes = new Uint8Array([1, 2, 3, 4]);
    window.$typst = {
      pdf: jasmine.createSpy('pdf').and.resolveTo(mockPdfBytes)
    };
    (service.isReady as any).set(true);

    const result = await service.compileToPdf('typst pdf content');
    expect(result).toBe(mockPdfBytes);
    expect(service.isCompiling()).toBeFalse();
    expect(service.lastError()).toBeNull();
  });

  it('should catch error on compileToPdf failure', async () => {
    window.$typst = {
      pdf: jasmine.createSpy('pdf').and.rejectWith(new Error('PDF Compile Error'))
    };
    (service.isReady as any).set(true);

    try {
      await service.compileToPdf('bad typst');
      fail('Expected compileToPdf to throw');
    } catch (e: any) {
      expect(e.message).toBe('PDF Compile Error');
      expect(service.lastError()).toBe('PDF Compile Error');
      expect(service.isCompiling()).toBeFalse();
    }
  });

  it('should initiate PDF download via downloadPdf', async () => {
    const mockBytes = new Uint8Array([10, 20]);
    spyOn(service, 'compileToPdf').and.resolveTo(mockBytes);
    const createUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf');
    const revokeUrlSpy = spyOn(URL, 'revokeObjectURL');
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    await service.downloadPdf('code', 'My_Resume.pdf');

    expect(createUrlSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeUrlSpy).toHaveBeenCalledWith('blob:pdf');
  });
});
