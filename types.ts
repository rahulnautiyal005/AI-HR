
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

export interface Round {
  roundNumber: number;
  topic: string;
  description: string;
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
  interviewId?: string; // Link to the scheduled interview
  currentRound: number; // Defaults to 1
  // New Fields for Voice Bot
  voiceScreeningCompleted?: boolean;
  voiceTranscript?: string;
  voiceConfidenceScore?: number; // 0-100
  voiceSentiment?: 'Positive' | 'Neutral' | 'Negative';
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
  requirements: string[];
  rounds: Round[]; // Defined interview process
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

// New Types for Calendar Integration
export interface Interviewer {
  id: string;
  name: string;
  role: string;
  // Simple availability map: "YYYY-MM-DD": ["09:00", "10:00"]
  availability: Record<string, string[]>; 
}

export interface Interview {
  id: string;
  candidateId: string;
  interviewerId: string;
  jobId: string;
  date: string;
  time: string;
  meetLink: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  roundNumber: number;
  feedback?: string;
  result?: 'Pass' | 'Fail';
}
