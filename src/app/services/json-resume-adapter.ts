import { ResumeData } from '../models/resume.model';
import { normalizeResumeData } from '../models/resume-normalizer';

/**
 * Standard Resume JSON Adapter
 */
export class JsonResumeAdapter {
  static isJsonResume(raw: any): boolean {
    return !!(raw && typeof raw === 'object' && raw.basics && typeof raw.basics === 'object');
  }

  static toResumakerData(jr: any): ResumeData {
    return normalizeResumeData(jr);
  }

  static toJsonResume(data: ResumeData, themeId?: string): any {
    const out = JSON.parse(JSON.stringify(data));
    if (!out.meta) {
      out.meta = {};
    }
    if (themeId) {
      out.meta.theme = themeId;
    }
    out.meta.lastModified = new Date().toISOString();

    // Strip internal helper IDs before saving to keep JSON Resume 100% clean
    const cleanList = (list: any[]) => {
      if (!Array.isArray(list)) return;
      list.forEach(item => {
        if (item && item.id) delete item.id;
        if (item && item.isCurrent !== undefined) delete item.isCurrent;
      });
    };

    cleanList(out.work);
    cleanList(out.education);
    cleanList(out.skills);
    cleanList(out.projects);
    cleanList(out.certificates);
    cleanList(out.awards);
    cleanList(out.languages);
    cleanList(out.interests);
    cleanList(out.volunteer);
    cleanList(out.references);

    return out;
  }
}
