import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { TemplateRegistryService } from '../../services/template-registry.service';
import { ResumeStore } from '../../services/resume-store.service';
import { TEMPLATE_DEFAULT_COLORS } from '../../models/template-config.model';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: ResumeStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [TemplateRegistryService, ResumeStore]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(ResumeStore);

    fixture.componentRef.setInput('templates', []);
    fixture.componentRef.setInput('selectedTemplateId', 'modern_cv');
    fixture.componentRef.setInput('isGeneratingPdf', false);
    fixture.detectChanges();
  });

  it('should create header component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle style popover open and closed', () => {
    expect(component.isStyleOpen()).toBeFalse();

    const mockEvt = new MouseEvent('click');
    component.toggleStylePopover(mockEvt);
    expect(component.isStyleOpen()).toBeTrue();

    component.toggleStylePopover(mockEvt);
    expect(component.isStyleOpen()).toBeFalse();
  });

  it('should toggle more menu open and closed', () => {
    expect(component.isMoreMenuOpen()).toBeFalse();

    const mockEvt = new MouseEvent('click');
    component.toggleMoreMenu(mockEvt);
    expect(component.isMoreMenuOpen()).toBeTrue();
    expect(component.isStyleOpen()).toBeFalse();

    component.toggleMoreMenu(mockEvt);
    expect(component.isMoreMenuOpen()).toBeFalse();
  });

  it('should update accent color when setAccentColor is called', () => {
    component.setAccentColor('#ff385c');
    expect(store.templateConfig().accentColor).toBe('#ff385c');
  });

  it('should reset accent color to template default', () => {
    component.setAccentColor('#000000');
    expect(component.currentColor()).toBe('#000000');

    component.resetColorToTemplateDefault();
    const tmplId = store.selectedTemplateId();
    expect(component.currentColor()).toBe(TEMPLATE_DEFAULT_COLORS[tmplId]);
  });

  it('should handle custom color input change', () => {
    const event = { target: { value: '#10b981' } } as unknown as Event;
    component.onCustomColorChange(event);
    expect(store.templateConfig().accentColor).toBe('#10b981');
  });

  it('should set paper size and layout density', () => {
    component.setPaperSize('a4');
    expect(store.templateConfig().paperSize).toBe('a4');

    component.setDensity('compact');
    expect(store.templateConfig().density).toBe('compact');
  });

  it('should handle file selection and emit importJson', () => {
    spyOn(component.importJson, 'emit');
    const mockFile = new File(['{}'], 'resume.json', { type: 'application/json' });
    const event = {
      target: {
        files: [mockFile]
      }
    } as any;
    component.onFileSelected(event);
    expect(component.importJson.emit).toHaveBeenCalledWith(mockFile);
  });

  it('should close popovers when document click happens outside', () => {
    component.isStyleOpen.set(true);
    component.isMoreMenuOpen.set(true);

    const outsideEl = document.createElement('div');
    document.body.appendChild(outsideEl);

    const outsideEvt = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(outsideEvt, 'target', { value: outsideEl });

    component.onDocumentClick(outsideEvt);
    expect(component.isStyleOpen()).toBeFalse();
    expect(component.isMoreMenuOpen()).toBeFalse();

    document.body.removeChild(outsideEl);
  });
});
