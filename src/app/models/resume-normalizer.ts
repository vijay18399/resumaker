import { ResumeData } from '../models/resume.model';

export function normalizeResumeData(raw: any): ResumeData {
  if (!raw || typeof raw !== 'object') {
    return createEmptyResume();
  }

  const basics = raw.basics || {};
  const loc = basics.location || {};

  return {
    meta: {
      theme: raw.meta?.theme || raw.template || 'basic_resume',
      version: raw.meta?.version || '1.0.0',
      lastModified: raw.meta?.lastModified || new Date().toISOString()
    },
    basics: {
      name: basics.name || '',
      label: basics.label || '',
      email: basics.email || '',
      phone: basics.phone || '',
      url: basics.url || '',
      summary: basics.summary || '',
      image: basics.image || '',
      location: typeof loc === 'object' && loc !== null ? {
        city: loc.city || '',
        region: loc.region || '',
        countryCode: loc.countryCode || '',
        address: loc.address || '',
        postalCode: loc.postalCode || ''
      } : { city: typeof loc === 'string' ? loc : '' },
      profiles: Array.isArray(basics.profiles) ? basics.profiles : []
    },
    work: Array.isArray(raw.work) ? raw.work.map((w: any, idx: number) => ({
      id: w.id || `work-${idx + 1}`,
      name: w.name || '',
      position: w.position || '',
      url: w.url || '',
      startDate: w.startDate || '',
      endDate: w.endDate || '',
      summary: w.summary || '',
      location: w.location || '',
      highlights: Array.isArray(w.highlights) ? w.highlights : (w.summary ? [w.summary] : []),
      isCurrent: !w.endDate || w.endDate.toLowerCase() === 'present'
    })) : [],
    education: Array.isArray(raw.education) ? raw.education.map((e: any, idx: number) => ({
      id: e.id || `edu-${idx + 1}`,
      institution: e.institution || '',
      url: e.url || '',
      area: e.area || '',
      studyType: e.studyType || '',
      startDate: e.startDate || '',
      endDate: e.endDate || '',
      score: e.score || '',
      courses: Array.isArray(e.courses) ? e.courses : []
    })) : [],
    skills: Array.isArray(raw.skills) ? raw.skills.map((s: any, idx: number) => ({
      id: s.id || `skill-${idx + 1}`,
      name: s.name || '',
      level: s.level || '',
      keywords: Array.isArray(s.keywords) ? s.keywords : []
    })) : [],
    projects: Array.isArray(raw.projects) ? raw.projects.map((p: any, idx: number) => ({
      id: p.id || `proj-${idx + 1}`,
      name: p.name || '',
      description: p.description || p.summary || '',
      highlights: Array.isArray(p.highlights) ? p.highlights : [],
      keywords: Array.isArray(p.keywords) ? p.keywords : [],
      startDate: p.startDate || '',
      endDate: p.endDate || '',
      url: p.url || '',
      roles: Array.isArray(p.roles) ? p.roles : [],
      summary: p.summary || '',
      type: p.type || 'project'
    })) : [],
    certificates: Array.isArray(raw.certificates) ? raw.certificates.map((c: any, idx: number) => ({
      id: c.id || `cert-${idx + 1}`,
      name: c.name || '',
      issuer: c.issuer || '',
      date: c.date || '',
      url: c.url || ''
    })) : [],
    awards: Array.isArray(raw.awards) ? raw.awards.map((a: any, idx: number) => ({
      id: a.id || `award-${idx + 1}`,
      title: a.title || '',
      date: a.date || '',
      awarder: a.awarder || '',
      summary: a.summary || ''
    })) : [],
    languages: Array.isArray(raw.languages) ? raw.languages.map((l: any, idx: number) => ({
      id: l.id || `lang-${idx + 1}`,
      language: l.language || '',
      fluency: l.fluency || ''
    })) : [],
    interests: Array.isArray(raw.interests) ? raw.interests.map((i: any, idx: number) => ({
      id: i.id || `interest-${idx + 1}`,
      name: i.name || '',
      keywords: Array.isArray(i.keywords) ? i.keywords : []
    })) : [],
    volunteer: Array.isArray(raw.volunteer) ? raw.volunteer.map((v: any, idx: number) => ({
      id: v.id || `vol-${idx + 1}`,
      organization: v.organization || '',
      position: v.position || '',
      url: v.url || '',
      startDate: v.startDate || '',
      endDate: v.endDate || '',
      summary: v.summary || '',
      highlights: Array.isArray(v.highlights) ? v.highlights : [],
      location: v.location || ''
    })) : [],
    references: Array.isArray(raw.references) ? raw.references.map((r: any, idx: number) => ({
      id: r.id || `ref-${idx + 1}`,
      name: r.name || '',
      reference: r.reference || '',
      organization: r.organization || '',
      relationship: r.relationship || '',
      date: r.date || '',
      availableOnRequest: r.availableOnRequest
    })) : [],
    hiddenSections: raw.hiddenSections || {}
  };
}

export function createEmptyResume(): ResumeData {
  return {
    meta: {
      theme: 'pro',
      version: '1.0.0',
      lastModified: new Date().toISOString()
    },
    basics: {
      name: '',
      label: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: { city: '', region: '', countryCode: '', address: '', postalCode: '' },
      profiles: []
    },
    work: [],
    education: [],
    skills: [],
    projects: [],
    certificates: [],
    awards: [],
    languages: [],
    interests: [],
    volunteer: [],
    references: [],
    hiddenSections: {}
  };
}
