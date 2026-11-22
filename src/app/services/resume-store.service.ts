import { Injectable, signal, computed } from '@angular/core';
import {
  ResumeData,
  TemplateId,
  WorkItem,
  EducationItem,
  ProjectItem,
  SkillCategory,
  CertificateItem,
  AwardItem,
  LanguageItem,
  InterestItem,
  VolunteerItem,
  ReferenceItem,
  ResumeProfile
} from '../models/resume.model';
import { INITIAL_RESUME_DATA } from '../models/initial-resume.data';
import { normalizeResumeData } from '../models/resume-normalizer';

const STORAGE_KEY = 'typst_resume_studio_data';
const TEMPLATE_KEY = 'typst_resume_selected_template';
const TEMPLATE_CONFIG_KEY = 'typst_resume_template_config';

import { NAV_SECTIONS, type FormSection, type NavSectionItem } from '../models/section-nav.config';
import { TemplateCustomization, DEFAULT_TEMPLATE_CONFIG, TEMPLATE_DEFAULT_COLORS } from '../models/template-config.model';
export { NAV_SECTIONS };
export type { FormSection, NavSectionItem };

@Injectable({
  providedIn: 'root'
})
export class ResumeStore {
  // Primary Signals
  readonly resumeData = signal<ResumeData>(this.loadInitialData());
  readonly selectedTemplateId = signal<TemplateId>(this.loadInitialTemplate());
  readonly templateConfig = signal<TemplateCustomization>(this.loadInitialTemplateConfig());
  readonly activeSection = signal<FormSection>('basics');
  readonly activeSubItemId = signal<string | null>(null);
  readonly customTypstCode = signal<string>('');
  readonly isCompiling = signal<boolean>(false);
  readonly compileDuration = signal<number | null>(null);
  readonly compilerError = signal<string | null>(null);

  // Sections navigation directly matching JSON Resume schema
  readonly sections = signal<NavSectionItem[]>(NAV_SECTIONS);

  get sectionList() {
    return this.sections();
  }

