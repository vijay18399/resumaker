import { ResumeData, TemplateConfig } from '../models/resume.model';
import { renderExtraSections, ResumeTemplate, escapeTypst, formatEmail, formatUrl, formatBullets, formatResumeDate, formatResumeDateRange, getSectionHeading, getTypstMargin, getTypstFontSize } from './template.interface';

/**
 * Modern Resume Template
 * Inspired by @preview/modern-resume
 */
export class ModernResumeTemplate implements ResumeTemplate {
  readonly id = 'modern_resume';
  readonly name = 'Modern Resume';
  readonly defaultPrimaryColor = '#0d9488';
  readonly metadata = {
    credit: 'Inspired by @preview/modern-resume',
    description: 'Clean header bar with subtle teal accents and left-rail line for elegant section separation.',
    previewImg: 'templates/7.png',
    tags: ['Teal Accent', 'Modern', 'Clean']
  };

  render(d: ResumeData, config?: TemplateConfig, sectionOrder?: string[]): string {
    const b = d.basics || { name: '' };
    const hidden = d.hiddenSections || {};
    const tealColor = config?.accentColor || config?.primaryColor ? `rgb("${config.accentColor || config.primaryColor}")` : 'rgb("0d9488")'; // Teal Accent

    const locStr = b.location
      ? [b.location.city, b.location.region, b.location.countryCode].filter(Boolean).join(', ')
      : '';

    const linkedin = b.profiles?.find(p => p.network?.toLowerCase().includes('linkedin'))?.url || '';
    const github = b.profiles?.find(p => p.network?.toLowerCase().includes('github'))?.url || '';
    const portfolio = b.profiles?.find(p => p.network?.toLowerCase().includes('portfolio'))?.url || b.url || '';

    const contactLinks: string[] = [];
    if (locStr) contactLinks.push(escapeTypst(locStr));
    if (b.phone) contactLinks.push(escapeTypst(b.phone));
    if (b.email) contactLinks.push(formatEmail(b.email));
    if (linkedin) contactLinks.push(formatUrl(linkedin, 'LinkedIn'));
    if (github) contactLinks.push(formatUrl(github, 'GitHub'));
    if (portfolio) contactLinks.push(formatUrl(portfolio, 'Portfolio'));
    const contactLine = contactLinks.join('  •  ');

    const expItems = (d.work || []).map(exp => {
      const dateStr = formatResumeDateRange(exp.startDate, exp.endDate, '–');
      const summaryStr = exp.summary?.trim() ? `\n#v(1pt)\n#text(style: "italic", fill: rgb("475569"))[${escapeTypst(exp.summary)}]\n#v(1pt)` : '';
      const bulletsStr = (exp.highlights && exp.highlights.length > 0)
        ? `\n${formatBullets(exp.highlights)}`
        : '';

      const block = `#block(breakable: false)[#grid(
  columns: (1fr, auto),
  gutter: 6pt,
  [*${escapeTypst(exp.position)}*, #text(fill: ${tealColor})[${escapeTypst(exp.name)}]],
  [#text(fill: rgb("64748b"))[${escapeTypst(dateStr)}]]
)${summaryStr}${bulletsStr}]`;
      return exp.id ? `#link("nav:entry:work:${exp.id}")[${block}]` : block;
    }).join('\n\n#v(4pt)\n\n');

    const eduItems = (d.education || []).map(edu => {
      const dateStr = formatResumeDateRange(edu.startDate, edu.endDate, '–');
      const degreeStr = [edu.studyType, edu.area].filter(Boolean).join(' in ');
      const gpaStr = edu.score ? ` (GPA: ${escapeTypst(edu.score)})` : '';
      const block = `#block(breakable: false)[#grid(
  columns: (1fr, auto),
  gutter: 6pt,
  [*${escapeTypst(edu.institution)}*, ${escapeTypst(degreeStr)}${gpaStr}],
  [#text(fill: rgb("64748b"))[${escapeTypst(dateStr)}]]
)]`;
      return edu.id ? `#link("nav:entry:education:${edu.id}")[${block}]` : block;
    }).join('\n\n');

    const projItems = (d.projects || []).map(proj => {
      const dateStr = formatResumeDateRange(proj.startDate, proj.endDate, '–');
      const bulletsStr = (proj.highlights && proj.highlights.length > 0)
        ? `\n${formatBullets(proj.highlights)}`
        : '';
      const techKeywords = (proj.keywords && proj.keywords.length > 0) ? escapeTypst(proj.keywords.join(', ')) : '';
      const techPart = techKeywords ? ` #text(fill: rgb("64748b"))[(${techKeywords})]` : '';
      const block = `#block(breakable: false)[#grid(
  columns: (1fr, auto),
  gutter: 6pt,
  [*${escapeTypst(proj.name)}*${techPart}],
  [#text(fill: rgb("64748b"))[${escapeTypst(dateStr)}]]
)${bulletsStr}]`;
      return proj.id ? `#link("nav:entry:projects:${proj.id}")[${block}]` : block;
    }).join('\n\n');

    const skillsItems = (d.skills || []).map(s => {
      const kws = (s.keywords || []).join(', ');
      const block = `#block(breakable: false)[#grid(
  columns: (auto, 1fr),
  gutter: 8pt,
  [*${escapeTypst(s.name)}:*],
  [${escapeTypst(kws)}]
)]`;
      return s.id ? `#link("nav:entry:skills:${s.id}")[${block}]` : block;
    }).join('\n\n#v(0.2pt)\n\n');

    const certItems = (d.certificates || []).map(c => {
      const dateStr = c.date ? ` (${escapeTypst(formatResumeDate(c.date))})` : '';
      const link = c.url ? ` ${formatUrl(c.url, 'Credential')}` : '';
      const block = `#block(breakable: false)[- *${escapeTypst(c.name)}* — ${escapeTypst(c.issuer || '')}${dateStr}${link}]`;
      return c.id ? `#link("nav:entry:certificates:${c.id}")[${block}]` : block;
    }).join('\n');

    const awardItems = (d.awards || []).map(a => {
      const dateStr = a.date ? ` (${escapeTypst(formatResumeDate(a.date))})` : '';
      const desc = a.summary ? `: ${escapeTypst(a.summary)}` : '';
      const block = `#block(breakable: false)[- *${escapeTypst(a.title)}* — ${escapeTypst(a.awarder || '')}${dateStr}${desc}]`;
      return a.id ? `#link("nav:entry:awards:${a.id}")[${block}]` : block;
    }).join('\n');

    // Modern Resume native teal styling for Extra Sections
    const langItems = (d.languages || []).map(l => {
      const fluency = l.fluency ? ` (#text(fill: ${tealColor})[${escapeTypst(l.fluency)}])` : '';
      const block = `- *${escapeTypst(l.language)}*${fluency}`;
      return l.id ? `#link("nav:entry:languages:${l.id}")[${block}]` : block;
    }).join('\n');

    const interestItems = (d.interests || []).map(i => {
      const kws = i.keywords?.length ? `: ${escapeTypst(i.keywords.join(', '))}` : '';
      const block = `- *${escapeTypst(i.name)}*${kws}`;
      return i.id ? `#link("nav:entry:interests:${i.id}")[${block}]` : block;
    }).join('\n');

    const volunteerItems = (d.volunteer || []).map(v => {
      const dateStr = formatResumeDateRange(v.startDate, v.endDate, '–');
      const locStr = typeof v.location === 'object' && v.location
        ? [v.location.city, v.location.region].filter(Boolean).join(', ')
        : (typeof v.location === 'string' ? v.location : '');
      const fullLoc = locStr ? ` | ${escapeTypst(locStr)}` : '';
      const bullets = (v.highlights && v.highlights.length > 0) ? `\n${formatBullets(v.highlights)}` : '';
      const block = `#block(breakable: false)[#grid(
  columns: (1fr, auto),
  gutter: 6pt,
  [*${escapeTypst(v.position)}*, #text(fill: ${tealColor})[${escapeTypst(v.organization)}]${fullLoc}],
  [#text(fill: rgb("64748b"))[${escapeTypst(dateStr)}]]
)${bullets}]`;
      return v.id ? `#link("nav:entry:volunteer:${v.id}")[${block}]` : block;
    }).join('\n\n');

    const refItems = (d.references || []).map(r => {
      const orgStr = r.organization ? ` (${escapeTypst(r.organization)})` : '';
      const relStr = r.relationship ? ` — _${escapeTypst(r.relationship)}_` : '';
      const block = `#block(breakable: false)[*${escapeTypst(r.name)}*${orgStr}${relStr}
#text(style: "italic", fill: rgb("475569"))["${escapeTypst(r.reference.trim())}"]]`;
      return r.id ? `#link("nav:entry:references:${r.id}")[${block}]` : block;
    }).join('\n\n');

    const snippets: Record<string, string> = {
      languages: !hidden['languages'] && d.languages?.length ? `
#link("nav:section:languages")[== ${getSectionHeading('languages', config)}]
${langItems}
` : '',
      interests: !hidden['interests'] && d.interests?.length ? `
#link("nav:section:interests")[== ${getSectionHeading('interests', config)}]
${interestItems}
` : '',
      volunteer: !hidden['volunteer'] && d.volunteer?.length ? `
#link("nav:section:volunteer")[== ${getSectionHeading('volunteer', config)}]
${volunteerItems}
` : '',
      references: !hidden['references'] && d.references?.length ? `
#link("nav:section:references")[== ${getSectionHeading('references', config)}]
${refItems}
` : '',
      summary: !hidden['basics'] && b.summary?.trim() ? `
#link("nav:section:summary")[== ${getSectionHeading('summary', config)}]
#link("nav:section:summary")[${escapeTypst(b.summary)}]
` : '',
      work: !hidden['work'] && d.work?.length ? `
#link("nav:section:work")[== ${getSectionHeading('work', config)}]
${expItems}
` : '',
      projects: !hidden['projects'] && d.projects?.length ? `
#link("nav:section:projects")[== ${getSectionHeading('projects', config)}]
${projItems}
` : '',
      skills: !hidden['skills'] && d.skills?.length ? `
#block(breakable: false)[
#link("nav:section:skills")[== ${getSectionHeading('skills', config)}]
${skillsItems}
]
` : '',
      education: !hidden['education'] && d.education?.length ? `
#link("nav:section:education")[== ${getSectionHeading('education', config)}]
${eduItems}
` : '',
      certificates: !hidden['certificates'] && d.certificates?.length ? `
#link("nav:section:certificates")[== ${getSectionHeading('certificates', config)}]
${certItems}
` : '',
      awards: !hidden['awards'] && d.awards?.length ? `
#link("nav:section:awards")[== ${getSectionHeading('awards', config)}]
${awardItems}
` : ''
    };

    const defaultOrder = ['summary', 'work', 'projects', 'skills', 'education', 'certificates', 'awards', 'languages', 'interests', 'volunteer', 'references'];
    const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

    const renderedSections = effectiveOrder
      .map(id => snippets[id] || '')
      .filter(s => s.trim().length > 0)
      .join('\n');

    const paperSize = config?.paperSize || 'us-letter';
    const margin = getTypstMargin(config);
    const fontSize = getTypstFontSize(10.5, config);

    return `// ==========================================
// Modern Resume Template
// ==========================================

#set page(
  paper: "${paperSize}",
  margin: ${margin}
)

#set text(
  font: "Liberation Sans",
  size: ${fontSize},
  fill: rgb("1e293b"),
  spacing: 104%
)

#set par(justify: true, leading: 0.6em)
#set list(marker: ([•]), spacing: 4.5pt, body-indent: 4pt, indent: 0pt)

// Section Heading Rule
#show heading: set block(sticky: true)
#show heading.where(level: 2): it => block(sticky: true)[
  #v(5pt)
  #text(fill: ${tealColor}, weight: "bold", size: 12.5pt)[#upper(it.body)]
  #v(-3pt)
  #line(length: 100%, stroke: 0.8pt + ${tealColor})
  #v(2pt)
]

// Header
#align(left)[#link("nav:section:basics")[
  #text(22pt, weight: "bold", fill: rgb("0f172a"))[${escapeTypst(b.name)}] \\
  #if "${escapeTypst(b.label || '')}" != "" [
    #v(1pt)
    #text(11pt, weight: "medium", fill: ${tealColor})[${escapeTypst(b.label || '')}] \\
  ]
  #v(1.5pt)
  #text(9.5pt, fill: rgb("64748b"))[${contactLine}]
]]

${renderedSections}
`;
  }
}
