import {
  ResumeData,
  TemplateConfig
} from '../models/resume.model';
import { CANONICAL_SECTION_TITLES } from '../models/template-config.model';
import { FormSection } from '../models/section-nav.config';

/**
 * Resolves dynamic section heading based on user customization, falling back to canonical standard.
 */
export function getSectionHeading(sectionId: FormSection | string, config?: TemplateConfig): string {
  if (config?.sectionTitles && (config.sectionTitles as any)[sectionId]) {
    const custom = (config.sectionTitles as any)[sectionId]?.trim();
    if (custom) return custom;
  }
  return (CANONICAL_SECTION_TITLES as any)[sectionId] || sectionId;
}

/**
 * Helper to compute Typst margin rules based on user layout density setting
 */
export function getTypstMargin(config?: TemplateConfig): string {
  const density = config?.density || 'normal';
  if (density === 'compact') {
    return '(x: 0.30in, top: 0.28in, bottom: 0.28in)';
  }
  if (density === 'relaxed') {
    return '(x: 0.50in, top: 0.45in, bottom: 0.45in)';
  }
  return '(x: 0.38in, top: 0.35in, bottom: 0.35in)';
}

/**
 * Helper to compute body text size based on user font scaling setting
 */
export function getTypstFontSize(basePt = 10, config?: TemplateConfig): string {
  const scale = config?.fontSize || 'regular';
  if (scale === 'small') return `${basePt - 0.75}pt`;
  if (scale === 'large') return `${basePt + 1}pt`;
  return `${basePt}pt`;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_FULL_MAP: Record<string, string> = {
  january: 'Jan', jan: 'Jan',
  february: 'Feb', feb: 'Feb',
  march: 'Mar', mar: 'Mar',
  april: 'Apr', apr: 'Apr',
  may: 'May',
  june: 'Jun', jun: 'Jun',
  july: 'Jul', jul: 'Jul',
  august: 'Aug', aug: 'Aug',
  september: 'Sep', sep: 'Sep', sept: 'Sep',
  october: 'Oct', oct: 'Oct',
  november: 'Nov', nov: 'Nov',
  december: 'Dec', dec: 'Dec'
};

/**
 * Normalizes user-input dates (e.g. "2025-10", "2025-10-15", "10/2025", "October 2025", "2025")
 * into standard human-friendly resume format like "Oct 2025", while safely handling "Present" or "Current".
 */
export function formatResumeDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  const lower = trimmed.toLowerCase();
  if (lower === 'present' || lower === 'current' || lower === 'now') {
    return 'Present';
  }

  // 1. ISO format: YYYY-MM or YYYY-MM-DD (e.g. "2025-10", "2025-10-01")
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.]\d{1,2})?$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const monthNum = parseInt(ymdMatch[2], 10);
    if (monthNum >= 1 && monthNum <= 12) {
      return `${MONTH_NAMES[monthNum - 1]} ${year}`;
    }
    return trimmed;
  }

  // 2. Month-Year numeric: MM/YYYY or MM-YYYY (e.g. "10/2025", "10-2025")
  const myMatch = trimmed.match(/^(\d{1,2})[-/.](\d{4})$/);
  if (myMatch) {
    const monthNum = parseInt(myMatch[1], 10);
    const year = myMatch[2];
    if (monthNum >= 1 && monthNum <= 12) {
      return `${MONTH_NAMES[monthNum - 1]} ${year}`;
    }
    return trimmed;
  }

  // 3. Named month format: "October 2025", "oct 2025", "Oct, 2025"
  const namedMatch = trimmed.match(/^([a-zA-Z]+)[,\s]+(\d{4})$/);
  if (namedMatch) {
    const rawMonth = namedMatch[1].toLowerCase();
    const year = namedMatch[2];
    const abbrev = MONTH_FULL_MAP[rawMonth];
    if (abbrev) {
      return `${abbrev} ${year}`;
    }
  }

  // 4. "2025 October"
  const revNamedMatch = trimmed.match(/^(\d{4})[,\s]+([a-zA-Z]+)$/);
  if (revNamedMatch) {
    const year = revNamedMatch[1];
    const rawMonth = revNamedMatch[2].toLowerCase();
    const abbrev = MONTH_FULL_MAP[rawMonth];
    if (abbrev) {
      return `${abbrev} ${year}`;
    }
  }

  // 5. Bare 4-digit year: "2025"
  if (/^\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  return trimmed;
}

/**
 * Formats a resume date range (e.g. "Oct 2025 – Present" or "Oct 2022 – Jun 2025")
 */
export function formatResumeDateRange(startDate?: string, endDate?: string, separator: string = '–'): string {
  const start = formatResumeDate(startDate);
  const end = formatResumeDate(endDate);

  if (start && end) {
    return `${start} ${separator} ${end}`;
  }
  if (start) {
    return `${start} ${separator} Present`;
  }
  if (end) {
    return end;
  }
  return '';
}

