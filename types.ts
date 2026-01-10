export enum CandidateStatus {
  Applied = 'Applied',
  Screening = 'Screening',
  Interview = 'Interview',
  Offer = 'Offer',
  Rejected = 'Rejected',
  Hired = 'Hired'
}

export interface Skill {
  name: string;
  level?: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experienceYears: number;
  summary: string;
  matchScore: number; // 0-100
  aiReasoning: string;
  status: CandidateStatus;
  jobId: string;
  appliedDate: string;
  resumeText?: string; // Storing raw text for context
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  postedDate: string;
  status: 'Active' | 'Closed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AnalyticsData {
  name: string;
  value: number;
}
