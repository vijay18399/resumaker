import { FormSection } from './section-nav.config';

export type PaperSize = 'us-letter' | 'a4';
export type FontSizeScale = 'small' | 'regular' | 'large';
export type DocumentDensity = 'compact' | 'normal' | 'relaxed';

export interface TemplateCustomization {
  accentColor?: string;
  paperSize?: PaperSize;
  fontSize?: FontSizeScale;
  density?: DocumentDensity;
  sectionTitles?: Partial<Record<FormSection, string>>;
}

export const CANONICAL_SECTION_TITLES: Record<FormSection, string> = {
  basics: 'Personal Information',
  summary: 'Summary',
  work: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  education: 'Education',
  certificates: 'Certifications',
  awards: 'Awards',
  languages: 'Languages',
  interests: 'Interests',
  volunteer: 'Volunteer Experience',
  references: 'References'
};

export const TEMPLATE_DEFAULT_COLORS: Record<string, string> = {
  basic_resume: '#0f172a',    // Dark Slate
  modern_cv: '#dc3545',       // Awesome-CV Crimson Red
  simple_technical: '#0f172a', // Slate Dark
  brilliant_cv: '#2563eb',    // Royal Blue
  atsthetic_cv: '#000000',    // Pure Black Classic
  grid_cv: '#0f172a',         // Dark Slate
  modern_resume: '#0d9488',   // Teal Accent
  resume_ofa: '#0f172a'       // Classic Serif Dark
};

export const COLOR_PRESETS = [
  { name: 'Dark Slate', hex: '#0f172a' },
  { name: 'Classic Navy', hex: '#1e3a8a' },
  { name: 'Deep Teal', hex: '#0f766e' },
  { name: 'Crimson Red', hex: '#dc3545' },
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Modern Indigo', hex: '#4338ca' },
  { name: 'Burgundy', hex: '#881337' },
  { name: 'Charcoal', hex: '#27272a' }
];

export const DEFAULT_TEMPLATE_CONFIG: TemplateCustomization = {
  accentColor: '#0f172a',
  paperSize: 'us-letter',
  fontSize: 'regular',
  density: 'normal',
  sectionTitles: {}
};
