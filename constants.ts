import type { FacultyMember, Course, Testimonial, FAQItem, GalleryImage, Student, ChatMessage, TeacherQuestion, LiveClass, RecordedLecture, CourseMaterial, CalendarEvent, Notification, Admin, Announcement, Application, RecentSubmission, TeacherRating, BlogPost, HeroSlide, Vlog, AccaFeeCategory, PopupNotification, Comment, HighAchiever, SalaryRequest, MockTest, StudentSubmission, SharedResource, ContactDetails, AdminConversation, StudentAttendanceRecord } from './types.ts';

export const DEFAULT_ACADEMY_LOGO_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJzaGllbGRHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I0IyMjIyMjtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4QjAwMDA7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHBhdGggZD0iTTUwIDIgQyAxNSAxMCwgMTAgNDAsIDEwIDUwIEMgMTAgODAsIDUwIDk4LCA1MCA5OCBDIDUwIDk4LCA5MCA4MCwgOTAgNTAgQyA5MCA0MCwgODUgMTAsIDUwIDIgWiIgZmlsbD0idXJsKCNzaGllbGRHcmFkaWVudCkiLz48dGV4dCB4PSI1MCUiIHk9IjYyJSIgZm9udC1mYW1pbHk9IkludGVyLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjM4IiBmb250LXdlaWdodD0iOTAwIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iLTEiPlJMQTwvdGV4dD48L3N2Zz4=';
export const ACADEMY_NAME = 'Reliant Learners Academy';

export const DEFAULT_CONTACT_DETAILS: ContactDetails = {
  email: 'learnersaccademynp@gmail.com',
  phones: ['+977-9802394518', '+977-9802394519'],
  address: 'Kathmandu, 44600, Nepal',
  officeHours: 'Sun - Fri, 9:00 AM - 5:00 PM',
  socials: [
    {
      id: 1,
      name: 'Facebook',
      url: 'https://www.facebook.com/people/ACCA-at-Learners-Academy/61565499307383/',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAANhJREFUaEPtmFEKgzAMRS8x739p1oN25SI4ZImEttNSxL/QQBTG2SxdB4D/Ap6AAbxjZ3kIdwLmh+2kUdqwNY2WsjXNMt3a5CS7gLUDbHIErAE7wBhgK5N86gaYpIaGZ4A/J50ADsAbgAUga0Y4JgKANnABfPIt4APoAJ2AR8Av8M3a+QGcgSfgCrgBfI8hFQAw3gGbgBvA5y9gBdwATz8AasB2ADgItoANGAB2gA0YAHAENoANGAB2gA0YAHAENoANGAB2gA0YAHAENoANGAB2gA0YAHAENoANAACyzgP6kYpGtgAAAABJRU5ErkJggg==',
    },
    {
      id: 2,
      name: 'WhatsApp',
      url: 'https://wa.me/9779802394517',
      iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAANhJREFUaEPtmFEKgzAMRS8x739p1oN25SI4ZImEttNSxL/QQBTG2SxdB4D/Ap6AAbxjZ3kIdwLmh+2kUdqwNY2WsjXNMt3a5CS7gLUDbHIErAE7wBhgK5N86gaYpIaGZ4A/J50ADsAbgAUga0Y4JgKANnABfPIt4APoAJ2AR8Av8M3a+QGcgSfgCrgBfI8hFQAw3gGbgBvA5y9gBdwATz8AasB2ADgItoANGAB2gA0YAHAENoANGAB2gA0YAHAENoANGAB2gA0YAHAENoANGAB2gA0YAHAENoANAACyzgP6kYpGtgAAAABJRU5ErkJggg==',
    }
  ]
};


export const ADMIN_USER: Admin = {
    id: 'admin01',
    name: 'Admin User',
    email: 'admin@learners.edu',
    avatarUrl: DEFAULT_ACADEMY_LOGO_URL,
};

export const NEWS_TICKER_MESSAGES: string[] = [];

