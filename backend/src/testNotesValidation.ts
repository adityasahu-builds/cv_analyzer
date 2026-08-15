import { validateResumeContent } from './parser/resumeContentValidator';
import { ParsedResumeData } from './types/resume';

console.log('================================================================');
console.log('        TESTING RESUME VS NOTES VALIDATION GUARDRAIL            ');
console.log('================================================================\n');

// 1. Case 1: Real Software Engineer Resume
const realResume: ParsedResumeData = {
  personal: {
    fullName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 9876543210',
    location: 'Bangalore, India',
    linkedin: 'linkedin.com/in/rahulsharma',
    github: 'github.com/rahulsharma',
    portfolio: '',
  },
  summary: 'Full Stack Software Engineer with 3+ years of experience building scalable web applications.',
  education: [
    {
      institution: 'IIT Delhi',
      degree: 'B.Tech in Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2018',
      endDate: '2022',
      gpa: '8.8',
      description: '',
    },
  ],
  skills: [
    {
      category: 'Technical Skills',
      items: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    },
  ],
  experience: [
    {
      company: 'Tech Solutions Corp',
      position: 'Senior Software Developer',
      location: 'Bangalore',
      startDate: '2022',
      endDate: 'Present',
      isCurrent: true,
      bulletPoints: [
        'Architected backend microservices reducing latency by 35%.',
        'Led a team of 4 engineers delivering payments pipeline.',
      ],
    },
  ],
  projects: [
    {
      title: 'E-Commerce Platform',
      description: 'Built high-throughput inventory system handling 50k requests/min.',
      technologies: ['Node.js', 'Redis', 'React'],
      link: 'github.com/rahul/ecommerce',
    },
  ],
  certifications: ['AWS Certified Solutions Architect'],
  achievements: [],
  languages: ['English', 'Hindi'],
  rawText: `Rahul Sharma
rahul.sharma@example.com | +91 9876543210 | Bangalore, India | linkedin.com/in/rahulsharma

PROFESSIONAL SUMMARY
Full Stack Software Engineer with 3+ years of experience building scalable web applications.

WORK EXPERIENCE
Senior Software Developer — Tech Solutions Corp (2022 - Present)
- Architected backend microservices reducing latency by 35%.
- Led a team of 4 engineers delivering payments pipeline.

EDUCATION
B.Tech in Computer Science — IIT Delhi (2018 - 2022) | GPA: 8.8/10

TECHNICAL SKILLS
React, TypeScript, Node.js, PostgreSQL, Docker, AWS

PROJECTS
E-Commerce Platform (Node.js, Redis, React)
- Built high-throughput inventory system handling 50k requests/min.`,
  isVisualResume: false,
};

// 2. Case 2: Lecture Notes on Operating Systems / DBMS
const lectureNotes: ParsedResumeData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  rawText: `Chapter 3: Operating Systems and Process Scheduling
Unit 2: CPU Scheduling Algorithms

Notes on Round Robin and FCFS:
Definition: Process Scheduling is the activity of the process manager that handles the removal of the running process from the CPU.

Question 1: What is starvation in Priority Scheduling?
Ans: Starvation or indefinite blocking is a phenomenon where a process is ready to run the CPU can be made to wait indefinitely.

Solution: Aging can be used as a solution to prevent starvation.
Assignment 2 Submission: Due on Friday.
Theorem: Shortest Job First gives minimal average waiting time.
Figure 3.1: Process State Diagram with New, Ready, Running, Waiting, Terminated.`,
  isVisualResume: false,
};

// 3. Case 3: Random Article / Story
const randomArticle: ParsedResumeData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  education: [],
  skills: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  rawText: `The History of Coffee Brewing
Coffee is a beverage prepared from roasted coffee beans. Darkly colored, bitter, and slightly acidic, coffee has a stimulating effect on humans, primarily due to its caffeine content. It is one of the most popular drinks in the world and can be prepared and presented in a variety of ways.
Table 1 shows global coffee production by country in 2023.`,
  isVisualResume: false,
};

// Run Tests
const res1 = validateResumeContent(realResume);
console.log('TEST 1: Real Software Engineer Resume');
console.log(` -> isValidResume : ${res1.isValidResume} (Expected: true)`);
console.log(` -> Confidence    : ${res1.confidenceScore}`);
console.log(` -> Signals       :`, res1.signals);
console.log('');

const res2 = validateResumeContent(lectureNotes);
console.log('TEST 2: Academic Lecture Notes (Chapter 3 / Question / Ans)');
console.log(` -> isValidResume : ${res2.isValidResume} (Expected: false)`);
console.log(` -> Rejection     : "${res2.reason}"`);
console.log(` -> Signals       :`, res2.signals);
console.log('');

const res3 = validateResumeContent(randomArticle);
console.log('TEST 3: Random Article (History of Coffee)');
console.log(` -> isValidResume : ${res3.isValidResume} (Expected: false)`);
console.log(` -> Rejection     : "${res3.reason}"`);
console.log(` -> Signals       :`, res3.signals);
console.log('');

if (res1.isValidResume === true && res2.isValidResume === false && res3.isValidResume === false) {
  console.log('>>> ALL RESUME CONTENT VALIDATION TESTS PASSED! <<<');
} else {
  console.error('>>> SOME TESTS FAILED! <<<');
  process.exit(1);
}
