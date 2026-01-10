import { Job, Candidate, CandidateStatus } from "../types";

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    description: 'We are looking for a React expert with Tailwind experience to build world-class interfaces.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', 'Performance Optimization'],
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
    appliedDate: '2023-10-22'
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
    appliedDate: '2023-10-23'
  }
];