export const HERO_SLIDES: HeroSlide[] = [
    {
        id: 1,
        url: 'https://picsum.photos/seed/hero-campus/1920/1080',
        alt: 'Vibrant campus life at Learners Academy',
        title: {
            main: 'Shape Your Future in Finance with',
            highlighted: 'Reliant Learners Academy',
        },
        subtitle: 'Your premier destination for ACCA qualifications and professional accounting education.',
        buttons: [
            { to: '/admissions', text: 'Apply Now', variant: 'primary' },
            { to: '/courses', text: 'Explore Courses', variant: 'secondary' },
        ],
    },
    {
        id: 2,
        url: 'https://picsum.photos/seed/hero-classroom/1920/1080',
        alt: 'Students engaged in a modern classroom',
        title: {
            main: 'Expert-Led & Interactive',
            highlighted: 'ACCA Classes',
        },
        subtitle: 'Learn from industry veterans in state-of-the-art facilities designed for your success.',
        buttons: [
            { to: '/about', text: 'Meet Our Faculty', variant: 'primary' },
            { to: '/gallery', text: 'View Our Campus', variant: 'secondary' },
        ],
    },
    {
        id: 3,
        url: 'https://picsum.photos/seed/hero-students/1920/1080',
        alt: 'Successful students celebrating their achievements',
        title: {
            main: 'Join a Community of',
            highlighted: 'Successful Achievers',
        },
        subtitle: 'Benefit from our proven high pass rates and dedicated career support to launch your professional journey.',
        buttons: [
            { to: '/admissions', text: 'Start Your Journey', variant: 'primary' },
            { to: '/blog', text: 'Read Success Stories', variant: 'secondary' },
        ],
    }
];

export const FACULTY_MEMBERS: FacultyMember[] = [
    {
        id: 1,
        name: 'Kabin Pyakurel',
        username: 'kabin.p',
        password: 'password123',
        email: 'kabin.p@learners.edu',
        phone: '+977-9801112221',
        qualification: 'FCCA, MBA',
        bio: 'A passionate educator with over 10 years of experience in teaching professional accounting. Specializes in Financial Reporting and Auditing.',
        imageUrl: 'https://picsum.photos/seed/kabin/400/400',
        assignedPapers: ['FR: Financial Reporting', 'AA: Audit and Assurance', 'SBR: Strategic Business Reporting'],
        address: 'Kathmandu, Nepal',
        baseSalary: 80000,
        salaryHistory: []
    },
    {
        id: 2,
        name: 'Susan Bones',
        username: 'susan.b',
        password: 'password123',
        email: 'susan.b@learners.edu',
        phone: '+977-9801112222',
        qualification: 'ACCA, MSc Finance',
        bio: 'Expert in Performance Management and Financial Management, with a knack for simplifying complex topics for students.',
        imageUrl: 'https://picsum.photos/seed/susan/400/400',
        assignedPapers: ['PM: Performance Management', 'FM: Financial Management', 'APM: Advanced Performance Management'],
        address: 'Pokhara, Nepal',
        baseSalary: 75000,
        salaryHistory: []
    }
];


