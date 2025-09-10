// FIX: Removed unnecessary self-import of 'HighAchiever' that conflicted with the interface declaration below.

export type UserRole = 'student' | 'faculty' | 'admin';

export interface Admin {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export interface SalaryPayment {
  id: string;
  date: string;
  amount: number;
  method: 'Bank Transfer' | 'Cash' | 'Cheque';
  category: 'Salary' | 'Tuition Fee' | 'Other';
  otherCategory?: string; // For "Other" category
  notes?: string;
  processedBy: string; // Admin's name
}


export interface SalaryRequest {
    id: number;
    facultyId: number;
    facultyName: string;
    message: string;
    status: 'Pending' | 'Resolved';
    requestDate: string;
    resolvedDate?: string;
}


export interface FacultyMember {
  id: number;
  name: string;
  username: string;
  password?: string;
  email: string;
  phone: string;
  qualification: string;
  bio: string;
  imageUrl: string;
  assignedPapers: string[];
  address: string;
  dob?: string;
  socialMediaUrl?: string;
  baseSalary: number;
  salaryHistory?: SalaryPayment[];
}

export interface Course {
  id:string;
  title: string;
  level: 'Applied Knowledge' | 'Applied Skills' | 'Strategic Professional';
  description: string;
  duration: string;
  eligibility: string;
  papers: string[];
  essentials?: string[];
  options?: string[];
  maxOptions?: number;
  syllabus: { topic: string; details: string; }[];
  learningOutcomes: string[];
  facultyIds: number[];
  studentIds: number[];
}

export interface Testimonial {
  id: number;
  name: string;
  program: string;
  quote: string;
  imageUrl: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HeroSlide {
    id: number; // Use a unique ID for management
    url: string;
    alt: string;
    title: {
        main: string;
        highlighted: string;
    };
    subtitle: string;
    buttons: {
        to: string;
        text: string;
        variant: 'primary' | 'secondary';
    }[];
}


export interface GalleryImage {
  id: number;
  type: 'image' | 'video';
  src: string; // URL for image or thumbnail for video
  alt: string;
  category: 'Campus' | 'Events' | 'Classrooms' | 'Students' | 'Vlogs';
  videoUrl?: string; // URL for the video file or embed link
  localVideoSrc?: string; // Data URL for uploaded video
}

export interface Message {
  sender: 'user' | 'ai';
  text: string;
}

export interface Comment {
  id: number;
  authorName: string;
  authorImageUrl?: string;
  text: string;
  timestamp: string;
}

export interface BlogPost {
  id: string; // This will be the URL slug
  title: string;
  authorId: number;
  authorType: 'faculty' | 'student';
  publicationDate: string;
  excerpt: string;
  content: string; // Could be Markdown in a real app
  imageUrl: string;
  tags: string[];
  comments?: Comment[];
  status: 'Published' | 'Draft';
  isFeatured: boolean;
  timeToRead: number; // in minutes
}

export interface Vlog {
    id: number;
    title: string;
    description: string;
    sourceType: 'url' | 'upload';
    videoUrl?: string; // YouTube embed URL
    localVideoSrc?: string; // Base64 data URL for uploaded video
    thumbnailUrl: string; // Can be a URL or a Base64 data URL
    publicationDate: string;
}

export interface AccaFeeItem {
    paper?: string;
    details: string;
    ukPounds?: number;
    ukFeesNrs?: number;
    collegeFeesNrs?: number;
    notes?: string;
}

export interface AccaFeeCategory {
    level: string;
    description?: string;
    items: AccaFeeItem[];
    subtotals?: {
        ukFeesNrs?: number;
        collegeFeesNrs?: number;
    }
    notes?: string;
}

// Student Portal Specific Types
export interface GradeEntry {
  score: number;
  date: string; // e.g., '2024-07-25'
  examType: 'Mock' | 'Internal' | 'Final';
}

export interface Student {
  id: number;
  name: string;
  avatarUrl: string;
  studentId: string;
  password?: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  socialMediaUrl?: string;
  enrollmentDate: string;
  currentLevel: 'Applied Knowledge' | 'Applied Skills' | 'Strategic Professional';
  enrolledPapers: string[];
  totalFee: number;
  discount: number;
  feeItems?: { description: string; amount: number; }[];
  feeRemarks?: string; // Remarks from admin regarding the fee structure
  grades?: { [paperCode: string]: GradeEntry[] };
  attendance?: { [paperCode: string]: number };
  paymentHistory?: PaymentHistoryItem[];
  dueDate: string;
}

export interface ChatAttachment {
    type: 'image' | 'video' | 'document' | 'link';
    url: string; 
    name?: string;
}

export interface ChatMessage {
  id: number;
  studentId: number;
  text: string;
  timestamp: string;
  attachment?: ChatAttachment;
}

export interface TeacherQuestion {
  id: number;
  studentId?: number;
  studentName?: string;
  paper: string;
  question: string;
  questionAttachment?: ChatAttachment;
  status: 'Pending' | 'Answered';
  answer?: string;
  answerAttachment?: ChatAttachment;
  askedDate: string;
  answeredBy?: string;
}

export interface LiveClass {
  id: number;
  paper: string;
  topic: string;
  instructor: string;
  startTime: string;
  status: 'Live' | 'Upcoming';
  joinLink: string;
}

export interface RecordedLecture {
  id: number;
  paper: string;
  topic: string;
  date: string;
  videoUrl: string;
}

export interface CourseMaterial {
  id: number;
  paper: string;
  title: string;
  type: 'PDF' | 'Notes' | 'Assignment';
  uploadDate: string;
  downloadLink: string;
}

export interface FeeSummary {
  outstandingBalance: number;
  dueDate: string;
  lastPaymentDate: string;
  lastPaymentAmount: number;
}

export interface PaymentHistoryItem {
  invoiceId: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending Verification' | 'Rejected';
  method: 'eSewa' | 'Khalti' | 'Mobile Banking' | 'ConnectIPS' | 'Cash';
  remarks?: string;
  screenshotUrl?: string; // Base64 data URL for uploaded screenshots
  rejectionReason?: string; // Reason for rejection by admin
  verifiedBy?: string; // Admin name
  verificationDate?: string;
}

export interface DownloadItem {
  id: number; // Corresponds to CourseMaterial or RecordedLecture ID
  title: string;
  progress: number;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'canceled' | 'failed';
  size: number; // in KB, for simulation
  intervalId?: any; // To store interval ID for pausing/resuming
}

export interface CalendarEvent {
  id: number | string;
  date: string;
  title: string;
  type: 'class' | 'deadline' | 'exam';
  startTime?: string;
  endTime?: string;
  paper?: string;
  instructor?: string; // For faculty schedule
  joinLink?: string;
}


export interface Notification {
  id: number;
  type: 'grade' | 'deadline' | 'material' | 'announcement';
  title: string;
  message: string;
  timestamp: string; // e.g., "5 minutes ago"
  read: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string; // faculty name or 'Admin'
  audience: 'All Students' | 'All Faculty' | 'All Students & Faculty' | string; // string for specific paper
}

export interface Application {
    id: number;
    fullName: string;
    email: string;
    program: string;
    submittedDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    phone?: string;
    address?: string;
    dob?: string;
    socialMediaUrl?: string;
    selectedPapers?: string[];
    photoUrl?: string;
    documentUrl?: string;
    documentName?: string;
    studentId?: string;
}

export interface RecentSubmission {
    id: number;
    studentName: string;
    paper: string;
    assignmentTitle: string;
    submittedAt: string; // e.g., "2 hours ago"
}

export interface TeacherRating {
  id: number;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string; 
  rating: number; // 1-5
  feedback: string;
  classTopic: string;
  date: string;
}

export interface PopupNotification {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  link?: string;
  linkText?: string;
}

export interface HighAchiever {
  id: number;
  name: string;
  avatarUrl: string;
  achievement: string;
}

export interface SharedResource {
  id: number;
  studentId: number;
  studentName: string;
  studentAvatarUrl: string;
  paper: string; // The full paper name
  title: string;
  description: string;
  url: string;
  timestamp: string;
}

// Mock Test System Types
export interface MCQOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: number;
    type: 'MCQ' | 'Theoretical';
    questionText: string;
    points: number;
    mcqOptions?: MCQOption[]; // Only for MCQ
}

export interface MockTest {
    id: number;
    title: string;
    paper: string; // Full paper name like 'FR: Financial Reporting'
    createdByFacultyId: number;
    status: 'Draft' | 'Published';
    durationMinutes: number; // e.g., 180 for 3 hours
    questions: Question[];
    publishDate?: string;
    scheduledStartTime?: string; // ISO string for scheduled start time
    isLocked?: boolean; // To manually lock/unlock the test
}

export interface StudentAnswer {
    questionId: number;
    answerText?: string; // For theoretical
    selectedOptionId?: number; // For MCQ
    awardedPoints?: number; // For manual grading of theoretical questions
    suggestion?: string; // Feedback from the faculty
}

export interface StudentSubmission {
    id: number;
    studentId: number;
    testId: number;
    answers: StudentAnswer[];
    startTime: string; // ISO string
    submittedAt: string; // ISO string
    status: 'In Progress' | 'Completed';
    isGraded?: boolean; // Set to true after faculty grades theoretical parts
    totalAwardedPoints?: number; // Final total score after manual grading
}

export interface PaymentQRCode {
  id: number;
  title: string;
  imageUrl: string;
}

export interface SocialMediaLink {
  id: number;
  name: string;
  url: string;
  iconUrl: string; // Base64 Data URL for the PNG image
}

export interface ContactDetails {
  email: string;
  phones: string[];
  address: string;
  officeHours: string;
  socials: SocialMediaLink[];
}

export interface ConversationMessage {
  sender: 'user' | 'admin'; // 'user' is student/faculty
  text: string;
  timestamp: string;
}

export interface AdminConversation {
  id: number; // This is the thread ID
  participantId: number; // Student or Faculty ID
  participantName: string;
  participantRole: 'student' | 'faculty';
  subject: string;
  status: 'Pending' | 'Resolved';
  lastUpdate: string;
  messages: ConversationMessage[];
}

export interface StudentAttendanceRecord {
  classId: number;
  studentId: number;
  joinTime: string; // ISO string
}