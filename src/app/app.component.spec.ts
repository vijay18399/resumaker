import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ResumeStore } from './services/resume-store.service';
import { TemplateRegistryService } from './services/template-registry.service';
import { TypstCompilerService } from './services/typst-compiler.service';
import { DomSanitizer } from '@angular/platform-browser';

describe('AppComponent Integration Tests', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let store: ResumeStore;
  let compiler: TypstCompilerService;

  const mockDomSanitizer = {
    bypassSecurityTrustHtml: (val: string) => val,
    bypassSecurityTrustResourceUrl: (val: string) => val,
    sanitize: (_ctx: any, val: any) => val
  };

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        ResumeStore,
        TemplateRegistryService,
        TypstCompilerService,
        { provide: DomSanitizer, useValue: mockDomSanitizer }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(ResumeStore);
    compiler = TestBed.inject(TypstCompilerService);
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the root app and initialize signals', () => {
    expect(component).toBeTruthy();
    expect(component.templates.length).toBe(8);
    expect(component.generatedCode()).toBeTruthy();
    expect(component.renderedPages().length).toBe(0);
  });

  it('should handle template changes and update custom Typst code', () => {
    component.onTemplateChange('basic_resume');
    expect(store.selectedTemplateId()).toBe('basic_resume');
    expect(store.customTypstCode()).toBeTruthy();
  });

  it('should trigger compile and update renderedPages signal', async () => {
    spyOn(compiler, 'compileToPages').and.resolveTo(['<svg><text>Page 1</text></svg>']);
    await component.compile('test typst code');
    expect(component.renderedPages().length).toBe(1);
  });

  it('should catch error on compile failure gracefully', async () => {
    spyOn(compiler, 'compileToPages').and.rejectWith(new Error('Compile crash'));
    spyOn(console, 'error');
    await component.compile('bad code');
    expect(console.error).toHaveBeenCalled();
  });

  it('should trigger scheduleCompile with debounce timer', (done) => {
    spyOn(component, 'compile');
    component.scheduleCompile('code snippet');
    setTimeout(() => {
      expect(component.compile).toHaveBeenCalledWith('code snippet');
      done();
    }, 150);
  });

  it('should handle onExportJson and initiate file download', () => {
    const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    const clickSpy = spyOn(HTMLAnchorElement.prototype, 'click');

    component.onExportJson();

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test');
  });

  it('should handle onExportJson errors gracefully', () => {
    spyOn(JSON, 'stringify').and.throwError('Serialization fail');
    spyOn(window, 'alert');
    component.onExportJson();
    expect(window.alert).toHaveBeenCalled();
  });

  it('should handle JSON import file parsing', (done) => {
    const rawJson = JSON.stringify({
      basics: {
        name: 'Imported User',
        email: 'imported@example.com'
      }
    });

    const file = new Blob([rawJson], { type: 'application/json' }) as File;
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsText: function () {
        this.onload({ target: { result: rawJson } });
      }
    });

    component.onImportJsonFile(file);

    expect(store.basics().name).toBe('Imported User');
    done();
  });

  // --- Negative Test Scenarios ---
  it('should alert when importing malformed non-JSON syntax', () => {
    const alertSpy = spyOn(window, 'alert');
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsText: function () {
        this.onload({ target: { result: '{ invalid: json syntax' } });
      }
    });

    component.onImportJsonFile(new Blob(['bad text']) as File);
    expect(alertSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Failed to import JSON data/));
  });

  it('should alert when importing valid JSON that is a primitive (e.g. string or number)', () => {
    const alertSpy = spyOn(window, 'alert');
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsText: function() {
        this.onload({ target: { result: '"just a string"' } });
      }
    });

    component.onImportJsonFile(new Blob(['"just a string"']) as File);
    expect(alertSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Invalid JSON format/));
  });

  it('should alert when importing JSON representing null', () => {
    const alertSpy = spyOn(window, 'alert');
    spyOn(window as any, 'FileReader').and.returnValue({
      readAsText: function() {
        this.onload({ target: { result: 'null' } });
      }
    });

    component.onImportJsonFile(new Blob(['null']) as File);
    expect(alertSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Invalid JSON format/));
  });

  it('should safely import JSON with empty object and corrupted array fields without crashing', () => {
    // Edge case: someone imports a JSON where work is a string, skills is a number
    const corruptedJson = JSON.stringify({
      basics: null,
      work: 'not-an-array',
      skills: 12345,
      education: null
    });

    spyOn(window as any, 'FileReader').and.returnValue({
      readAsText: function() {
        this.onload({ target: { result: corruptedJson } });
      }
    });

    // App should not throw, normalizer should sanitize it to safe empty arrays
    expect(() => {
      component.onImportJsonFile(new Blob([corruptedJson]) as File);
    }).not.toThrow();

    expect(store.work()).toEqual([]);
    expect(store.skills()).toEqual([]);
  });

  it('should handle onDownloadPdf success', async () => {
    spyOn(compiler, 'downloadPdf').and.resolveTo();
    await component.onDownloadPdf();
    expect(component.isGeneratingPdf()).toBeFalse();
  });

  it('should handle onDownloadPdf errors gracefully', async () => {
    spyOn(compiler, 'downloadPdf').and.rejectWith(new Error('PDF error'));
    spyOn(window, 'alert');
    await component.onDownloadPdf();
    expect(window.alert).toHaveBeenCalled();
    expect(component.isGeneratingPdf()).toBeFalse();
  });

  it('should handle interactive preview click and set active section', () => {
    // 1. Test clicking a nav:section anchor link
    const anchor = document.createElement('a');
    anchor.setAttribute('href', 'nav:section:work');
    const evt = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(evt, 'target', { value: anchor, enumerable: true });

    component.onPreviewClick(evt);
    expect(store.activeSection()).toBe('work');

    // 2. Test clicking a nav:entry anchor link
    const entryAnchor = document.createElement('a');
    entryAnchor.setAttribute('href', 'nav:entry:education:e1');
    const entryEvt = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(entryEvt, 'target', { value: entryAnchor, enumerable: true });

    component.onPreviewClick(entryEvt);
    expect(store.activeSection()).toBe('education');
    expect(store.activeSubItemId()).toBe('e1');

    // 3. Test data-section attribute routing
    const dataNode = document.createElement('div');
    dataNode.setAttribute('data-section', 'work');
    const dataEvt = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(dataEvt, 'target', { value: dataNode, enumerable: true });
    component.onPreviewClick(dataEvt);
    expect(store.activeSection()).toBe('work');
  });

  it('should scroll on scrollToSubItem', (done) => {
    const div = document.createElement('div');
    div.id = 'target-item-123';
    document.body.appendChild(div);

    component.scrollToSubItem('work', 'target-item-123');
    expect(store.activeSection()).toBe('work');
    expect(store.activeSubItemId()).toBe('target-item-123');

    setTimeout(() => {
      document.body.removeChild(div);
      done();
    }, 70);
  });
});