export const COURSES: Course[] = [
    {
        id: 'applied-knowledge',
        title: 'ACCA Applied Knowledge',
        level: 'Applied Knowledge',
        description: 'The Applied Knowledge exams are your starting point, providing a broad introduction to the world of finance and accounting. These exams are the essential foundation for your journey towards becoming a qualified professional.',
        duration: '6-12 months',
        eligibility: 'High School / A-Levels',
        papers: ['AB: Accountant in Business', 'MA: Management Accounting', 'FA: Financial Accounting'],
        syllabus: [
            { topic: "Business and Technology (BT)", details: "Understanding business in the context of its environment, including economic, legal, and regulatory influences on aspects like governance, employments, health and safety, data protection and security." },
            { topic: "Management Accounting (MA)", details: "Developing the knowledge and ability to apply management accounting techniques to quantitative and qualitative information for planning, decision-making, performance evaluation and control." },
            { topic: "Financial Accounting (FA)", details: "Developing knowledge and understanding of the underlying principles and concepts relating to financial accounting and technical proficiency in the use of double-entry accounting techniques." },
        ],
        learningOutcomes: [
            "Understand business structures and their purpose.",
            "Master cost accounting and budgeting techniques.",
            "Prepare and interpret financial statements for single entities."
        ],
        facultyIds: [],
        studentIds: []
    },
    {
        id: 'applied-skills',
        title: 'ACCA Applied Skills',
        level: 'Applied Skills',
        description: 'Building on your existing knowledge, the Applied Skills exams develop the strong, broad, and practical finance skills required of a strategic professional. These exams cover key technical areas that all accountants need to know.',
        duration: '12-18 months',
        eligibility: 'ACCA Applied Knowledge or equivalent',
        papers: ['LW: Corporate and Business Law', 'PM: Performance Management', 'TX: Taxation', 'FR: Financial Reporting', 'AA: Audit and Assurance', 'FM: Financial Management'],
        syllabus: [
            { topic: "Corporate and Business Law (LW)", details: "Understanding the general legal framework, and of specific legal areas relating to business, recognising the need to seek further specialist legal advice where necessary." },
            { topic: "Performance Management (PM)", details: "Applying management accounting techniques to quantitative and qualitative information for planning, decision-making, performance evaluation, and control." },
            { topic: "Taxation (TX)", details: "Understanding the tax system as applicable to individuals, single companies, and groups of companies." },
            { topic: "Financial Reporting (FR)", details: "Developing knowledge and skills in understanding and applying accounting standards and the theoretical framework in the preparation of financial statements of entities, including groups and how to analyse and interpret those financial statements." },
            { topic: "Audit and Assurance (AA)", details: "Understanding and applying assurance engagement, including the regulatory framework." },
            { topic: "Financial Management (FM)", details: "Developing the knowledge and skills expected of a financial manager." },
        ],
        learningOutcomes: [
            "Understand legal frameworks for business.",
            "Apply advanced performance management techniques.",
            "Prepare financial statements for groups (consolidated accounts).",
            "Understand the audit process from planning to reporting."
        ],
        facultyIds: [],
        studentIds: []
    },
    {
        id: 'strategic-professional',
        title: 'ACCA Strategic Professional',
        level: 'Strategic Professional',
        description: 'The Strategic Professional exams prepare you for future leadership positions. They develop the strategic vision, expertise, and professional skills needed to make an impact in the workplace and add value to any organization.',
        duration: '12-18 months',
        eligibility: 'ACCA Applied Skills or equivalent',
        papers: ['SBL: Strategic Business Leader', 'SBR: Strategic Business Reporting', 'AFM: Advanced Financial Management', 'APM: Advanced Performance Management', 'ATX: Advanced Taxation', 'AAA: Advanced Audit and Assurance'],
        options: ['SBL: Strategic Business Leader', 'SBR: Strategic Business Reporting', 'AFM: Advanced Financial Management', 'APM: Advanced Performance Management', 'ATX: Advanced Taxation', 'AAA: Advanced Audit and Assurance'],
        maxOptions: 4,
        syllabus: [
            { topic: "Strategic Business Leader (SBL)", details: "Applying excellent leadership and ethical skills to lead organisations effectively." },
            { topic: "Strategic Business Reporting (SBR)", details: "Applying professional judgment in the reporting of financial information." },
            { topic: "Advanced Financial Management (AFM)", details: "Advising management and/or clients on complex strategic financial management issues." },
            { topic: "Advanced Performance Management (APM)", details: "Applying relevant knowledge, skills and exercise professional judgement in selecting and applying strategic management accounting techniques in different business contexts." },
        ],
        learningOutcomes: [
            "Demonstrate effective leadership and ethical decision-making.",
            "Evaluate and communicate business reporting implications.",
            "Master advanced investment and financing strategies.",
            "Apply strategic management accounting techniques."
        ],
        facultyIds: [],
        studentIds: []
    }
];

