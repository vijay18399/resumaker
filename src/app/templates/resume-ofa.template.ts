import { ResumeData, TemplateConfig } from '../models/resume.model';
import { renderExtraSections, ResumeTemplate, escapeTypst, formatEmail, formatUrl, formatBullets, formatResumeDate, formatResumeDateRange, getSectionHeading, getTypstMargin, getTypstFontSize } from './template.interface';

/**
 * Resume OFA ("One For All") Template
 * Direct faithful implementation of @preview/resume-ofa
 */
export class ResumeOfaTemplate implements ResumeTemplate {
  readonly id = 'resume_ofa';
  readonly name = 'Resume OFA';
  readonly defaultPrimaryColor = '#0f172a';
  readonly metadata = {
    credit: 'Inspired by @preview/resume-ofa',
    description: 'Classic Computer Modern serif typography for academia, research, and traditional corporate standards.',
    previewImg: 'templates/8.png',
    tags: ['Academic', 'Classic', 'Serif']
  };

  render(d: ResumeData, config?: TemplateConfig, sectionOrder?: string[]): string {
    const b = d.basics || { name: '' };
    const hidden = d.hiddenSections || {};
    const primaryColor = config?.accentColor || config?.primaryColor || '#0f172a';

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
  [*${escapeTypst(exp.position)}*, ${escapeTypst(exp.name)}],
  [#text(style: "italic")[${escapeTypst(dateStr)}]]
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
  [#text(style: "italic")[${escapeTypst(dateStr)}]]
)]`;
      return edu.id ? `#link("nav:entry:education:${edu.id}")[${block}]` : block;
    }).join('\n\n');

    const projItems = (d.projects || []).map(proj => {
      const dateStr = formatResumeDateRange(proj.startDate, proj.endDate, '–');
      const bulletsStr = (proj.highlights && proj.highlights.length > 0)
        ? `\n${formatBullets(proj.highlights)}`
        : '';
      const techStr = (proj.keywords && proj.keywords.length > 0) ? ` (${proj.keywords.join(', ')})` : '';
      const block = `#block(breakable: false)[#grid(
  columns: (1fr, auto),
  gutter: 6pt,
  [*${escapeTypst(proj.name)}*${escapeTypst(techStr)}],
  [#text(style: "italic")[${escapeTypst(dateStr)}]]
)${bulletsStr}]`;
      return proj.id ? `#link("nav:entry:projects:${proj.id}")[${block}]` : block;
    }).join('\n\n');

    const skillsItems = (d.skills || []).map(s => {
      const block = `#block(breakable: false)[#grid(
  columns: (auto, 1fr),
  gutter: 8pt,
  align: (left, left),
  [*${escapeTypst(s.name)}:*],
  [${escapeTypst(s.keywords.join(', '))}]
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

    const extraSnippets = renderExtraSections(d, config);

    const snippets: Record<string, string> = {
      languages: extraSnippets['languages'] || '',
      interests: extraSnippets['interests'] || '',
      volunteer: extraSnippets['volunteer'] || '',
      references: extraSnippets['references'] || '',
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
// Resume OFA ("One For All") Template
// ==========================================

#set page(
  paper: "${paperSize}",
  margin: ${margin}
)

#set text(
  font: "Liberation Sans",
  size: ${fontSize},
  fill: rgb("${primaryColor}"),
  spacing: 104%
)

#set par(justify: true, leading: 0.6em)
#set list(marker: ([•]), spacing: 4.5pt, body-indent: 4pt, indent: 0pt)

// Section Heading Rule
#show heading: set block(sticky: true)
#show heading.where(level: 2): it => block(sticky: true)[
  #v(5pt)
  #text(fill: rgb("${primaryColor}"), weight: "bold", size: 12.5pt)[#upper(it.body)]
  #v(-3pt)
  #line(length: 100%, stroke: 1pt + rgb("${primaryColor}"))
  #v(2pt)
]

// Header
#align(center)[#link("nav:section:basics")[
  #text(21pt, weight: "bold", fill: rgb("${primaryColor}"))[${escapeTypst(b.name)}] \\
  #if "${escapeTypst(b.label || '')}" != "" [
    #v(1pt)
    #text(10.5pt, weight: "medium", fill: rgb("475569"))[${escapeTypst(b.label || '')}] \\
  ]
  #v(1.5pt)
  #text(9.5pt, fill: rgb("64748b"))[${contactLine}]
]]

${renderedSections}
`;
  }
}