export function escapeTypst(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/@/g, '\\@')
    .replace(/#/g, '\\#')
    .replace(/\$/g, '\\$')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

export function formatUrl(url: string | undefined, label?: string): string {
  if (!url) return '';
  const cleanUrl = url.trim();
  const href = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
  const displayLabel = label || cleanUrl.replace(/^https?:\/\/(www\.)?/, '');
  return `#link("${href}")[${escapeTypst(displayLabel)}]`;
}

export function formatEmail(email: string | undefined): string {
  if (!email) return '';
  const cleanEmail = email.trim();
  return `#link("mailto:${cleanEmail}")[${escapeTypst(cleanEmail)}]`;
}

export function formatBullets(bullets: string[] | undefined): string {
  if (!bullets || bullets.length === 0) return '';
  return bullets
    .map(b => b.trim())
    .filter(b => b.length > 0)
    .map(b => {
      const clean = b.replace(/^[-*•\d.]\s*/, '');
      return `  - ${escapeTypst(clean)}`;
    })
    .join('\n');
}

export function wrapSectionHeading(sectionId: string, headingMarkup: string): string {
  return `#link("nav:section:${sectionId}")[${headingMarkup}]`;
}

export function wrapEntryItem(sectionId: string, itemId: string | undefined, itemMarkup: string): string {
  if (!itemId) return itemMarkup;
  return `#link("nav:entry:${sectionId}:${itemId}")[\n${itemMarkup}\n]`;
}

/**
 * Standard Sections Renderer for Languages, Interests, Volunteer, References
 */
export function renderExtraSections(d: ResumeData, config?: TemplateConfig): Record<string, string> {
  const hidden: any = d.hiddenSections || {};

  // Languages
  const langItems = (d.languages || []).map(l => {
    const fluency = l.fluency ? ` (#text(fill: rgb("64748b"))[${escapeTypst(l.fluency)}])` : '';
    const block = `- *${escapeTypst(l.language)}*${fluency}`;
    return l.id ? `#link("nav:entry:languages:${l.id}")[${block}]` : block;
  }).join('\n');

  const languagesSnippet = (!hidden['languages'] && d.languages?.length) ? `
#link("nav:section:languages")[== ${getSectionHeading('languages', config)}]
${langItems}
` : '';

  // Interests
  const interestItems = (d.interests || []).map(i => {
    const kws = i.keywords?.length ? `: ${escapeTypst(i.keywords.join(', '))}` : '';
    const block = `- *${escapeTypst(i.name)}*${kws}`;
    return i.id ? `#link("nav:entry:interests:${i.id}")[${block}]` : block;
  }).join('\n');

  const interestsSnippet = (!hidden['interests'] && d.interests?.length) ? `
#link("nav:section:interests")[== ${getSectionHeading('interests', config)}]
${interestItems}
` : '';

  // Volunteer
  const volunteerItems = (d.volunteer || []).map(v => {
    const dateStr = formatResumeDateRange(v.startDate, v.endDate, '—');
    const locStr = typeof v.location === 'object' && v.location
      ? [v.location.city, v.location.region].filter(Boolean).join(', ')
      : (typeof v.location === 'string' ? v.location : '');
    const fullLoc = locStr ? ` | ${escapeTypst(locStr)}` : '';
    const bullets = (v.highlights && v.highlights.length > 0) ? `\n${formatBullets(v.highlights)}` : '';
    const summary = v.summary ? `\n#text(style: "italic")[${escapeTypst(v.summary)}]` : '';
    const block = `#block(breakable: false)[#grid(
  columns: (1fr, auto),
  gutter: 8pt,
  align: (left, right),
  [*${escapeTypst(v.position)}*, ${escapeTypst(v.organization)}${fullLoc}],
  [${escapeTypst(dateStr)}]
)${summary}${bullets}]`;
    return v.id ? `#link("nav:entry:volunteer:${v.id}")[${block}]` : block;
  }).join('\n\n');

  const volunteerSnippet = (!hidden['volunteer'] && d.volunteer?.length) ? `
#link("nav:section:volunteer")[== ${getSectionHeading('volunteer', config)}]
${volunteerItems}
` : '';

  // References
  const refItems = (d.references || []).map(r => {
    const orgStr = r.organization ? ` (${escapeTypst(r.organization)})` : '';
    const relStr = r.relationship ? ` — _${escapeTypst(r.relationship)}_` : '';
    const block = `#block(breakable: false)[*${escapeTypst(r.name)}*${orgStr}${relStr}
#text(style: "italic", fill: rgb("475569"))["${escapeTypst(r.reference.trim())}"]]`;
    return r.id ? `#link("nav:entry:references:${r.id}")[${block}]` : block;
  }).join('\n\n');

  const referencesSnippet = (!hidden['references'] && d.references?.length) ? `
#link("nav:section:references")[== ${getSectionHeading('references', config)}]
${refItems}
` : '';

  return {
    languages: languagesSnippet,
    interests: interestsSnippet,
    volunteer: volunteerSnippet,
    references: referencesSnippet
  };
}

export * from './nav-link-stripper';

export interface ResumeTemplate {
  readonly id: string;
  readonly name: string;
  readonly defaultPrimaryColor?: string;
  readonly metadata?: {
    credit?: string;
    description?: string;
    previewImg?: string;
    tags?: string[];
  };
  render(data: ResumeData, config?: TemplateConfig, sectionOrder?: string[]): string;
}
