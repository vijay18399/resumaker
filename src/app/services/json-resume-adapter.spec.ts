import { JsonResumeAdapter } from './json-resume-adapter';
import { ResumeData } from '../models/resume.model';

describe('JsonResumeAdapter', () => {
  const sampleData: ResumeData = {
    basics: {
      name: 'John Test',
      email: 'john@example.com',
      phone: '555-1234',
      label: 'Engineer',
      summary: 'Experienced dev',
      location: { city: 'Austin', region: 'TX' },
      profiles: [{ network: 'GitHub', username: 'johntest', url: 'https://github.com/johntest' }]
    },
    work: [
      {
        id: 'w-1',
        name: 'Startup Inc',
        position: 'Backend Dev',
        startDate: '2021',
        endDate: 'Present',
        highlights: ['Shipped v1']
      }
    ],
    skills: [
      {
        id: 's-1',
        name: 'Languages',
        keywords: ['Go', 'TypeScript']
      }
    ],
    education: [],
    projects: [],
    certificates: [],
    awards: [],
    languages: [],
    interests: [],
    volunteer: [],
    references: []
  };

  it('should detect valid JSON resume object', () => {
    expect(JsonResumeAdapter.isJsonResume({ basics: { name: 'A' } })).toBeTrue();
    expect(JsonResumeAdapter.isJsonResume(null)).toBeFalse();
    expect(JsonResumeAdapter.isJsonResume({})).toBeFalse();
  });

  it('should convert to standard JSON Resume and strip internal IDs', () => {
    const exported = JsonResumeAdapter.toJsonResume(sampleData, 'modern-cv');
    expect(exported.meta.theme).toBe('modern-cv');
    expect(exported.meta.lastModified).toBeTruthy();
    expect(exported.work[0].id).toBeUndefined();
    expect(exported.skills[0].id).toBeUndefined();
    expect(exported.basics.name).toBe('John Test');
  });

  it('should normalize incoming third-party JSON into Resumaker format', () => {
    const external = {
      basics: {
        name: 'External User',
        email: 'user@test.com'
      },
      work: [
        {
          name: 'Old Corp',
          position: 'Consultant'
        }
      ]
    };

    const normalized = JsonResumeAdapter.toResumakerData(external);
    expect(normalized.basics.name).toBe('External User');
    expect(normalized.work[0].id).toBeTruthy(); // auto-assigns internal tracking id
    expect(Array.isArray(normalized.projects)).toBeTrue();
    expect(Array.isArray(normalized.skills)).toBeTrue();
  });
});
