import { ResumeData, TemplateConfig } from '../models/resume.model';
import { renderExtraSections, ResumeTemplate, escapeTypst, formatEmail, formatUrl, formatBullets, formatResumeDate, formatResumeDateRange, formatProfileLinks, formatEducationScore, getSectionHeading, getTypstMargin, getTypstFontSize } from './template.interface';

/**
 * Basic Resume Template
 * Direct faithful implementation of @preview/basic-resume (Stephen Xu)
 * Public Domain (The Unlicense)
 */
export class BasicResumeTemplate implements ResumeTemplate {
  readonly id = 'basic_resume';
  readonly name = 'Basic Resume';
  readonly defaultPrimaryColor = '#0f172a';
  readonly metadata = {
    credit: 'Stephen Xu (@preview/basic-resume)',
    description: 'Clean, high-density, ATS-optimized resume standard with left-aligned header and smallcaps section dividers.',
    previewImg: 'templates/1.jpg',
    tags: ['ATS-Friendly', 'Minimalist', 'Tech']
  };

  render(d: ResumeData, config?: TemplateConfig, sectionOrder?: string[]): string {
    const b = d.basics || { name: '' };
    const hidden = d.hiddenSections || {};

    const locStr = b.location
      ? [b.location.city, b.location.region, b.location.countryCode].filter(Boolean).join(', ')
      : '';

    const contactLinks: string[] = [];
    if (locStr) contactLinks.push(escapeTypst(locStr));
    if (b.phone) contactLinks.push(escapeTypst(b.phone));
    if (b.email) contactLinks.push(formatEmail(b.email));
    contactLinks.push(...formatProfileLinks(b.profiles, b.url));
    const contactLine = contactLinks.join('  #text(8pt, fill: rgb("94a3b8"))[•]  ');

    const expItems = (d.work || []).map(exp => {
      const dateStr = formatResumeDateRange(exp.startDate, exp.endDate, '—');
      const summaryStr = exp.summary?.trim() ? `\n#v(1pt)\n#text(style: "italic", fill: rgb("334155"))[${escapeTypst(exp.summary)}]\n#v(1pt)` : '';
      const bulletsStr = (exp.highlights && exp.highlights.length > 0)
        ? `\n${formatBullets(exp.highlights)}`
        : '';

      const workBlock = `#block(breakable: false)[#work(
  title: "${escapeTypst(exp.position)}",
  company: "${escapeTypst(exp.name)}",
  location: "${escapeTypst(exp.location || '')}",
  dates: "${escapeTypst(dateStr)}"
)${summaryStr}${bulletsStr}]`;

      return exp.id ? `#link("nav:entry:work:${exp.id}")[${workBlock}]` : workBlock;
    }).join('\n\n#v(4pt)\n\n');

    const eduItems = (d.education || []).map(edu => {
      const dateStr = formatResumeDateRange(edu.startDate, edu.endDate, '—');
      const degreeStr = [edu.studyType, edu.area].filter(Boolean).join(' in ');
      const gpaStr = formatEducationScore(edu.score);
      const block = `#block(breakable: false)[#edu(
  institution: "${escapeTypst(edu.institution)}",
  degree: "${escapeTypst(degreeStr)}${gpaStr}",
  dates: "${escapeTypst(dateStr)}",
  location: ""
)]`;
      return edu.id ? `#link("nav:entry:education:${edu.id}")[${block}]` : block;
    }).join('\n\n');

    const projItems = (d.projects || []).map(proj => {
      const dateStr = formatResumeDateRange(proj.startDate, proj.endDate, '—');
      const roleStr = proj.description || proj.summary || '';
      const techStr = (proj.keywords && proj.keywords.length > 0) ? proj.keywords.join(', ') : '';
      const bulletsStr = (proj.highlights && proj.highlights.length > 0)
        ? `\n${formatBullets(proj.highlights)}`
        : '';

      const block = `#block(breakable: false)[#project(
  title: "${escapeTypst(proj.name)}",
  role: "${escapeTypst(roleStr)}",
  tech: "${escapeTypst(techStr)}",
  url: "${proj.url || ''}",
  dates: "${escapeTypst(dateStr)}"
)${bulletsStr}]`;

      return proj.id ? `#link("nav:entry:projects:${proj.id}")[${block}]` : block;
    }).join('\n\n');

    const skillsItems = (d.skills || []).map(s => {
      const kws = (s.keywords || []).join(', ');
      const block = `#block(breakable: false)[  - *${escapeTypst(s.name)}:* ${escapeTypst(kws)}]`;
      return s.id ? `#link("nav:entry:skills:${s.id}")[${block}]` : block;
    }).join('\n#v(0.2pt)\n');

    const certItems = (d.certificates || []).map(c => {
      const dateStr = c.date ? ` (${escapeTypst(formatResumeDate(c.date))})` : '';
      const link = c.url ? ` ${formatUrl(c.url, 'Credential')}` : '';
      const block = `#block(breakable: false)[  - *${escapeTypst(c.name)}* — ${escapeTypst(c.issuer || '')}${dateStr}${link}]`;
      return c.id ? `#link("nav:entry:certificates:${c.id}")[${block}]` : block;
    }).join('\n');

    const awardItems = (d.awards || []).map(a => {
      const dateStr = a.date ? ` (${escapeTypst(formatResumeDate(a.date))})` : '';
      const desc = a.summary ? `: ${escapeTypst(a.summary)}` : '';
      const block = `#block(breakable: false)[  - *${escapeTypst(a.title)}* — ${escapeTypst(a.awarder || '')}${dateStr}${desc}]`;
      return a.id ? `#link("nav:entry:awards:${a.id}")[${block}]` : block;
    }).join('\n');

    const extraSnippets = renderExtraSections(d, config);

    const snippets: Record<string, string> = {
      languages: extraSnippets['languages'] || '',
      interests: extraSnippets['interests'] || '',
      volunteer: extraSnippets['volunteer'] || '',
      references: extraSnippets['references'] || '',
      summary: !hidden['summary'] && b.summary?.trim() ? `
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
    const primaryColor = config?.accentColor || config?.primaryColor || '#0f172a';

    return `// ==========================================
// Basic Resume Template (@preview/basic-resume)
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

// Section Heading Rule (Sticky to prevent orphan headers)
#show heading: set block(sticky: true)
#show heading.where(level: 2): it => block(sticky: true)[
  #v(5pt)
  #text(fill: rgb("${primaryColor}"), weight: "bold", size: 12.5pt)[#smallcaps(it.body)]
  #v(-3pt)
  #line(length: 100%, stroke: 0.8pt + rgb("${primaryColor}"))
  #v(2pt)
]

// Work Entry Layout Function
#let work(title: "", company: "", location: "", dates: "") = {
  grid(
    columns: (1fr, auto),
    gutter: 8pt,
    align: (left, right),
    [*#title*, #company],
    [#dates]
  )
}

// Education Entry Layout Function
#let edu(institution: "", degree: "", dates: "", location: "") = {
  grid(
    columns: (1fr, auto),
    gutter: 8pt,
    align: (left, right),
    [*#institution*, #degree],
    [#dates]
  )
}

// Project Entry Layout Function
#let project(title: "", role: "", tech: "", url: "", dates: "") = {
  let mainTitle = if url != "" {
    link(url)[*#title*]
  } else {
    [*#title*]
  }
  let rolePart = if role != "" { [, #role] } else { [] }
  let techPart = if tech != "" { [ (#tech)] } else { [] }

  grid(
    columns: (1fr, auto),
    gutter: 8pt,
    align: (left, right),
    [#mainTitle#rolePart#techPart],
    [#dates]
  )
}

// Header
#align(left)[#link("nav:section:basics")[
  #text(21pt, weight: "bold", fill: rgb("${primaryColor}"))[${escapeTypst(b.name)}] \\
  #if "${escapeTypst(b.label || '')}" != "" [
    #v(1pt)
    #text(11pt, weight: "medium", fill: rgb("475569"))[${escapeTypst(b.label || '')}] \\
  ]
  #v(1.5pt)
  #text(9.5pt, fill: rgb("64748b"))[${contactLine}]
]]

${renderedSections}
`;
  }
}
