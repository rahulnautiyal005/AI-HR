
import { Job, Candidate, CandidateStatus, Interviewer, Interview } from "../types";

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    description: 'We are looking for a React expert with Tailwind experience to build world-class interfaces.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Performance Optimization'],
    rounds: [
      { roundNumber: 1, topic: 'Technical Screening', description: 'Basic JS/CSS questions and culture fit.' },
      { roundNumber: 2, topic: 'System Design', description: 'Design a scalable frontend architecture.' },
      { roundNumber: 3, topic: 'Coding Challenge', description: 'Live coding session in React.' }
    ],
    postedDate: '2023-10-15',
    status: 'Active'
  },
  {
    id: 'job-2',
    title: 'AI Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    description: 'Lead the vision for our generative AI features.',
    requirements: ['Product Management', 'LLM knowledge', 'Agile', 'User Research'],
    rounds: [
        { roundNumber: 1, topic: 'Product Sense', description: 'Product thinking and strategy.' },
        { roundNumber: 2, topic: 'Technical Depth', description: 'Understanding of LLM capabilities.' }
    ],
    postedDate: '2023-10-20',
    status: 'Active'
  }
];

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    skills: ['React', 'Node.js', 'Figma'],
    experienceYears: 5,
    summary: 'Full stack developer with a passion for UX design.',
    matchScore: 88,
    aiReasoning: 'Strong match for frontend role due to React experience, though TypeScript is not explicitly mentioned.',
    status: CandidateStatus.Interview,
    jobId: 'job-1',
    appliedDate: '2023-10-22',
    interviewId: 'int-1',
    currentRound: 1
  },
  {
    id: 'cand-2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    skills: ['Python', 'Django', 'AWS'],
    experienceYears: 3,
    summary: 'Backend focused engineer.',
    matchScore: 45,
    aiReasoning: 'Low match for Frontend role; skills are primarily backend focused.',
    status: CandidateStatus.Rejected,
    jobId: 'job-1',
    appliedDate: '2023-10-23',
    currentRound: 1
  }
];

// Generate dates for the next few days
const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

export const INITIAL_INTERVIEWERS: Interviewer[] = [
  {
    id: 'intv-1',
    name: 'Aarav Patel',
    role: 'Senior Backend Engineer',
    availability: {
      [today]: ['10:00', '11:00', '14:00', '15:00'],
      [tomorrow]: ['09:00', '10:00', '16:00'],
      [dayAfter]: ['11:00', '13:00']
    }
  },
  {
    id: 'intv-2',
    name: 'Priya Sharma',
    role: 'Engineering Manager',
    availability: {
      [today]: ['11:00', '13:00'],
      [tomorrow]: ['14:00', '15:00', '16:00'],
      [dayAfter]: ['09:00', '10:00']
    }
  },
  {
    id: 'intv-3',
    name: 'Vihaan Singh',
    role: 'Staff Product Designer',
    availability: {
      [today]: ['09:00', '16:00'],
      [tomorrow]: ['10:00', '11:00', '13:00'],
      [dayAfter]: ['11:00', '15:00']
    }
  },
  {
    id: 'intv-4',
    name: 'Diya Rao',
    role: 'Lead Frontend Dev',
    availability: {
      [today]: ['13:00', '14:00', '15:00'],
      [tomorrow]: ['09:00', '11:00'],
      [dayAfter]: ['10:00', '14:00', '16:00']
    }
  },
  {
    id: 'intv-5',
    name: 'Ishaan Gupta',
    role: 'CTO',
    availability: {
      [today]: ['10:00'],
      [tomorrow]: ['15:00', '16:00'],
      [dayAfter]: ['09:00']
    }
  },
  {
    id: 'intv-6',
    name: 'Ananya Mehta',
    role: 'HR Director',
    availability: {
      [today]: ['09:00', '10:00', '11:00', '12:00'],
      [tomorrow]: ['13:00', '14:00', '15:00'],
      [dayAfter]: ['09:00', '10:00', '11:00']
    }
  }
];

export const INITIAL_INTERVIEWS: Interview[] = [
  {
    id: 'int-1',
    candidateId: 'cand-1',
    interviewerId: 'intv-1',
    jobId: 'job-1',
    date: tomorrow,
    time: '10:00',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    status: 'Scheduled',
    roundNumber: 1
  }
];
