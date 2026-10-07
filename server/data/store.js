// SkillTwin In-Memory Database Store (Day 3 Backend)
// Preloaded with Sem 5 CSE Student Data and Industry Benchmarks

export const DB = {
  users: [
    {
      id: 'student-sem5-01',
      name: 'Sanjay Kumar',
      email: 'sanjay.cse@student.edu',
      passwordHash: '$2a$10$wE9m0Y4wE.2qjZ1sY0nOaeR9qJvB.1q6Jz0iX9eA7b1wM0qY1eE2u',
      semester: '5',
      branch: 'Computer Science & Engineering',
      college: 'National Institute of Technology',
      cgpa: '8.6',
      targetRole: 'Software Developer',
      readinessScore: 68,
      skills: {
        'Data Structures & Algorithms': { current: 65, required: 85, category: 'Core CS' },
        'Object-Oriented Programming (Java/C++)': { current: 75, required: 80, category: 'Core CS' },
        'DBMS & SQL Queries': { current: 80, required: 75, category: 'Database' },
        'Operating Systems & Linux': { current: 60, required: 70, category: 'Core CS' },
        'Computer Networks': { current: 50, required: 65, category: 'Core CS' },
        'React.js & Frontend': { current: 72, required: 70, category: 'Development' },
        'Node.js & REST APIs': { current: 55, required: 75, category: 'Development' },
        'Git, Docker & CI/CD': { current: 35, required: 60, category: 'DevOps' },
        'System Design Fundamentals': { current: 30, required: 65, category: 'Architecture' }
      },
      completedMilestones: ['milestone-1', 'milestone-2']
    }
  ],

  // Role benchmarks for different career paths
  roleBenchmarks: {
    'Software Developer': {
      minPlacementScore: 75,
      coreSkills: ['Data Structures & Algorithms', 'DBMS & SQL Queries', 'Object-Oriented Programming (Java/C++)', 'System Design Fundamentals'],
      salaryRange: '₹8.5L - ₹16.0L CTC'
    },
    'Frontend Developer': {
      minPlacementScore: 70,
      coreSkills: ['React.js & Frontend', 'Git, Docker & CI/CD', 'Computer Networks'],
      salaryRange: '₹6.5L - ₹12.5L CTC'
    },
    'Backend Developer': {
      minPlacementScore: 75,
      coreSkills: ['Node.js & REST APIs', 'DBMS & SQL Queries', 'Operating Systems & Linux', 'System Design Fundamentals'],
      salaryRange: '₹8.0L - ₹15.0L CTC'
    },
    'AI / ML Engineer': {
      minPlacementScore: 80,
      coreSkills: ['Data Structures & Algorithms', 'Python & Math', 'DBMS & SQL Queries'],
      salaryRange: '₹10.0L - ₹18.0L CTC'
    }
  }
};