export const TESTIMONIALS: Testimonial[] = [
    {
        id: 1,
        name: 'Rohan Thapa',
        program: 'ACCA Applied Skills',
        quote: "The faculty at Learners Academy is top-notch. Their guidance and personalized attention were crucial for my success in the FR and AA papers.",
        imageUrl: 'https://picsum.photos/seed/rohan/200/200',
    },
    {
        id: 2,
        name: 'Anjali Lama',
        program: 'ACCA Strategic Professional',
        quote: "I'm grateful for the supportive learning environment and the extensive mock exam practice. It made a huge difference in my confidence and exam performance.",
        imageUrl: 'https://picsum.photos/seed/anjali/200/200',
    },
    {
        id: 3,
        name: 'Bikash Shrestha',
        program: 'ACCA Foundation',
        quote: "As a beginner, the foundational courses were explained with such clarity. I built a strong base here which is helping me in the higher levels.",
        imageUrl: 'https://picsum.photos/seed/bikash/200/200',
    }
];

export const FAQ_DATA: FAQItem[] = [
    { question: 'What is the duration of the ACCA course?', answer: 'The ACCA qualification can be completed in as little as 2-3 years, but this can vary depending on your starting level, number of exemptions, and how many papers you sit per session.' },
    { question: 'Are there any entry requirements for ACCA?', answer: 'For the ACCA Qualification, you generally need a minimum of two A-Levels and three GCSEs (or their equivalents) in five separate subjects, including English and Maths. If you don\'t meet these, you can start with the Foundations in Accountancy qualifications.' },
    { question: 'How many exams are there in ACCA?', answer: 'There are a total of 13 exams, split into three levels: Applied Knowledge (3 exams), Applied Skills (6 exams), and Strategic Professional (4 exams).' },
    { question: 'Does Learners Academy provide study materials?', answer: 'Yes, we provide comprehensive, up-to-date study materials, including lecture notes, question banks, and mock exams, all included in your course fees.' },
    { question: 'Can I pay my fees in installments?', answer: 'Yes, we offer flexible installment plans to make the course more affordable. Please contact our admissions office for details on the payment schedule.' }
];

export const GALLERY_IMAGES: GalleryImage[] = [
    { id: 1, type: 'image', src: 'https://picsum.photos/seed/campus-1/600/400', alt: 'Main campus building', category: 'Campus' },
    { id: 2, type: 'image', src: 'https://picsum.photos/seed/events-1/600/400', alt: 'Annual student orientation day', category: 'Events' },
    { id: 3, type: 'image', src: 'https://picsum.photos/seed/class-1/600/400', alt: 'Modern classroom with interactive whiteboard', category: 'Classrooms' },
    { id: 4, type: 'image', src: 'https://picsum.photos/seed/students-1/600/400', alt: 'Group of students studying in the library', category: 'Students' },
    { id: 5, type: 'image', src: 'https://picsum.photos/seed/campus-2/600/400', alt: 'Campus garden area', category: 'Campus' },
    { id: 6, type: 'image', src: 'https://picsum.photos/seed/events-2/600/400', alt: 'Guest lecture seminar', category: 'Events' },
    { id: 7, type: 'image', src: 'https://picsum.photos/seed/class-2/600/400', alt: 'Computer lab session', category: 'Classrooms' },
    { id: 8, type: 'image', src: 'https://picsum.photos/seed/students-2/600/400', alt: 'Students collaborating on a project', category: 'Students' },
];

export const VLOGS: Vlog[] = [
    {
        id: 1,
        title: "A Day in the Life of an ACCA Student",
        description: "Follow our student, Anjali, as she takes you through a typical day at Learners Academy.",
        sourceType: 'url',
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder URL
        thumbnailUrl: "https://picsum.photos/seed/vlog-1/800/600",
        publicationDate: "2024-07-20"
    },
    {
        id: 2,
        title: "Campus Tour: Explore Our Facilities",
        description: "Join us for a virtual tour of our state-of-the-art campus, from classrooms to the library.",
        sourceType: 'url',
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder URL
        thumbnailUrl: "https://picsum.photos/seed/vlog-2/800/600",
        publicationDate: "2024-07-15"
    }
];

export const BLOG_POSTS: BlogPost[] = [];

