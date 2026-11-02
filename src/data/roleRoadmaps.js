export const ROLE_ROADMAPS = [
  {
    role: 'Software Developer',
    summary: 'Build strong programming fundamentals, core computer science knowledge, and the ability to ship reliable software.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Programming foundations', outcome: 'Write small, well-structured programs and use Git to track changes.', skills: ['Java or C++', 'OOP', 'Git'] },
      { period: 'Weeks 3–5', title: 'Data structures and problem solving', outcome: 'Choose suitable data structures and explain time and space trade-offs while solving problems.', skills: ['Arrays and trees', 'Graphs', 'Algorithms'] },
      { period: 'Weeks 6–8', title: 'Core systems and databases', outcome: 'Model relational data and explain how operating systems and networks support applications.', skills: ['SQL and DBMS', 'Operating systems', 'Networking'] },
      { period: 'Weeks 9–12', title: 'Build and ship a software project', outcome: 'Deliver a tested application with a clear README, version history, and a working deployment.', skills: ['Testing', 'System design', 'Deployment'] }
    ]
  },
  {
    role: 'Frontend Developer',
    summary: 'Progress from semantic, responsive web pages to accessible, tested, production-ready interfaces.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Web and layout foundations', outcome: 'Create responsive pages with semantic HTML, modern CSS, and mobile-first layouts.', skills: ['HTML', 'CSS', 'Responsive design'] },
      { period: 'Weeks 3–5', title: 'JavaScript in the browser', outcome: 'Build interactive features using modules, browser APIs, events, and asynchronous requests.', skills: ['JavaScript', 'DOM', 'Async requests'] },
      { period: 'Weeks 6–9', title: 'Component-driven applications', outcome: 'Build a multi-screen React interface with clear state and reusable components.', skills: ['React', 'Routing', 'State management'] },
      { period: 'Weeks 10–12', title: 'Quality and delivery', outcome: 'Improve keyboard access, test key flows, check performance, and publish the project.', skills: ['Accessibility', 'Frontend testing', 'Performance'] }
    ]
  },
  {
    role: 'Backend Developer',
    summary: 'Learn to design secure APIs, work with persistent data, and operate dependable server-side applications.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Runtime and HTTP foundations', outcome: 'Build a small server and explain requests, responses, status codes, and configuration.', skills: ['Node.js', 'HTTP', 'Environment config'] },
      { period: 'Weeks 3–5', title: 'API design and access control', outcome: 'Create validated endpoints with authentication and resource ownership checks.', skills: ['REST APIs', 'Authentication', 'Validation'] },
      { period: 'Weeks 6–8', title: 'Data modeling and transactions', outcome: 'Design relational tables and implement reliable reads and writes with SQL transactions.', skills: ['SQL', 'Data modeling', 'Transactions'] },
      { period: 'Weeks 9–12', title: 'Testing and production readiness', outcome: 'Test API behavior and deploy a service with logging, health checks, and safe secrets handling.', skills: ['API testing', 'Security', 'Deployment'] }
    ]
  },
  {
    role: 'Full Stack Developer',
    summary: 'Connect an accessible frontend, a well-defined API, and a database into one complete product.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Frontend foundations', outcome: 'Build a responsive interface with semantic markup and reusable components.', skills: ['HTML and CSS', 'JavaScript', 'React'] },
      { period: 'Weeks 3–5', title: 'Backend and API contracts', outcome: 'Implement API routes with validation and consistent success and error responses.', skills: ['Node.js', 'REST APIs', 'Validation'] },
      { period: 'Weeks 6–8', title: 'Connect data and identity', outcome: 'Persist user-owned data in a relational database and protect account-specific operations.', skills: ['SQL', 'Authentication', 'Authorization'] },
      { period: 'Weeks 9–12', title: 'End-to-end product delivery', outcome: 'Ship one complete feature with automated checks, deployment, and concise documentation.', skills: ['Integration testing', 'CI/CD', 'Deployment'] }
    ]
  },
  {
    role: 'Data Analyst',
    summary: 'Turn raw data into checked, useful analysis and communicate findings with clear evidence.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Data and statistics basics', outcome: 'Describe data types, distributions, and common sources of bias in a dataset.', skills: ['Descriptive statistics', 'Spreadsheets', 'Data quality'] },
      { period: 'Weeks 3–5', title: 'Query and prepare data', outcome: 'Use SQL to join, filter, aggregate, and validate a dataset for analysis.', skills: ['SQL', 'Joins', 'Data cleaning'] },
      { period: 'Weeks 6–8', title: 'Analyze and visualize', outcome: 'Use Python or a spreadsheet to explore trends and choose charts that fit the question.', skills: ['Python', 'Exploratory analysis', 'Visualization'] },
      { period: 'Weeks 9–12', title: 'Present an evidence-based project', outcome: 'Publish a reproducible analysis with a dashboard, findings, caveats, and recommendations.', skills: ['Storytelling', 'Dashboard design', 'Portfolio'] }
    ]
  },
  {
    role: 'AI / ML Engineer',
    summary: 'Combine mathematical foundations, careful model evaluation, and practical machine-learning delivery.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–3', title: 'Python and mathematical foundations', outcome: 'Use Python to explore data and explain the statistical and linear-algebra ideas behind a model.', skills: ['Python', 'Statistics', 'Linear algebra'] },
      { period: 'Weeks 4–6', title: 'Prepare data and establish baselines', outcome: 'Create a repeatable data pipeline and compare a baseline against suitable evaluation metrics.', skills: ['Data preprocessing', 'Feature engineering', 'Evaluation metrics'] },
      { period: 'Weeks 7–9', title: 'Train and assess models', outcome: 'Train a supervised model, check for overfitting, and document its limitations.', skills: ['Machine learning', 'Model validation', 'Experiment tracking'] },
      { period: 'Weeks 10–12', title: 'Deliver an applied ML project', outcome: 'Package a model behind a small interface and describe how its quality should be monitored.', skills: ['Model serving', 'Monitoring', 'Responsible ML'] }
    ]
  }
];
