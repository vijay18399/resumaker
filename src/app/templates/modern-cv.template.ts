import { ResumeData, TemplateConfig } from '../models/resume.model';
import { renderExtraSections, ResumeTemplate, escapeTypst, formatEmail, formatUrl, formatBullets, formatResumeDate, formatResumeDateRange, getSectionHeading, getTypstMargin, getTypstFontSize } from './template.interface';

/**
 * Modern CV Template
 * Faithful Typst reproduction of the famous Awesome-CV style (ptsouchlos/modern-cv).
 */
export class ModernCvTemplate implements ResumeTemplate {
  readonly id = 'modern_cv';
  readonly name = 'Modern CV';
  readonly defaultPrimaryColor = '#dc3545';
  readonly metadata = {
    credit: 'Inspired by Awesome-CV (@preview/modern-cv by Paul Tsouchlos)',
    description: 'Awesome-CV styled layout with dual-tone section headers, clean date alignment, and crimson accents.',
    previewImg: 'templates/2.png',
    tags: ['Awesome-CV', 'Popular', 'Modern']
  };

  render(d: ResumeData, config?: TemplateConfig, sectionOrder?: string[]): string {
    const b = d.basics || { name: '' };
    const hidden = d.hiddenSections || {};
    const accentColor = config?.accentColor || config?.primaryColor ? `rgb("${config.accentColor || config.primaryColor}")` : 'rgb("dc3545")'; // Awesome-CV Crimson Red

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
    const contactLine = contactLinks.join('  #text(8pt, fill: rgb("94a3b8"))[•]  ');

    const expItems = (d.work || []).map(exp => {
      const dateStr = formatResumeDateRange(exp.startDate, exp.endDate, '–');
      const summaryStr = exp.summary?.trim() ? `\n#v(1pt)\n#text(style: "italic", fill: rgb("475569"))[${escapeTypst(exp.summary)}]\n#v(1pt)` : '';
      const bulletsStr = (exp.highlights && exp.highlights.length > 0)
        ? `\n${formatBullets(exp.highlights)}`
        : '';

      const block = `#block(breakable: false)[#resume-entry(
  title: "${escapeTypst(exp.position)}",
  location: "${escapeTypst(exp.location || '')}",
  description: "${escapeTypst(exp.name)}",
  date: "${escapeTypst(dateStr)}"
)${summaryStr}${bulletsStr}]`;
      return exp.id ? `#link("nav:entry:work:${exp.id}")[${block}]` : block;
    }).join('\n\n#v(4pt)\n\n');

    const eduItems = (d.education || []).map(edu => {
      const dateStr = formatResumeDateRange(edu.startDate, edu.endDate, '–');
      const degreeStr = [edu.studyType, edu.area].filter(Boolean).join(' in ');
      const gpaStr = edu.score ? ` (${escapeTypst(edu.score)})` : '';
      const block = `#block(breakable: false)[#resume-entry(
  title: "${escapeTypst(edu.institution)}",
  location: "",
  date: "${escapeTypst(dateStr)}",
  description: "${escapeTypst(degreeStr)}${gpaStr}"
)]`;
      return edu.id ? `#link("nav:entry:education:${edu.id}")[${block}]` : block;
    }).join('\n\n');

    const projItems = (d.projects || []).map(proj => {
      const dateStr = formatResumeDateRange(proj.startDate, proj.endDate, '–');
      const bulletsStr = (proj.highlights && proj.highlights.length > 0)
        ? `\n${formatBullets(proj.highlights)}`
        : '';
      const techStr = (proj.keywords && proj.keywords.length > 0) ? ` | ${proj.keywords.join(', ')}` : '';
      const roleStr = proj.description || proj.summary || '';
      const block = `#block(breakable: false)[#resume-entry(
  title: "${escapeTypst(proj.name)}",
  location: "${escapeTypst(techStr)}",
  date: "${escapeTypst(dateStr)}",
  description: "${escapeTypst(roleStr)}"
)${bulletsStr}]`;
      return proj.id ? `#link("nav:entry:projects:${proj.id}")[${block}]` : block;
    }).join('\n\n');

    const skillsItems = (d.skills || []).map(s => {
      const kws = (s.keywords || []).join(', ');
      const block = `#block(breakable: false)[#grid(
  columns: (120pt, 1fr),
  gutter: 12pt,
  [*${escapeTypst(s.name)}*],
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

    // Modern CV specific styling for Extra Sections
    const langItems = (d.languages || []).map(l => {
      const fluency = l.fluency ? ` (#text(fill: ${accentColor})[${escapeTypst(l.fluency)}])` : '';
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
      const bullets = (v.highlights && v.highlights.length > 0) ? `\n${formatBullets(v.highlights)}` : '';
      const block = `#resume-entry(
  title: "${escapeTypst(v.position)}",
  location: "${escapeTypst(locStr)}",
  description: "${escapeTypst(v.organization)}",
  date: "${escapeTypst(dateStr)}"
)${bullets}`;
      return v.id ? `#link("nav:entry:volunteer:${v.id}")[${block}]` : block;
    }).join('\n\n');

    const refItems = (d.references || []).map(r => {
      const orgStr = r.organization ? ` (${escapeTypst(r.organization)})` : '';
      const relStr = r.relationship ? ` — _${escapeTypst(r.relationship)}_` : '';
      const block = `*${escapeTypst(r.name)}*${orgStr}${relStr}
#text(style: "italic", fill: rgb("475569"))["${escapeTypst(r.reference.trim())}"]`;
      return r.id ? `#link("nav:entry:references:${r.id}")[${block}]` : block;
    }).join('\n\n');

    const snippets: Record<string, string> = {
      languages: !hidden['languages'] && d.languages?.length ? `
#link("nav:section:languages")[#resume-section("${getSectionHeading('languages', config)}")]
${langItems}
` : '',
      interests: !hidden['interests'] && d.interests?.length ? `
#link("nav:section:interests")[#resume-section("${getSectionHeading('interests', config)}")]
${interestItems}
` : '',
      volunteer: !hidden['volunteer'] && d.volunteer?.length ? `
#link("nav:section:volunteer")[#resume-section("${getSectionHeading('volunteer', config)}")]
${volunteerItems}
` : '',
      references: !hidden['references'] && d.references?.length ? `
#link("nav:section:references")[#resume-section("${getSectionHeading('references', config)}")]
${refItems}
` : '',
      summary: !hidden['basics'] && b.summary?.trim() ? `
#link("nav:section:summary")[#resume-section("${getSectionHeading('summary', config)}")]
#link("nav:section:summary")[${escapeTypst(b.summary)}]
` : '',
      work: !hidden['work'] && d.work?.length ? `
#link("nav:section:work")[#resume-section("${getSectionHeading('work', config)}")]
${expItems}
` : '',
      projects: !hidden['projects'] && d.projects?.length ? `
#link("nav:section:projects")[#resume-section("${getSectionHeading('projects', config)}")]
${projItems}
` : '',
      skills: !hidden['skills'] && d.skills?.length ? `
#block(breakable: false)[
#link("nav:section:skills")[#resume-section("${getSectionHeading('skills', config)}")]
${skillsItems}
]
` : '',
      education: !hidden['education'] && d.education?.length ? `
#link("nav:section:education")[#resume-section("${getSectionHeading('education', config)}")]
${eduItems}
` : '',
      certificates: !hidden['certificates'] && d.certificates?.length ? `
#link("nav:section:certificates")[#resume-section("${getSectionHeading('certificates', config)}")]
${certItems}
` : '',
      awards: !hidden['awards'] && d.awards?.length ? `
#link("nav:section:awards")[#resume-section("${getSectionHeading('awards', config)}")]
${awardItems}
` : ''
    };

    const defaultOrder = ['summary', 'work', 'projects', 'skills', 'education', 'certificates', 'awards', 'languages', 'interests', 'volunteer', 'references'];
    const effectiveOrder = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

    const renderedSections = effectiveOrder
      .map(id => snippets[id] || '')
      .filter(s => s.trim().length > 0)
      .join('\n');

    const paperSize = config?.paperSize || 'a4';
    const margin = config?.density === 'compact'
      ? '(x: 0.7cm, top: 0.65cm, bottom: 0.65cm)'
      : (config?.density === 'relaxed' ? '(x: 1.1cm, top: 1.05cm, bottom: 1.05cm)' : '(x: 0.9cm, top: 0.85cm, bottom: 0.85cm)');
    const fontSize = getTypstFontSize(10.5, config);

    return `// ==========================================
// Modern CV Template (Awesome-CV Style)
// ==========================================

#set page(
  paper: "${paperSize}",
  margin: ${margin}
)

#set text(
  font: "Liberation Sans",
  size: ${fontSize},
  fill: rgb("2b2b2b"),
  spacing: 105%
)

#set par(justify: true, leading: 0.6em)
#set list(marker: ([•]), spacing: 4.5pt, body-indent: 4pt, indent: 0pt)

// Section Heading Rule (Awesome-CV style: first 3 letters colored, sticky to prevent orphan headers)
#let resume-section(title) = {
  block(sticky: true)[
    #v(5pt)
    #let title-len = title.len()
    #let split-idx = calc.min(3, title-len)
    #let prefix = title.slice(0, split-idx)
    #let suffix = title.slice(split-idx)

    #text(size: 13pt, weight: "bold")[
      #text(fill: ${accentColor})[#prefix]#text(fill: rgb("2b2b2b"))[#suffix]
    ]
    #v(-4pt)
    #line(length: 100%, stroke: 0.5pt + rgb("cbd5e1"))
    #v(2.5pt)
  ]
}

#let resume-entry(
  title: "",
  location: "",
  date: "",
  description: ""
) = {
  grid(
    columns: (1fr, auto),
    gutter: 4pt,
    [*#title*], [#text(fill: rgb("64748b"), size: 9.5pt)[#date]],
    [#text(fill: ${accentColor}, style: "italic")[#description]], [#text(fill: rgb("94a3b8"), size: 9.5pt)[#location]]
  )
}

// Header
#align(center)[#link("nav:section:basics")[
  #text(22pt, weight: "light", fill: rgb("475569"))[${escapeTypst(b.name)}] \\
  #if "${escapeTypst(b.label || '')}" != "" [
    #v(1pt)
    #text(10.5pt, weight: "bold", fill: ${accentColor})[#upper("${escapeTypst(b.label || '')}")] \\
  ]
  #v(1.5pt)
  #text(9.5pt, fill: rgb("64748b"))[${contactLine}]
]]

${renderedSections}
`;
  }
}
