import { TemplateCustomization } from './template-config.model';

export type TemplateId = string;

export interface ResumeMeta {
  theme?: string;
  version?: string;
  lastModified?: string;
  canonical?: string;
  [key: string]: any;
}

export interface ResumeLocation {
  address?: string;
  postalCode?: string;
  city?: string;
  countryCode?: string;
  region?: string;
}

export interface ResumeProfile {
  network: string;
  username?: string;
  url: string;
}

export interface ResumeBasics {
  name: string;
  label?: string;
  image?: string;
  email?: string;
  phone?: string;
  url?: string;
  summary?: string;
  location?: ResumeLocation;
  profiles?: ResumeProfile[];
}

export interface WorkItem {
  id?: string;
  name: string;
  position: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  location?: string;
  isCurrent?: boolean;
}

export interface EducationItem {
  id?: string;
  institution: string;
  url?: string;
  area?: string;
  studyType?: string;
  startDate?: string;
  endDate?: string;
  score?: string;
  courses?: string[];
}

export interface SkillCategory {
  id?: string;
  name: string;
  level?: string;
  keywords: string[];
}

export interface ProjectItem {
  id?: string;
  name: string;
  description?: string;
  highlights?: string[];
  keywords?: string[];
  startDate?: string;
  endDate?: string;
  url?: string;
  roles?: string[];
  summary?: string;
  type?: string;
}

export interface CertificateItem {
  id?: string;
  name: string;
  date?: string;
  issuer?: string;
  url?: string;
}

export interface AwardItem {
  id?: string;
  title: string;
  date?: string;
  awarder?: string;
  summary?: string;
}

export interface LanguageItem {
  id?: string;
  language: string;
  fluency?: string;
}

export interface InterestItem {
  id?: string;
  name: string;
  keywords?: string[];
}

export interface VolunteerItem {
  id?: string;
  organization: string;
  position: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  location?: ResumeLocation | string;
}

export interface ReferenceItem {
  id?: string;
  name: string;
  reference: string;
  organization?: string;
  relationship?: string;
  date?: string;
  availableOnRequest?: boolean;
}

export interface HiddenSections {
  basics?: boolean;
  work?: boolean;
  education?: boolean;
  skills?: boolean;
  projects?: boolean;
  certificates?: boolean;
  awards?: boolean;
  languages?: boolean;
  interests?: boolean;
  volunteer?: boolean;
  references?: boolean;
  [key: string]: boolean | undefined;
}

/**
 * Standard JSON Resume (Single Source of Truth)
 */
export interface ResumeData {
  meta?: ResumeMeta;
  basics: ResumeBasics;
  work: WorkItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certificates?: CertificateItem[];
  awards?: AwardItem[];
  languages: LanguageItem[];
  interests: InterestItem[];
  volunteer: VolunteerItem[];
  references: ReferenceItem[];
  hiddenSections?: HiddenSections;
}

export interface TemplateConfig extends TemplateCustomization {
  primaryColor?: string;
  fontFamily?: string;
  compactMode?: boolean;
}

export interface TemplateMetadata {
  id: TemplateId;
  name: string;
  defaultPrimaryColor?: string;
  credit?: string;
  description?: string;
  previewImg?: string;
  tags?: string[];
}
