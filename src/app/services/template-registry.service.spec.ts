import { TestBed } from '@angular/core/testing';
import { TemplateRegistryService } from './template-registry.service';
import { TemplateId } from '../models/resume.model';
import { INITIAL_RESUME_DATA } from '../models/initial-resume.data';

describe('TemplateRegistryService', () => {
  let registry: TemplateRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TemplateRegistryService]
    });
    registry = TestBed.inject(TemplateRegistryService);
  });

  it('should list all 8 available templates with metadata and defaultPrimaryColor', () => {
    expect(registry.metadataList.length).toBe(8);
    const ids = registry.metadataList.map(m => m.id);
    expect(ids).toContain('modern_cv');
    expect(ids).toContain('basic_resume');
    expect(ids).toContain('brilliant_cv');
    expect(ids).toContain('modern_resume');
    expect(ids).toContain('atsthetic_cv');
    expect(ids).toContain('grid_cv');
    expect(ids).toContain('simple_technical');
    expect(ids).toContain('resume_ofa');

    expect(registry.getDefaultColor('modern_cv')).toBe('#dc3545');
    expect(registry.getDefaultColor('brilliant_cv')).toBe('#2563eb');
    expect(registry.getDefaultColor('modern_resume')).toBe('#0d9488');
    expect(registry.getDefaultColor('atsthetic_cv')).toBe('#000000');
    expect(registry.getDefaultColor('basic_resume')).toBe('#0f172a');
  });

  it('should render Typst code with interactive nav-links for every template', () => {
    const templates: TemplateId[] = [
      'modern_cv',
      'basic_resume',
      'brilliant_cv',
      'modern_resume',
      'atsthetic_cv',
      'grid_cv',
      'simple_technical',
      'resume_ofa'
    ];

    templates.forEach(id => {
      const code = registry.render(id, INITIAL_RESUME_DATA);
      expect(code).toBeTruthy();
      expect(typeof code).toBe('string');
      expect(code.length).toBeGreaterThan(100);
      expect(code).toContain('nav:section:');
    });
  });

  it('should render clean PDF code without nav-links using renderForPdf', () => {
    const pdfCode = registry.renderForPdf('modern_cv', INITIAL_RESUME_DATA);
    expect(pdfCode).toBeTruthy();
    expect(pdfCode).not.toContain('nav:section:');
    expect(pdfCode).not.toContain('nav:entry:');
  });
});
