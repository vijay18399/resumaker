import { stripInternalNavLinks } from './nav-link-stripper';
import { formatResumeDate, formatResumeDateRange, formatEducationScore } from './template.interface';
import { BasicResumeTemplate } from './basic-resume.template';
import { ModernCvTemplate } from './modern-cv.template';
import { ModernResumeTemplate } from './modern-resume.template';
import { ResumeOfaTemplate } from './resume-ofa.template';
import { SimpleTechnicalTemplate } from './simple-technical.template';
import { AtstheticCvTemplate } from './atsthetic-cv.template';
import { BrilliantCvTemplate } from './brilliant-cv.template';
import { GridCvTemplate } from './grid-cv.template';
import { ResumeData } from '../models/resume.model';

const mockData: ResumeData = {
  basics: {
    name: 'Jane Doe',
    label: 'Software Engineer',
    email: 'jane@example.com',
    phone: '123-456-7890',
    summary: 'Experienced engineer passionate about scalable systems.'
  },
  work: [
    {
      id: 'w1',
      name: 'Tech Corp',
      position: 'Senior Engineer',
      startDate: '2020',
      endDate: 'Present',
      highlights: ['Built distributed pipelines']
    }
  ],
  skills: [
    {
      id: 's1',
      name: 'Languages',
      keywords: ['TypeScript', 'Rust', 'Python']
    }
  ],
  education: [
    {
      id: 'e1',
      institution: 'State University',
      studyType: 'B.S.',
      area: 'Computer Science',
      startDate: '2016',
      endDate: '2020'
    }
  ],
  projects: [
    {
      id: 'p1',
      name: 'OpenSource App',
      description: 'Cloud dashboard',
      keywords: ['Angular', 'Node.js']
    }
  ],
  certificates: [
    {
      id: 'c1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon'
    }
  ],
  awards: [
    {
      id: 'a1',
      title: 'Top Innovator',
      awarder: 'Tech Awards'
    }
  ],
  languages: [
    {
      id: 'l1',
      language: 'English',
      fluency: 'Native'
    }
  ],
  interests: [
    {
      id: 'i1',
      name: 'Open Source',
      keywords: ['Typst', 'Rust']
    }
  ],
  volunteer: [
    {
      id: 'v1',
      organization: 'Tech Non-Profit',
      position: 'Mentor'
    }
  ],
  references: [
    {
      id: 'r1',
      name: 'John Smith',
      reference: 'Great engineer to work with.'
    }
  ]
};

describe('Date Formatter Utility', () => {
  it('should format ISO dates into Month Year', () => {
    expect(formatResumeDate('2025-10')).toBe('Oct 2025');
    expect(formatResumeDate('2022-08-15')).toBe('Aug 2022');
    expect(formatResumeDate('2020/06')).toBe('Jun 2020');
  });

  it('should format full month names into abbreviated Month Year', () => {
    expect(formatResumeDate('October 2025')).toBe('Oct 2025');
    expect(formatResumeDate('august 2022')).toBe('Aug 2022');
  });

  it('should format date ranges with Present correctly', () => {
    expect(formatResumeDateRange('2025-10', 'Present')).toBe('Oct 2025 – Present');
    expect(formatResumeDateRange('2022-08', '2025-07')).toBe('Aug 2022 – Jul 2025');
  });
});

describe('Nav Links and Stripper in Templates', () => {
  const templates = [
    new BasicResumeTemplate(),
    new ModernCvTemplate(),
    new ModernResumeTemplate(),
    new ResumeOfaTemplate(),
    new SimpleTechnicalTemplate(),
    new AtstheticCvTemplate(),
    new BrilliantCvTemplate(),
    new GridCvTemplate()
  ];

  templates.forEach(tpl => {
    describe(`Template: ${tpl.name}`, () => {
      it('should contain nav:section links for summary, work, skills, education, projects, certificates, awards', () => {
        const rendered = tpl.render(mockData);
        expect(rendered).toContain('nav:section:summary');
        expect(rendered).toContain('nav:section:work');
        expect(rendered).toContain('nav:section:skills');
        expect(rendered).toContain('nav:section:education');
        expect(rendered).toContain('nav:section:projects');
        expect(rendered).toContain('nav:section:certificates');
        expect(rendered).toContain('nav:section:awards');
      });

      it('should completely strip nav: links for PDF rendering while preserving normal links', () => {
        const rendered = tpl.render(mockData);
        const stripped = stripInternalNavLinks(rendered);
        expect(stripped).not.toContain('nav:section:');
        expect(stripped).not.toContain('nav:entry:');
        // If there are mailto or external links, they should be preserved
        if (rendered.includes('#link("mailto:')) {
          expect(stripped).toContain('#link("mailto:');
        }
      });
    });
  });

  describe('formatEducationScore', () => {
    it('should return empty string for undefined or empty input', () => {
      expect(formatEducationScore(undefined)).toBe('');
      expect(formatEducationScore('')).toBe('');
      expect(formatEducationScore('   ')).toBe('');
    });

    it('should default to (GPA: ...) for raw numeric scores', () => {
      expect(formatEducationScore('3.9 / 4.0')).toBe(' (GPA: 3.9 / 4.0)');
      expect(formatEducationScore('3.85')).toBe(' (GPA: 3.85)');
    });

    it('should preserve custom user-entered labels without repeating GPA', () => {
      expect(formatEducationScore('88%')).toBe(' (88%)');
      expect(formatEducationScore('9.2 CGPA')).toBe(' (9.2 CGPA)');
      expect(formatEducationScore('9.4 SGPA')).toBe(' (9.4 SGPA)');
      expect(formatEducationScore('First Class Honours')).toBe(' (First Class Honours)');
      expect(formatEducationScore('Upper Second Class (2:1)')).toBe(' (Upper Second Class (2:1))');
      expect(formatEducationScore('Summa Cum Laude')).toBe(' (Summa Cum Laude)');
      expect(formatEducationScore('Distinction')).toBe(' (Distinction)');
      expect(formatEducationScore('Merit')).toBe(' (Merit)');
      expect(formatEducationScore('1.2 (Sehr Gut)')).toBe(' (1.2 (Sehr Gut))');
      expect(formatEducationScore('Rank 1 / 120')).toBe(' (Rank 1 / 120)');
      expect(formatEducationScore('Top 5%')).toBe(' (Top 5%)');
      expect(formatEducationScore("Dean's List")).toBe(" (Dean's List)");
      expect(formatEducationScore('Grade: A+')).toBe(' (Grade: A+)');
      expect(formatEducationScore('GPA: 3.9')).toBe(' (GPA: 3.9)');
    });
  });
});
