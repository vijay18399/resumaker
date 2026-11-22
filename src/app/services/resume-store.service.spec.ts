import { TestBed } from '@angular/core/testing';
import { ResumeStore } from './resume-store.service';
import { INITIAL_RESUME_DATA } from '../models/initial-resume.data';

describe('ResumeStore', () => {
  let store: ResumeStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [ResumeStore]
    });
    store = TestBed.inject(ResumeStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with initial resume data and section list', () => {
    expect(store.resumeData()).toBeTruthy();
    expect(store.sectionList.length).toBe(12); // Clean 12 standard resume content sections
    expect(store.activeSection()).toBe('basics');
  });

  it('should update template config and section titles', () => {
    store.updateTemplateConfig({ accentColor: '#1e3a8a', paperSize: 'a4', density: 'compact' });
    expect(store.templateConfig().accentColor).toBe('#1e3a8a');
    expect(store.templateConfig().paperSize).toBe('a4');
    expect(store.templateConfig().density).toBe('compact');

    store.updateSectionTitle('work', 'Employment History');
    expect(store.templateConfig().sectionTitles?.['work']).toBe('Employment History');

    store.resetTemplateConfig();
    expect(store.templateConfig().accentColor).toBe('#0f172a');
    expect(store.templateConfig().sectionTitles?.['work']).toBeUndefined();
  });

  it('should automatically switch accent color to template default primary color on template switch if not customized', () => {
    // Basic resume starts with #0f172a
    expect(store.templateConfig().accentColor).toBe('#0f172a');

    // Switch to modern_cv -> should transition to modern_cv default (#dc3545)
    store.setTemplate('modern_cv');
    expect(store.selectedTemplateId()).toBe('modern_cv');
    expect(store.templateConfig().accentColor).toBe('#dc3545');

    // Switch to brilliant_cv -> should transition to brilliant_cv default (#2563eb)
    store.setTemplate('brilliant_cv');
    expect(store.selectedTemplateId()).toBe('brilliant_cv');
    expect(store.templateConfig().accentColor).toBe('#2563eb');

    // Switch to modern_resume -> should transition to modern_resume default (#0d9488)
    store.setTemplate('modern_resume');
    expect(store.templateConfig().accentColor).toBe('#0d9488');

    // Now user explicitly customizes color to custom purple
    store.updateTemplateConfig({ accentColor: '#7c3aed' });
    expect(store.templateConfig().accentColor).toBe('#7c3aed');

    // Switching templates should preserve user custom color override
    store.setTemplate('modern_cv');
    expect(store.templateConfig().accentColor).toBe('#7c3aed');
  });

  // --- Basics Mutations ---
  it('should update basics field and location', () => {
    store.updateBasics('name', 'Alex Mercer');
    expect(store.basics().name).toBe('Alex Mercer');

    store.updateBasicsLocation('city', 'Seattle');
    expect(store.basics().location?.city).toBe('Seattle');
  });

  it('should add, update and remove profiles', () => {
    const initialCount = store.basics().profiles?.length || 0;
    store.addProfile();
    expect(store.basics().profiles?.length).toBe(initialCount + 1);

    const lastIdx = (store.basics().profiles?.length || 1) - 1;
    store.updateProfile(lastIdx, { network: 'GitHub', username: 'alexm' });
    expect(store.basics().profiles?.[lastIdx].network).toBe('GitHub');

    store.removeProfile(lastIdx);
    expect(store.basics().profiles?.length).toBe(initialCount);
  });

  // --- Work Mutations ---
  it('should add, update, move and remove work items', () => {
    const initialLen = store.work().length;
    store.addWork();
    expect(store.work().length).toBe(initialLen + 1);

    const newWork = store.work()[initialLen];
    expect(newWork.id).toBeTruthy();

    store.updateWork(newWork.id!, { name: 'Acme Corp', position: 'Lead Dev' });
    const updated = store.work().find(w => w.id === newWork.id);
    expect(updated?.name).toBe('Acme Corp');
    expect(updated?.position).toBe('Lead Dev');

    // Move work
    store.moveWork(initialLen, 'up');
    expect(store.work()[initialLen - 1].id).toBe(newWork.id);

    // Remove work
    store.removeWork(newWork.id!);
    expect(store.work().length).toBe(initialLen);
  });

  // --- Projects Mutations ---
  it('should add, update, move and remove projects', () => {
    store.addProject();
    const count = store.projects().length;
    expect(count).toBeGreaterThan(0);

    const proj = store.projects()[count - 1];
    store.updateProject(proj.id!, { name: 'New Project', description: 'Test desc' });
    expect(store.projects().find(p => p.id === proj.id)?.name).toBe('New Project');

    // Add a second project so we can move it
    store.addProject();
    const secondCount = store.projects().length;
    const secondProj = store.projects()[secondCount - 1];
    store.moveProject(secondCount - 1, 'up');
    expect(store.projects()[secondCount - 2].id).toBe(secondProj.id);

    store.removeProject(proj.id!);
    store.removeProject(secondProj.id!);
  });

  // --- Skills Mutations ---
  it('should add, update, remove skill categories and keywords', () => {
    const count = store.skills().length;
    store.addSkillCategory();
    expect(store.skills().length).toBe(count + 1);

    const cat = store.skills()[count];
    store.updateCategoryName(cat.id!, 'Cloud');
    expect(store.skills().find(s => s.id === cat.id)?.name).toBe('Cloud');

    store.addSkillKeyword(cat.id!, 'AWS');
    expect(store.skills().find(s => s.id === cat.id)?.keywords).toContain('AWS');

    store.updateSkillCategory(cat.id!, { keywords: ['AWS', 'GCP'] });
    expect(store.skills().find(s => s.id === cat.id)?.keywords.length).toBe(2);

    store.removeSkillCategory(cat.id!);
    expect(store.skills().length).toBe(count);
  });

  // --- Education Mutations ---
  it('should add, update, move and remove education items', () => {
    const count = store.education().length;
    store.addEducation();
    expect(store.education().length).toBe(count + 1);

    const edu = store.education()[count];
    store.updateEducation(edu.id!, { institution: 'MIT', studyType: 'M.S.' });
    expect(store.education().find(e => e.id === edu.id)?.institution).toBe('MIT');

    store.moveEducation(count, 'up');
    expect(store.education()[count - 1].id).toBe(edu.id);

    store.removeEducation(edu.id!);
    expect(store.education().length).toBe(count);
  });

  // --- Certificates & Awards Mutations ---
  it('should manage certificates and awards', () => {
    store.addCertification();
    const cert = store.certificates()[store.certificates().length - 1];
    store.updateCertification(cert.id!, { name: 'CKA' });
    expect(store.certificates().find(c => c.id === cert.id)?.name).toBe('CKA');
    store.removeCertification(cert.id!);

    store.addAward();
    const award = store.awards()[store.awards().length - 1];
    store.updateAward(award.id!, { title: 'Best Hacker' });
    expect(store.awards().find(a => a.id === award.id)?.title).toBe('Best Hacker');
    store.removeAward(award.id!);
  });

  // --- Languages, Interests, Volunteer, References ---
  it('should manage languages, interests, volunteer, and references', () => {
    store.addLanguage();
    const lang = store.languages()[store.languages().length - 1];
    store.updateLanguage(lang.id!, { language: 'German' });
    expect(store.languages().find(l => l.id === lang.id)?.language).toBe('German');
    store.removeLanguage(lang.id!);

    store.addInterest();
    const int = store.interests()[store.interests().length - 1];
    store.updateInterest(int.id!, { name: 'Robotics' });
    expect(store.interests().find(i => i.id === int.id)?.name).toBe('Robotics');
    store.removeInterest(int.id!);

    store.addVolunteer();
    const vol = store.volunteer()[store.volunteer().length - 1];
    store.updateVolunteer(vol.id!, { organization: 'Red Cross' });
    expect(store.volunteer().find(v => v.id === vol.id)?.organization).toBe('Red Cross');
    store.removeVolunteer(vol.id!);

    store.addReference();
    const ref = store.references()[store.references().length - 1];
    store.updateReference(ref.id!, { name: 'Bob' });
    expect(store.references().find(r => r.id === ref.id)?.name).toBe('Bob');
    store.removeReference(ref.id!);
  });

  // --- Navigation & Visibility ---
  it('should navigate between sections and toggle visibility', () => {
    store.setActiveSection('skills');
    expect(store.activeSection()).toBe('skills');

    store.toggleSectionVisibility('awards');
    expect(store.hiddenSections()['awards']).toBeTrue();
    store.toggleSectionVisibility('awards');
    expect(store.hiddenSections()['awards']).toBeFalse();

    store.setActiveSection('basics');
    expect(store.isFirstSection()).toBeTrue();
    store.nextSection();
    expect(store.activeSection()).toBe('summary');
    store.prevSection();
    expect(store.activeSection()).toBe('basics');
  });

  it('should reset data to default', () => {
    store.updateBasics('name', 'Temporary Name');
    store.resetToDefaults();
    expect(store.basics().name).toBe(INITIAL_RESUME_DATA.basics.name);
  });
});
