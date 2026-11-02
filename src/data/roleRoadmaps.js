export const ROLE_ROADMAPS = [
  {
    role: 'Software Developer',
    summary: 'Build strong programming fundamentals, core computer science knowledge, and the ability to ship reliable software.',
    stages: [
      { stage: 'Foundations', title: 'Programming foundations', masteryCheck: 'Write small, well-structured programs and use Git to track changes.', skills: ['Programming Fundamentals', 'Object-Oriented Programming (Java/C++)', 'Git and GitHub'] },
      { stage: 'Role skills', title: 'Data structures and problem solving', masteryCheck: 'Choose suitable data structures and explain time and space trade-offs while solving problems.', skills: ['Data Structures & Algorithms', 'Problem Solving'] },
      { stage: 'Applied practice', title: 'Core systems and databases', masteryCheck: 'Model relational data and explain how operating systems and networks support applications.', skills: ['DBMS & SQL Queries', 'Operating Systems & Linux', 'Computer Networks'] },
      { stage: 'Proof of mastery', title: 'Build and ship a software project', masteryCheck: 'Deliver a tested application with a clear README, version history, and a working deployment.', skills: ['Git and GitHub', 'System Design Fundamentals', 'CI/CD'] }
    ]
  },
  {
    role: 'Frontend Developer',
    summary: 'Progress from semantic, responsive web pages to accessible, tested, production-ready interfaces.',
    stages: [
      { stage: 'Foundations', title: 'Web and layout foundations', masteryCheck: 'Create responsive pages with semantic HTML, modern CSS, and mobile-first layouts.', skills: ['HTML', 'CSS', 'Responsive Design'] },
      { stage: 'Role skills', title: 'JavaScript in the browser', masteryCheck: 'Build interactive features using modules, browser APIs, events, and asynchronous requests.', skills: ['JavaScript'] },
      { stage: 'Applied practice', title: 'Component-driven applications', masteryCheck: 'Build a multi-screen React interface with clear state and reusable components.', skills: ['React.js & Frontend'] },
      { stage: 'Proof of mastery', title: 'Quality and delivery', masteryCheck: 'Improve keyboard access, test key flows, check performance, and publish the project.', skills: ['Web Accessibility', 'Frontend Testing'] }
    ]
  },
  {
    role: 'Backend Developer',
    summary: 'Learn to design secure APIs, work with persistent data, and operate dependable server-side applications.',
    stages: [
      { stage: 'Foundations', title: 'Runtime and HTTP foundations', masteryCheck: 'Build a small server and explain requests, responses, status codes, and configuration.', skills: ['Node.js and Express.js', 'REST APIs'] },
      { stage: 'Role skills', title: 'API design and access control', masteryCheck: 'Create validated endpoints with authentication and resource ownership checks.', skills: ['Authentication and Authorization', 'Backend Security'] },
      { stage: 'Applied practice', title: 'Data modeling and transactions', masteryCheck: 'Design relational tables and implement reliable reads and writes with SQL transactions.', skills: ['Database Design', 'DBMS & SQL Queries'] },
      { stage: 'Proof of mastery', title: 'Testing and production readiness', masteryCheck: 'Test API behavior and deploy a service with logging, health checks, and safe secrets handling.', skills: ['API Testing', 'Cloud Platforms & Deployment'] }
    ]
  },
  {
    role: 'Full Stack Developer',
    summary: 'Connect an accessible frontend, a well-defined API, and a database into one complete product.',
    stages: [
      { stage: 'Foundations', title: 'Frontend foundations', masteryCheck: 'Build a responsive interface with semantic markup and reusable components.', skills: ['HTML', 'CSS', 'JavaScript', 'React.js & Frontend'] },
      { stage: 'Role skills', title: 'Backend and API contracts', masteryCheck: 'Implement API routes with validation and consistent success and error responses.', skills: ['Node.js and Express.js', 'REST APIs'] },
      { stage: 'Applied practice', title: 'Connect data and identity', masteryCheck: 'Persist user-owned data in a relational database and protect account-specific operations.', skills: ['DBMS & SQL Queries', 'Database Design', 'Authentication and Authorization'] },
      { stage: 'Proof of mastery', title: 'End-to-end product delivery', masteryCheck: 'Ship one complete feature with automated checks, deployment, and concise documentation.', skills: ['API Testing', 'CI/CD', 'Cloud Platforms & Deployment'] }
    ]
  },
  {
    role: 'Data Analyst',
    summary: 'Turn raw data into checked, useful analysis and communicate findings with clear evidence.',
    stages: [
      { stage: 'Foundations', title: 'Data and statistics basics', masteryCheck: 'Describe data types, distributions, and common sources of bias in a dataset.', skills: ['Statistics & Data Analysis', 'Excel and Spreadsheets'] },
      { stage: 'Role skills', title: 'Query and prepare data', masteryCheck: 'Use SQL to join, filter, aggregate, and validate a dataset for analysis.', skills: ['DBMS & SQL Queries', 'Data Cleaning'] },
      { stage: 'Applied practice', title: 'Analyze and visualize', masteryCheck: 'Use Python or a spreadsheet to explore trends and choose charts that fit the question.', skills: ['Python', 'Data Visualization'] },
      { stage: 'Proof of mastery', title: 'Present an evidence-based project', masteryCheck: 'Publish a reproducible analysis with a dashboard, findings, caveats, and recommendations.', skills: ['Power BI and Tableau', 'Data Visualization'] }
    ]
  },
  {
    role: 'AI / ML Engineer',
    summary: 'Combine mathematical foundations, careful model evaluation, and practical machine-learning delivery.',
    stages: [
      { stage: 'Foundations', title: 'Python and mathematical foundations', masteryCheck: 'Use Python to explore data and explain the statistical and linear-algebra ideas behind a model.', skills: ['Python', 'Statistics & Data Analysis', 'Linear Algebra Fundamentals'] },
      { stage: 'Role skills', title: 'Prepare data and establish baselines', masteryCheck: 'Create a repeatable data pipeline and compare a baseline against suitable evaluation metrics.', skills: ['Data Preprocessing', 'Model Evaluation'] },
      { stage: 'Applied practice', title: 'Train and assess models', masteryCheck: 'Train a supervised model, check for overfitting, and document its limitations.', skills: ['Machine Learning', 'Machine Learning Libraries'] },
      { stage: 'Proof of mastery', title: 'Deliver an applied ML project', masteryCheck: 'Package a model behind a small interface and describe how its quality should be monitored.', skills: ['Model Evaluation'] }
    ]
  },
  {
    role: 'Cybersecurity Engineer',
    summary: 'Develop secure-system fundamentals, practice security assessment in a lab, and learn to respond to incidents.',
    stages: [
      { stage: 'Foundations', title: 'Security and Linux foundations', masteryCheck: 'Explain least privilege, common threat types, and basic host-hardening steps.', skills: ['Security Principles', 'Operating Systems & Linux', 'Identity and Access Management'] },
      { stage: 'Role skills', title: 'Network security and threat modeling', masteryCheck: 'Map a system\'s trust boundaries and identify risks across its network paths.', skills: ['Computer Networks', 'Cryptography Fundamentals'] },
      { stage: 'Applied practice', title: 'Secure applications and assessment', masteryCheck: 'Review a deliberately vulnerable lab app, document findings, and recommend fixes.', skills: ['Web Security', 'Vulnerability Assessment'] },
      { stage: 'Proof of mastery', title: 'Detection and incident response', masteryCheck: 'Create a small incident runbook using sample logs and a clear evidence timeline.', skills: ['Operating-System Security', 'Security Principles'] }
    ]
  },
  {
    role: 'DevOps Engineer',
    summary: 'Automate software delivery and operate services with repeatable infrastructure and useful observability.',
    stages: [
      { stage: 'Foundations', title: 'Linux, scripting, and version control', masteryCheck: 'Automate a routine deployment task and keep the script and run instructions in Git.', skills: ['Operating Systems & Linux', 'Scripting and Automation', 'Git and GitHub'] },
      { stage: 'Role skills', title: 'Build and delivery pipelines', masteryCheck: 'Create a pipeline that runs checks and publishes a versioned application artifact.', skills: ['CI/CD'] },
      { stage: 'Applied practice', title: 'Containers and infrastructure as code', masteryCheck: 'Deploy an application from reproducible container and infrastructure definitions.', skills: ['Docker and Containers', 'Infrastructure as Code', 'Cloud Platforms & Deployment'] },
      { stage: 'Proof of mastery', title: 'Operate and improve a service', masteryCheck: 'Add health checks, useful alerts, rollback steps, and a short incident runbook.', skills: ['Monitoring and Observability'] }
    ]
  },
  {
    role: 'Cloud Engineer',
    summary: 'Design and operate secure cloud infrastructure with clear access, networking, and cost controls.',
    stages: [
      { stage: 'Foundations', title: 'Cloud foundations', masteryCheck: 'Explain regions, shared responsibility, identity, and the basic building blocks of a cloud account.', skills: ['Cloud Architecture', 'Identity and Access Management', 'Computer Networks'] },
      { stage: 'Role skills', title: 'Network and storage design', masteryCheck: 'Sketch a segmented application environment and choose suitable storage for its data.', skills: ['Cloud Networking', 'Data Encryption and Storage'] },
      { stage: 'Applied practice', title: 'Provision infrastructure safely', masteryCheck: 'Provision a small service from version-controlled infrastructure code with least-privilege access.', skills: ['Infrastructure as Code', 'Identity and Access Management'] },
      { stage: 'Proof of mastery', title: 'Reliability, monitoring, and cost', masteryCheck: 'Add monitoring and backup checks, then explain availability and cost trade-offs.', skills: ['Monitoring and Observability', 'Cloud Cost Management'] }
    ]
  },
  {
    role: 'Data Engineer',
    summary: 'Build dependable data pipelines that move, validate, and organize data for analysis and products.',
    stages: [
      { stage: 'Foundations', title: 'Python, SQL, and data modeling', masteryCheck: 'Model a small analytical dataset and query it with documented SQL.', skills: ['Python', 'DBMS & SQL Queries'] },
      { stage: 'Role skills', title: 'Ingest and validate data', masteryCheck: 'Build a repeatable batch pipeline with schema checks and clear failure handling.', skills: ['Data Pipelines and ETL', 'Data Quality'] },
      { stage: 'Applied practice', title: 'Warehousing and distributed processing', masteryCheck: 'Organize curated data into warehouse-friendly tables and compare processing approaches.', skills: ['Data Warehousing', 'Distributed Data Processing'] },
      { stage: 'Proof of mastery', title: 'Deliver a production-style pipeline', masteryCheck: 'Schedule a pipeline, monitor its freshness, and document recovery steps.', skills: ['Cloud Data Services', 'Git and GitHub'] }
    ]
  },
  {
    role: 'QA Automation Engineer',
    summary: 'Plan tests around risk, automate dependable checks, and help teams release with confidence.',
    stages: [
      { stage: 'Foundations', title: 'Quality and test design', masteryCheck: 'Turn a feature brief into risk-based scenarios with clear expected results.', skills: ['Test Design', 'Programming Fundamentals'] },
      { stage: 'Role skills', title: 'Automate user workflows', masteryCheck: 'Build maintainable browser checks for critical user journeys.', skills: ['JavaScript', 'Test Automation'] },
      { stage: 'Applied practice', title: 'API and integration quality', masteryCheck: 'Verify API contracts, failure cases, and data changes with repeatable checks.', skills: ['API Testing'] },
      { stage: 'Proof of mastery', title: 'Release confidence', masteryCheck: 'Run a focused regression suite in CI and summarize risk from the results.', skills: ['CI/CD', 'Quality Reporting'] }
    ]
  },
  {
    role: 'Mobile App Developer',
    summary: 'Build a mobile application with platform-aware interfaces, reliable data flow, and a tested release.',
    stages: [
      { stage: 'Foundations', title: 'Mobile platform foundations', masteryCheck: 'Build a small native or cross-platform screen and explain its application lifecycle.', skills: ['Kotlin or Swift', 'Mobile Development Fundamentals'] },
      { stage: 'Role skills', title: 'Navigation and mobile UI', masteryCheck: 'Create a multi-screen flow that handles different device sizes and accessibility settings.', skills: ['Mobile UI and Navigation'] },
      { stage: 'Applied practice', title: 'Data, APIs, and offline behavior', masteryCheck: 'Connect an API and provide a useful loading, error, and offline experience.', skills: ['API Integration'] },
      { stage: 'Proof of mastery', title: 'Testing and release readiness', masteryCheck: 'Test key device scenarios and prepare a signed build with release notes.', skills: ['Mobile App Testing', 'App Release and Store Publishing'] }
    ]
  },
  {
    role: 'UX/UI Designer',
    summary: 'Research user needs, design coherent interactions, and validate accessible interface prototypes.',
    stages: [
      { stage: 'Foundations', title: 'User research and problem framing', masteryCheck: 'Summarize interview or observation evidence into a focused user problem and constraints.', skills: ['User Research'] },
      { stage: 'Role skills', title: 'Flows and low-fidelity prototypes', masteryCheck: 'Map a core task and prototype its key states before applying visual polish.', skills: ['Wireframing and Prototyping'] },
      { stage: 'Applied practice', title: 'Visual systems and interaction design', masteryCheck: 'Build a small reusable interface system with clear states and accessible contrast.', skills: ['Visual Design Foundations', 'Design Systems', 'Interaction Design'] },
      { stage: 'Proof of mastery', title: 'Usability validation and case study', masteryCheck: 'Test the prototype with users, record changes made from evidence, and present the result.', skills: ['Usability Testing', 'Web Accessibility'] }
    ]
  },
  {
    role: 'Data Scientist',
    summary: 'Use statistical reasoning and machine learning to answer a defined question and communicate uncertainty.',
    stages: [
      { stage: 'Foundations', title: 'Python and statistical reasoning', masteryCheck: 'Explore a dataset and explain the assumptions behind a basic statistical comparison.', skills: ['Python', 'Statistics & Data Analysis', 'Linear Algebra Fundamentals'] },
      { stage: 'Role skills', title: 'Prepare data and frame a question', masteryCheck: 'Create a clean analysis dataset and define a baseline tied to a measurable question.', skills: ['Data Cleaning', 'Statistical Modeling'] },
      { stage: 'Applied practice', title: 'Model and validate', masteryCheck: 'Compare candidate models with a suitable validation plan and report uncertainty and limitations.', skills: ['Machine Learning', 'Model Evaluation', 'Feature Engineering'] },
      { stage: 'Proof of mastery', title: 'Communicate a reproducible project', masteryCheck: 'Deliver a reproducible notebook or report with findings, limitations, and next steps.', skills: ['Experiment Tracking', 'Data Storytelling'] }
    ]
  }
];

export const countUniqueRoleSkills = roadmap => new Set(roadmap.stages.flatMap(stage => stage.skills)).size;
