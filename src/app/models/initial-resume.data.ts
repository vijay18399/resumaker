import { ResumeData } from '../models/resume.model';
import initialResumeJson from './initial-resume.json';

export const INITIAL_RESUME_DATA: ResumeData = initialResumeJson as unknown as ResumeData;
