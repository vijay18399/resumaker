import { normalizeResumeData } from './resume-normalizer';

describe('ResumeNormalizer', () => {
  it('should return empty resume when raw input is null, undefined, or primitive', () => {
    const empty1 = normalizeResumeData(null);
    expect(empty1.basics.name).toBe('');
    expect(empty1.work.length).toBe(0);

    const empty2 = normalizeResumeData(undefined);
    expect(empty2.basics.email).toBe('');

    const empty3 = normalizeResumeData('invalid string');
    expect(empty3.basics.summary).toBe('');
  });

  it('should correctly normalize populated raw objects and fill missing fields', () => {
    const raw = {
      basics: {
        name: 'Jane Doe',
        location: 'San Francisco, CA', // string location test
        profiles: [{ network: 'GitHub', username: 'janedoe', url: 'https://github.com/janedoe' }]
      },
      work: [
        {
          name: 'Acme Corp',
          position: 'Engineer',
          summary: 'Built awesome things'
          // highlights missing -> should fallback to [summary]
        }
      ],
      education: [
        {
          institution: 'MIT',
          area: 'Computer Science'
        }
      ],
      skills: [
        {
          name: 'Frontend',
          keywords: ['Angular', 'TypeScript']
        }
      ],
      projects: [
        {
          name: 'Portfolio App',
          summary: 'An interactive portfolio site'
        }
      ],
      certificates: [
        {
          name: 'AWS Certified Solutions Architect'
        }
      ],
      awards: [
        {
          title: 'Employee of the Month'
        }
      ],
      languages: [
        {
          language: 'English',
          fluency: 'Native'
        }
      ],
      interests: [
        {
          name: 'Photography'
        }
      ],
      volunteer: [
        {
          organization: 'Red Cross',
          position: 'Volunteer'
        }
      ],
      references: [
        {
          name: 'John Smith',
          reference: 'Highly recommended'
        }
      ]
    };

    const res = normalizeResumeData(raw);

    expect(res.basics.name).toBe('Jane Doe');
    expect(res.basics.location?.city).toBe('San Francisco, CA');
    expect(res.basics.profiles?.length).toBe(1);
    expect(res.work.length).toBe(1);
    expect(res.work[0].highlights).toEqual(['Built awesome things']);
    expect(res.work[0].isCurrent).toBeTrue();
    expect(res.education.length).toBe(1);
    expect(res.education[0].id).toBe('edu-1');
    expect(res.skills.length).toBe(1);
    expect(res.projects.length).toBe(1);
    expect(res.certificates?.length).toBe(1);
    expect(res.awards?.length).toBe(1);
    expect(res.languages?.length).toBe(1);
    expect(res.interests?.length).toBe(1);
    expect(res.volunteer?.length).toBe(1);
    expect(res.references?.length).toBe(1);
  });

  it('should handle object location format and preserve explicit highlights', () => {
    const raw = {
      basics: {
        location: {
          city: 'London',
          region: 'Greater London',
          countryCode: 'UK',
          address: '10 Downing St',
          postalCode: 'SW1A 2AA'
        }
      },
      work: [
        {
          name: 'Tech Inc',
          endDate: '2023-01-01',
          highlights: ['Bullet 1', 'Bullet 2']
        }
      ]
    };

    const res = normalizeResumeData(raw);
    expect(res.basics.location?.city).toBe('London');
    expect(res.basics.location?.countryCode).toBe('UK');
    expect(res.work[0].highlights).toEqual(['Bullet 1', 'Bullet 2']);
    expect(res.work[0].isCurrent).toBeFalse();
  });
});
