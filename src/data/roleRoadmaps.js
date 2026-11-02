export const ROLE_ROADMAPS = [
  {
    role: 'Software Developer',
    summary: 'Build strong programming fundamentals, core computer science knowledge, and the ability to ship reliable software.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Programming foundations', outcome: 'Write small, well-structured programs and use Git to track changes.', skills: ['Programming Fundamentals', 'Object-Oriented Programming (Java/C++)', 'Git and GitHub'] },
      { period: 'Weeks 3–5', title: 'Data structures and problem solving', outcome: 'Choose suitable data structures and explain time and space trade-offs while solving problems.', skills: ['Data Structures & Algorithms', 'Problem Solving'] },
      { period: 'Weeks 6–8', title: 'Core systems and databases', outcome: 'Model relational data and explain how operating systems and networks support applications.', skills: ['DBMS & SQL Queries', 'Operating Systems & Linux', 'Computer Networks'] },
      { period: 'Weeks 9–12', title: 'Build and ship a software project', outcome: 'Deliver a tested application with a clear README, version history, and a working deployment.', skills: ['Git and GitHub', 'System Design Fundamentals', 'CI/CD'] }
    ]
  },
  {
    role: 'Frontend Developer',
    summary: 'Progress from semantic, responsive web pages to accessible, tested, production-ready interfaces.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Web and layout foundations', outcome: 'Create responsive pages with semantic HTML, modern CSS, and mobile-first layouts.', skills: ['HTML', 'CSS', 'Responsive Design'] },
      { period: 'Weeks 3–5', title: 'JavaScript in the browser', outcome: 'Build interactive features using modules, browser APIs, events, and asynchronous requests.', skills: ['JavaScript'] },
      { period: 'Weeks 6–9', title: 'Component-driven applications', outcome: 'Build a multi-screen React interface with clear state and reusable components.', skills: ['React.js & Frontend'] },
      { period: 'Weeks 10–12', title: 'Quality and delivery', outcome: 'Improve keyboard access, test key flows, check performance, and publish the project.', skills: ['Web Accessibility', 'Frontend Testing'] }
    ]
  },
  {
    role: 'Backend Developer',
    summary: 'Learn to design secure APIs, work with persistent data, and operate dependable server-side applications.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Runtime and HTTP foundations', outcome: 'Build a small server and explain requests, responses, status codes, and configuration.', skills: ['Node.js and Express.js', 'REST APIs'] },
      { period: 'Weeks 3–5', title: 'API design and access control', outcome: 'Create validated endpoints with authentication and resource ownership checks.', skills: ['Authentication and Authorization', 'Backend Security'] },
      { period: 'Weeks 6–8', title: 'Data modeling and transactions', outcome: 'Design relational tables and implement reliable reads and writes with SQL transactions.', skills: ['Database Design', 'DBMS & SQL Queries'] },
      { period: 'Weeks 9–12', title: 'Testing and production readiness', outcome: 'Test API behavior and deploy a service with logging, health checks, and safe secrets handling.', skills: ['API Testing', 'Cloud Platforms & Deployment'] }
    ]
  },
  {
    role: 'Full Stack Developer',
    summary: 'Connect an accessible frontend, a well-defined API, and a database into one complete product.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Frontend foundations', outcome: 'Build a responsive interface with semantic markup and reusable components.', skills: ['HTML', 'CSS', 'JavaScript', 'React.js & Frontend'] },
      { period: 'Weeks 3–5', title: 'Backend and API contracts', outcome: 'Implement API routes with validation and consistent success and error responses.', skills: ['Node.js and Express.js', 'REST APIs'] },
      { period: 'Weeks 6–8', title: 'Connect data and identity', outcome: 'Persist user-owned data in a relational database and protect account-specific operations.', skills: ['DBMS & SQL Queries', 'Database Design', 'Authentication and Authorization'] },
      { period: 'Weeks 9–12', title: 'End-to-end product delivery', outcome: 'Ship one complete feature with automated checks, deployment, and concise documentation.', skills: ['API Testing', 'CI/CD', 'Cloud Platforms & Deployment'] }
    ]
  },
  {
    role: 'Data Analyst',
    summary: 'Turn raw data into checked, useful analysis and communicate findings with clear evidence.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Data and statistics basics', outcome: 'Describe data types, distributions, and common sources of bias in a dataset.', skills: ['Statistics & Data Analysis', 'Excel and Spreadsheets'] },
      { period: 'Weeks 3–5', title: 'Query and prepare data', outcome: 'Use SQL to join, filter, aggregate, and validate a dataset for analysis.', skills: ['DBMS & SQL Queries', 'Data Cleaning'] },
      { period: 'Weeks 6–8', title: 'Analyze and visualize', outcome: 'Use Python or a spreadsheet to explore trends and choose charts that fit the question.', skills: ['Python', 'Data Visualization'] },
      { period: 'Weeks 9–12', title: 'Present an evidence-based project', outcome: 'Publish a reproducible analysis with a dashboard, findings, caveats, and recommendations.', skills: ['Power BI and Tableau', 'Data Visualization'] }
    ]
  },
  {
    role: 'AI / ML Engineer',
    summary: 'Combine mathematical foundations, careful model evaluation, and practical machine-learning delivery.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–3', title: 'Python and mathematical foundations', outcome: 'Use Python to explore data and explain the statistical and linear-algebra ideas behind a model.', skills: ['Python', 'Statistics & Data Analysis', 'Linear Algebra Fundamentals'] },
      { period: 'Weeks 4–6', title: 'Prepare data and establish baselines', outcome: 'Create a repeatable data pipeline and compare a baseline against suitable evaluation metrics.', skills: ['Data Preprocessing', 'Model Evaluation'] },
      { period: 'Weeks 7–9', title: 'Train and assess models', outcome: 'Train a supervised model, check for overfitting, and document its limitations.', skills: ['Machine Learning', 'Machine Learning Libraries'] },
      { period: 'Weeks 10–12', title: 'Deliver an applied ML project', outcome: 'Package a model behind a small interface and describe how its quality should be monitored.', skills: ['Model Evaluation'] }
    ]
  },
  {
    role: 'Cybersecurity Engineer',
    summary: 'Develop secure-system fundamentals, practice security assessment in a lab, and learn to respond to incidents.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Security and Linux foundations', outcome: 'Explain least privilege, common threat types, and basic host-hardening steps.', skills: ['Security Principles', 'Operating Systems & Linux', 'Identity and Access Management'] },
      { period: 'Weeks 3–5', title: 'Network security and threat modeling', outcome: 'Map a system\'s trust boundaries and identify risks across its network paths.', skills: ['Computer Networks', 'Cryptography Fundamentals'] },
      { period: 'Weeks 6–9', title: 'Secure applications and assessment', outcome: 'Review a deliberately vulnerable lab app, document findings, and recommend fixes.', skills: ['Web Security', 'Vulnerability Assessment'] },
      { period: 'Weeks 10–12', title: 'Detection and incident response', outcome: 'Create a small incident runbook using sample logs and a clear evidence timeline.', skills: ['Operating-System Security', 'Security Principles'] }
    ]
  },
  {
    role: 'DevOps Engineer',
    summary: 'Automate software delivery and operate services with repeatable infrastructure and useful observability.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Linux, scripting, and version control', outcome: 'Automate a routine deployment task and keep the script and run instructions in Git.', skills: ['Operating Systems & Linux', 'Scripting and Automation', 'Git and GitHub'] },
      { period: 'Weeks 3–5', title: 'Build and delivery pipelines', outcome: 'Create a pipeline that runs checks and publishes a versioned application artifact.', skills: ['CI/CD'] },
      { period: 'Weeks 6–8', title: 'Containers and infrastructure as code', outcome: 'Deploy an application from reproducible container and infrastructure definitions.', skills: ['Docker and Containers', 'Infrastructure as Code', 'Cloud Platforms & Deployment'] },
      { period: 'Weeks 9–12', title: 'Operate and improve a service', outcome: 'Add health checks, useful alerts, rollback steps, and a short incident runbook.', skills: ['Monitoring and Observability'] }
    ]
  },
  {
    role: 'Cloud Engineer',
    summary: 'Design and operate secure cloud infrastructure with clear access, networking, and cost controls.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Cloud foundations', outcome: 'Explain regions, shared responsibility, identity, and the basic building blocks of a cloud account.', skills: ['Cloud Architecture', 'Identity and Access Management', 'Computer Networks'] },
      { period: 'Weeks 3–5', title: 'Network and storage design', outcome: 'Sketch a segmented application environment and choose suitable storage for its data.', skills: ['Cloud Networking', 'Data Encryption and Storage'] },
      { period: 'Weeks 6–8', title: 'Provision infrastructure safely', outcome: 'Provision a small service from version-controlled infrastructure code with least-privilege access.', skills: ['Infrastructure as Code', 'Identity and Access Management'] },
      { period: 'Weeks 9–12', title: 'Reliability, monitoring, and cost', outcome: 'Add monitoring and backup checks, then explain availability and cost trade-offs.', skills: ['Monitoring and Observability', 'Cloud Cost Management'] }
    ]
  },
  {
    role: 'Data Engineer',
    summary: 'Build dependable data pipelines that move, validate, and organize data for analysis and products.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Python, SQL, and data modeling', outcome: 'Model a small analytical dataset and query it with documented SQL.', skills: ['Python', 'DBMS & SQL Queries'] },
      { period: 'Weeks 3–5', title: 'Ingest and validate data', outcome: 'Build a repeatable batch pipeline with schema checks and clear failure handling.', skills: ['Data Pipelines and ETL', 'Data Quality'] },
      { period: 'Weeks 6–8', title: 'Warehousing and distributed processing', outcome: 'Organize curated data into warehouse-friendly tables and compare processing approaches.', skills: ['Data Warehousing', 'Distributed Data Processing'] },
      { period: 'Weeks 9–12', title: 'Deliver a production-style pipeline', outcome: 'Schedule a pipeline, monitor its freshness, and document recovery steps.', skills: ['Cloud Data Services', 'Git and GitHub'] }
    ]
  },
  {
    role: 'QA Automation Engineer',
    summary: 'Plan tests around risk, automate dependable checks, and help teams release with confidence.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Quality and test design', outcome: 'Turn a feature brief into risk-based scenarios with clear expected results.', skills: ['Test Design', 'Programming Fundamentals'] },
      { period: 'Weeks 3–5', title: 'Automate user workflows', outcome: 'Build maintainable browser checks for critical user journeys.', skills: ['JavaScript', 'Test Automation'] },
      { period: 'Weeks 6–8', title: 'API and integration quality', outcome: 'Verify API contracts, failure cases, and data changes with repeatable checks.', skills: ['API Testing'] },
      { period: 'Weeks 9–12', title: 'Release confidence', outcome: 'Run a focused regression suite in CI and summarize risk from the results.', skills: ['CI/CD', 'Quality Reporting'] }
    ]
  },
  {
    role: 'Mobile App Developer',
    summary: 'Build a mobile application with platform-aware interfaces, reliable data flow, and a tested release.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Mobile platform foundations', outcome: 'Build a small native or cross-platform screen and explain its application lifecycle.', skills: ['Kotlin or Swift', 'Mobile Development Fundamentals'] },
      { period: 'Weeks 3–5', title: 'Navigation and mobile UI', outcome: 'Create a multi-screen flow that handles different device sizes and accessibility settings.', skills: ['Mobile UI and Navigation'] },
      { period: 'Weeks 6–8', title: 'Data, APIs, and offline behavior', outcome: 'Connect an API and provide a useful loading, error, and offline experience.', skills: ['API Integration'] },
      { period: 'Weeks 9–12', title: 'Testing and release readiness', outcome: 'Test key device scenarios and prepare a signed build with release notes.', skills: ['Mobile App Testing', 'App Release and Store Publishing'] }
    ]
  },
  {
    role: 'UX/UI Designer',
    summary: 'Research user needs, design coherent interactions, and validate accessible interface prototypes.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'User research and problem framing', outcome: 'Summarize interview or observation evidence into a focused user problem and constraints.', skills: ['User Research'] },
      { period: 'Weeks 3–5', title: 'Flows and low-fidelity prototypes', outcome: 'Map a core task and prototype its key states before applying visual polish.', skills: ['Wireframing and Prototyping'] },
      { period: 'Weeks 6–8', title: 'Visual systems and interaction design', outcome: 'Build a small reusable interface system with clear states and accessible contrast.', skills: ['Visual Design Foundations', 'Design Systems', 'Interaction Design'] },
      { period: 'Weeks 9–12', title: 'Usability validation and case study', outcome: 'Test the prototype with users, record changes made from evidence, and present the result.', skills: ['Usability Testing', 'Web Accessibility'] }
    ]
  },
  {
    role: 'Data Scientist',
    summary: 'Use statistical reasoning and machine learning to answer a defined question and communicate uncertainty.',
    duration: '12-week guide',
    phases: [
      { period: 'Weeks 1–2', title: 'Python and statistical reasoning', outcome: 'Explore a dataset and explain the assumptions behind a basic statistical comparison.', skills: ['Python', 'Statistics & Data Analysis', 'Linear Algebra Fundamentals'] },
      { period: 'Weeks 3–5', title: 'Prepare data and frame a question', outcome: 'Create a clean analysis dataset and define a baseline tied to a measurable question.', skills: ['Data Cleaning', 'Statistical Modeling'] },
      { period: 'Weeks 6–8', title: 'Model and validate', outcome: 'Compare candidate models with a suitable validation plan and report uncertainty and limitations.', skills: ['Machine Learning', 'Model Evaluation', 'Feature Engineering'] },
      { period: 'Weeks 9–12', title: 'Communicate a reproducible project', outcome: 'Deliver a reproducible notebook or report with findings, limitations, and next steps.', skills: ['Experiment Tracking', 'Data Storytelling'] }
    ]
  }
];