export const STUDENTS: Student[] = [
    {
        id: 1,
        name: 'Anita Sharma',
        avatarUrl: 'https://picsum.photos/seed/anita/200/200',
        studentId: 'S12345',
        password: 'password123',
        email: 'anita.s@example.com',
        phone: '9801234567',
        address: 'Baneshwor, Kathmandu',
        dob: '2002-05-15',
        enrollmentDate: '2023-01-10',
        currentLevel: 'Applied Skills',
        enrolledPapers: ['FR', 'AA', 'PM'],
        totalFee: 150000,
        discount: 10000,
        grades: {},
        attendance: { 'FR': 92, 'AA': 88, 'PM': 95 },
        paymentHistory: [
            { invoiceId: 'INV001', date: '2023-01-10', amount: 50000, status: 'Paid', method: 'eSewa' },
            { invoiceId: 'INV002', date: '2023-04-10', amount: 50000, status: 'Paid', method: 'Khalti' }
        ],
        dueDate: '2024-08-10'
    }
];

export const HIGH_ACHIEVERS: HighAchiever[] = [
    { id: 1, name: 'Ramesh Poudel', avatarUrl: 'https://picsum.photos/seed/ramesh/200/200', achievement: 'Nepal Topper in FR' },
    { id: 2, name: 'Sita Gurung', avatarUrl: 'https://picsum.photos/seed/sita/200/200', achievement: 'Passed all Skills papers in first attempt' },
    { id: 3, name: 'Hari Bahadur', avatarUrl: 'https://picsum.photos/seed/hari/200/200', achievement: 'World Rank Holder in PM' },
    { id: 4, name: 'Gita Thapa', avatarUrl: 'https://picsum.photos/seed/gita/200/200', achievement: 'National Prize Winner in SBL' },
    { id: 5, name: 'Bishal Rai', avatarUrl: 'https://picsum.photos/seed/bishal/200/200', achievement: 'Top Affiliate of the Year' },
    { id: 6, name: 'Maya Sherpa', avatarUrl: 'https://picsum.photos/seed/maya/200/200', achievement: 'Passed all exams in one go' },
    { id: 7, name: 'Nabin K.C.', avatarUrl: 'https://picsum.photos/seed/nabin/200/200', achievement: 'Highest Scorer in AAA' },
    { id: 8, name: 'Priya Karki', avatarUrl: 'https://picsum.photos/seed/priya/200/200', achievement: 'ACCA Scholarship Winner' },
];

export const POPUP_NOTIFICATION: PopupNotification[] = [];

export const ACCA_FEE_STRUCTURE: AccaFeeCategory[] = [
    {
        level: "One-Time Fees",
        items: [
            { details: "ACCA Initial Registration", ukFeesNrs: 15000, collegeFeesNrs: 0 },
            { details: "Annual Subscription Fee", ukFeesNrs: 20000, collegeFeesNrs: 0 }
        ]
    },
    {
        level: "ACCA Knowledge Level",
        items: [
            { paper: "AB, MA, FA", details: "Per Paper Exam Fee", ukFeesNrs: 15000, collegeFeesNrs: 18000 }
        ],
        subtotals: {
            ukFeesNrs: 45000,
            collegeFeesNrs: 54000
        }
    }
];

export const CHAT_MESSAGES: { [paperCode: string]: ChatMessage[] } = {
    'FR': [],
    'AA': [],
    'PM': []
};

export const TEACHER_QUESTIONS: TeacherQuestion[] = [];

export const LIVE_CLASSES: LiveClass[] = [];

export const RECORDED_LECTURES: RecordedLecture[] = [];

export const COURSE_MATERIALS: CourseMaterial[] = [];

export const CALENDAR_EVENTS: CalendarEvent[] = [];

export const NOTIFICATIONS: Notification[] = [];

export const GLOBAL_ANNOUNCEMENTS: Announcement[] = [];

export const PENDING_APPLICATIONS: Application[] = [];

export const TEACHER_RATINGS: TeacherRating[] = [];

export const FACULTY_ANNOUNCEMENTS: Announcement[] = [];

export const MOCK_TESTS: MockTest[] = [];

export const STUDENT_SUBMISSIONS: StudentSubmission[] = [];

export const SHARED_RESOURCES: SharedResource[] = [];

export const SALARY_REQUESTS: SalaryRequest[] = [];

export const ADMIN_CONVERSATIONS: AdminConversation[] = [];

export const STUDENT_ATTENDANCE_LOG: StudentAttendanceRecord[] = [];