  // Active step progress percentage
  readonly progressPercent = computed(() => {
    const idx = this.sectionList.findIndex(s => s.id === this.activeSection());
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / this.sectionList.length) * 100);
  });

  readonly isFirstSection = computed(() => this.activeSection() === this.sectionList[0].id);
  readonly isLastSection = computed(() => this.activeSection() === this.sectionList[this.sectionList.length - 1].id);
  readonly currentSectionIndex = computed(() => {
    const idx = this.sectionList.findIndex(s => s.id === this.activeSection());
    return idx === -1 ? 1 : idx + 1;
  });

  // Computed Selectors directly pointing to JSON Resume fields
  readonly basics = computed(() => this.resumeData().basics);
  readonly work = computed(() => this.resumeData().work || []);
  readonly education = computed(() => this.resumeData().education || []);
  readonly skills = computed(() => this.resumeData().skills || []);
  readonly projects = computed(() => this.resumeData().projects || []);
  readonly certificates = computed(() => this.resumeData().certificates || []);
  readonly awards = computed(() => this.resumeData().awards || []);
  readonly languages = computed(() => this.resumeData().languages || []);
  readonly interests = computed(() => this.resumeData().interests || []);
  readonly volunteer = computed(() => this.resumeData().volunteer || []);
  readonly references = computed(() => this.resumeData().references || []);
  readonly hiddenSections = computed(() => this.resumeData().hiddenSections || {});

  constructor() { }

  // Toggle Section Visibility
  toggleSectionVisibility(sectionKey: keyof NonNullable<ResumeData['hiddenSections']>): void {
    this.resumeData.update(prev => {
      const current = prev.hiddenSections || {};
      return {
        ...prev,
        hiddenSections: {
          ...current,
          [sectionKey]: !current[sectionKey]
        }
      };
    });
    this.persist();
  }

  isSectionHidden(sectionKey: keyof NonNullable<ResumeData['hiddenSections']>): boolean {
    return !!this.hiddenSections()[sectionKey];
  }

  // Navigation Mutations
  setActiveSection(section: FormSection, subItemId?: string): void {
    this.activeSection.set(section);
    if (subItemId !== undefined) {
      this.activeSubItemId.set(subItemId);
    }
  }

  nextSection(): void {
    const currentIdx = this.sectionList.findIndex(s => s.id === this.activeSection());
    if (currentIdx < this.sectionList.length - 1) {
      this.activeSection.set(this.sectionList[currentIdx + 1].id);
      this.activeSubItemId.set(null);
    }
  }

  prevSection(): void {
    const currentIdx = this.sectionList.findIndex(s => s.id === this.activeSection());
    if (currentIdx > 0) {
      this.activeSection.set(this.sectionList[currentIdx - 1].id);
      this.activeSubItemId.set(null);
    }
  }

  // Basics Mutations
  updateBasics(field: keyof ResumeData['basics'], value: any): void {
    this.resumeData.update(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        [field]: value
      }
    }));
    this.persist();
  }

  updateBasicsLocation(field: 'address' | 'city' | 'region' | 'postalCode' | 'countryCode', value: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        location: {
          ...(prev.basics.location || {}),
          [field]: value
        }
      }
    }));
    this.persist();
  }

  addProfile(): void {
    const newProf: ResumeProfile = { network: 'LinkedIn', url: '', username: '' };
    this.resumeData.update(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        profiles: [...(prev.basics.profiles || []), newProf]
      }
    }));
    this.persist();
  }

  updateProfile(index: number, patch: Partial<ResumeProfile>): void {
    this.resumeData.update(prev => {
      const list = [...(prev.basics.profiles || [])];
      if (index >= 0 && index < list.length) {
        list[index] = { ...list[index], ...patch };
      }
      return {
        ...prev,
        basics: {
          ...prev.basics,
          profiles: list
        }
      };
    });
    this.persist();
  }

  removeProfile(index: number): void {
    this.resumeData.update(prev => ({
      ...prev,
      basics: {
        ...prev.basics,
        profiles: (prev.basics.profiles || []).filter((_, i) => i !== index)
      }
    }));
    this.persist();
  }

  // Work Mutations
  addWork(): void {
    const newWork: WorkItem = {
      id: `work-${Date.now()}`,
      name: '',
      position: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      isCurrent: true,
      highlights: ['']
    };
    this.resumeData.update(prev => ({
      ...prev,
      work: [...prev.work, newWork]
    }));
    this.activeSubItemId.set(newWork.id!);
    this.persist();
  }

  updateWork(id: string, patch: Partial<WorkItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      work: prev.work.map(w => w.id === id ? { ...w, ...patch } : w)
    }));
    this.persist();
  }

  removeWork(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      work: prev.work.filter(w => w.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveWork(index: number, direction: 'up' | 'down'): void {
    const list = [...this.work()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, work: list }));
    this.persist();
  }

  // Education Mutations
  addEducation(): void {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      studyType: '',
      area: '',
      startDate: '',
      endDate: '',
      score: ''
    };
    this.resumeData.update(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
    this.activeSubItemId.set(newEdu.id!);
    this.persist();
  }

  updateEducation(id: string, patch: Partial<EducationItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      education: prev.education.map(e => e.id === id ? { ...e, ...patch } : e)
    }));
    this.persist();
  }

  removeEducation(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveEducation(index: number, direction: 'up' | 'down'): void {
    const list = [...this.education()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, education: list }));
    this.persist();
  }

  // Skills Mutations
  addSkillCategory(): void {
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      name: '',
      keywords: []
    };
    this.resumeData.update(prev => ({
      ...prev,
      skills: [...prev.skills, newCat]
    }));
    this.activeSubItemId.set(newCat.id!);
    this.persist();
  }

  updateSkillCategory(id: string, patch: Partial<SkillCategory>): void {
    this.resumeData.update(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, ...patch } : s)
    }));
    this.persist();
  }

  updateCategoryName(id: string, name: string): void {
    this.updateSkillCategory(id, { name });
  }

  addSkillKeyword(catId: string, keyword: string): void {
    const clean = keyword.trim();
    if (!clean) return;
    const cat = this.skills().find(s => s.id === catId);
    if (!cat) return;
    if (!cat.keywords.includes(clean)) {
      this.updateSkillCategory(catId, { keywords: [...cat.keywords, clean] });
    }
  }

  removeSkillKeyword(catId: string, index: number): void {
    const cat = this.skills().find(s => s.id === catId);
    if (!cat) return;
    const updated = cat.keywords.filter((_, i) => i !== index);
    this.updateSkillCategory(catId, { keywords: updated });
  }

  updateSkillKeyword(catId: string, index: number, value: string): void {
    const cat = this.skills().find(s => s.id === catId);
    if (!cat) return;
    const updated = [...cat.keywords];
    updated[index] = value;
    this.updateSkillCategory(catId, { keywords: updated });
  }

  removeSkillCategory(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveSkillCategory(index: number, direction: 'up' | 'down'): void {
    const list = [...this.skills()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, skills: list }));
    this.persist();
  }

  // Projects Mutations
  addProject(): void {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      url: '',
      keywords: [],
      startDate: '',
      endDate: '',
      highlights: ['']
    };
    this.resumeData.update(prev => ({
      ...prev,
      projects: [...prev.projects, newProj]
    }));
    this.activeSubItemId.set(newProj.id!);
    this.persist();
  }

  updateProject(id: string, patch: Partial<ProjectItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...patch } : p)
    }));
    this.persist();
  }

  removeProject(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveProject(index: number, direction: 'up' | 'down'): void {
    const list = [...this.projects()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, projects: list }));
    this.persist();
  }

  // Certificates Mutations
  addCertification(): void {
    const newCert: CertificateItem = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      url: ''
    };
    this.resumeData.update(prev => ({
      ...prev,
      certificates: [...(prev.certificates || []), newCert]
    }));
    this.activeSubItemId.set(newCert.id!);
    this.persist();
  }

  updateCertification(id: string, patch: Partial<CertificateItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      certificates: (prev.certificates || []).map(c => c.id === id ? { ...c, ...patch } : c)
    }));
    this.persist();
  }

  removeCertification(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      certificates: (prev.certificates || []).filter(c => c.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveCertification(index: number, direction: 'up' | 'down'): void {
    const list = [...this.certificates()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, certificates: list }));
    this.persist();
  }

  // Awards Mutations
  addAward(): void {
    const newAward: AwardItem = {
      id: `award-${Date.now()}`,
      title: '',
      awarder: '',
      date: '',
      summary: ''
    };
    this.resumeData.update(prev => ({
      ...prev,
      awards: [...(prev.awards || []), newAward]
    }));
    this.activeSubItemId.set(newAward.id!);
    this.persist();
  }

  updateAward(id: string, patch: Partial<AwardItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      awards: (prev.awards || []).map(a => a.id === id ? { ...a, ...patch } : a)
    }));
    this.persist();
  }

  removeAward(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      awards: (prev.awards || []).filter(a => a.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveAward(index: number, direction: 'up' | 'down'): void {
    const list = [...this.awards()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, awards: list }));
    this.persist();
  }

  // Languages Mutations
  addLanguage(): void {
    const newLang: LanguageItem = {
      id: `lang-${Date.now()}`,
      language: '',
      fluency: 'Intermediate'
    };
    this.resumeData.update(prev => ({
      ...prev,
      languages: [...(prev.languages || []), newLang]
    }));
    this.activeSubItemId.set(newLang.id!);
    this.persist();
  }

  updateLanguage(id: string, patch: Partial<LanguageItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      languages: (prev.languages || []).map(l => l.id === id ? { ...l, ...patch } : l)
    }));
    this.persist();
  }

  removeLanguage(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      languages: (prev.languages || []).filter(l => l.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  // Interests Mutations
  addInterest(): void {
    const newInt: InterestItem = {
      id: `interest-${Date.now()}`,
      name: '',
      keywords: []
    };
    this.resumeData.update(prev => ({
      ...prev,
      interests: [...(prev.interests || []), newInt]
    }));
    this.activeSubItemId.set(newInt.id!);
    this.persist();
  }

  updateInterest(id: string, patch: Partial<InterestItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      interests: (prev.interests || []).map(i => i.id === id ? { ...i, ...patch } : i)
    }));
    this.persist();
  }

  removeInterest(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      interests: (prev.interests || []).filter(i => i.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  // Volunteer Mutations
  addVolunteer(): void {
    const newVol: VolunteerItem = {
      id: `vol-${Date.now()}`,
      organization: '',
      position: '',
      startDate: '',
      endDate: 'Present',
      highlights: ['']
    };
    this.resumeData.update(prev => ({
      ...prev,
      volunteer: [...(prev.volunteer || []), newVol]
    }));
    this.activeSubItemId.set(newVol.id!);
    this.persist();
  }

  updateVolunteer(id: string, patch: Partial<VolunteerItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      volunteer: (prev.volunteer || []).map(v => v.id === id ? { ...v, ...patch } : v)
    }));
    this.persist();
  }

  removeVolunteer(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      volunteer: (prev.volunteer || []).filter(v => v.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  // References Mutations
  addReference(): void {
    const newRef: ReferenceItem = {
      id: `ref-${Date.now()}`,
      name: '',
      reference: '',
      organization: '',
      relationship: ''
    };
    this.resumeData.update(prev => ({
      ...prev,
      references: [...(prev.references || []), newRef]
    }));
    this.activeSubItemId.set(newRef.id!);
    this.persist();
  }

  updateReference(id: string, patch: Partial<ReferenceItem>): void {
    this.resumeData.update(prev => ({
      ...prev,
      references: (prev.references || []).map(r => r.id === id ? { ...r, ...patch } : r)
    }));
    this.persist();
  }

  removeReference(id: string): void {
    this.resumeData.update(prev => ({
      ...prev,
      references: (prev.references || []).filter(r => r.id !== id)
    }));
    if (this.activeSubItemId() === id) {
      this.activeSubItemId.set(null);
    }
    this.persist();
  }

  moveVolunteer(index: number, direction: 'up' | 'down'): void {
    const list = [...this.volunteer()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, volunteer: list }));
    this.persist();
  }

  moveReference(index: number, direction: 'up' | 'down'): void {
    const list = [...this.references()];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    this.resumeData.update(prev => ({ ...prev, references: list }));
    this.persist();
  }

  // Template / Theme Selection
  setTemplate(id: TemplateId): void {
    const prevTemplate = this.selectedTemplateId();
    this.selectedTemplateId.set(id);
    this.resumeData.update(prev => ({
      ...prev,
      meta: {
        ...(prev.meta || {}),
        theme: id
      }
    }));
    try {
      localStorage.setItem(TEMPLATE_KEY, id);
    } catch (e) { }

    // If accentColor was unset, or was the default of the previous template, update to this template's default primary color
    const defaultPrev = TEMPLATE_DEFAULT_COLORS[prevTemplate] || '#0f172a';
    const defaultNew = TEMPLATE_DEFAULT_COLORS[id] || '#0f172a';
    const currentAccent = this.templateConfig().accentColor;
    if (!currentAccent || currentAccent === defaultPrev || currentAccent === '#0f172a') {
      this.updateTemplateConfig({ accentColor: defaultNew });
    }

    this.persist();
  }

  // Template Customization Settings
  updateTemplateConfig(partial: Partial<TemplateCustomization>): void {
    this.templateConfig.update(prev => ({
      ...prev,
      ...partial,
      sectionTitles: partial.sectionTitles !== undefined
        ? partial.sectionTitles
        : { ...(prev.sectionTitles || {}) }
    }));
    this.persistTemplateConfig();
  }

  updateSectionTitle(section: FormSection, title: string): void {
    this.templateConfig.update(prev => ({
      ...prev,
      sectionTitles: {
        ...(prev.sectionTitles || {}),
        [section]: title
      }
    }));
    this.persistTemplateConfig();
  }

  resetTemplateConfig(): void {
    const tmplId = this.selectedTemplateId();
    const defaultColor = TEMPLATE_DEFAULT_COLORS[tmplId] || DEFAULT_TEMPLATE_CONFIG.accentColor || '#0f172a';
    this.templateConfig.set({
      ...DEFAULT_TEMPLATE_CONFIG,
      accentColor: defaultColor,
      sectionTitles: {}
    });
    this.persistTemplateConfig();
  }

  private persistTemplateConfig(): void {
    try {
      localStorage.setItem(TEMPLATE_CONFIG_KEY, JSON.stringify(this.templateConfig()));
    } catch (e) { }
  }

  private loadInitialTemplateConfig(): TemplateCustomization {
    try {
      const saved = localStorage.getItem(TEMPLATE_CONFIG_KEY);
      if (saved) {
        return { ...DEFAULT_TEMPLATE_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) { }
    const initialTmpl = this.loadInitialTemplate();
    const defaultColor = TEMPLATE_DEFAULT_COLORS[initialTmpl] || DEFAULT_TEMPLATE_CONFIG.accentColor || '#0f172a';
    return { ...DEFAULT_TEMPLATE_CONFIG, accentColor: defaultColor };
  }

  setCustomTypstCode(code: string): void {
    this.customTypstCode.set(code);
  }

  resetToDefaults(): void {
    const defaultData = normalizeResumeData(INITIAL_RESUME_DATA);
    this.resumeData.set(defaultData);
    if (defaultData.meta?.theme) {
      this.setTemplate(defaultData.meta.theme);
    }
    this.persist();
  }

  loadData(data: ResumeData): void {
    const normalized = normalizeResumeData(data);
    if (normalized.meta?.theme) {
      this.setTemplate(normalized.meta.theme);
    }
    this.resumeData.set(normalized);
    this.persist();
  }

  private persist(): void {
    try {
      const dataToSave = {
        ...this.resumeData(),
        meta: {
          ...(this.resumeData().meta || {}),
          theme: this.selectedTemplateId()
        }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) { }
  }

  private loadInitialData(): ResumeData {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return normalizeResumeData(JSON.parse(saved));
      }
    } catch (e) { }
    return normalizeResumeData(INITIAL_RESUME_DATA);
  }

  private loadInitialTemplate(): TemplateId {
    try {
      const savedTmpl = localStorage.getItem(TEMPLATE_KEY);
      if (savedTmpl) return savedTmpl;
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.meta?.theme) return parsed.meta.theme;
      }
    } catch (e) { }
    return INITIAL_RESUME_DATA.meta?.theme || 'pro';
  }
}
