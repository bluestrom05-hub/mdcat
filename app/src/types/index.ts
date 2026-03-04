// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isPremium: boolean;
  premiumSince?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Subject Types
export interface Subject {
  _id: string;
  name: string;
  code: string;
  type: 'science' | 'english' | 'logical';
  description?: string;
}

// Board Types
export interface Board {
  _id: string;
  name: string;
  code: string;
  description?: string;
}

// Book Types
export interface Book {
  _id: string;
  subjectId: string;
  boardId: string;
  class: number;
  title: string;
  chapterCount: number;
  mcqCount: number;
}

// Chapter Types
export interface Chapter {
  _id: string;
  bookId: string;
  subjectId: string;
  name: string;
  number: number;
  mcqCount: number;
  maxMcqs: number;
}

// MCQ Types
export interface MCQ {
  _id: string;
  chapterId: string;
  subjectId: string;
  bookId?: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}

// Test Session Types
export interface TestSession {
  _id: string;
  userId: string;
  pastPaperId?: string;
  chapterId?: string;
  sessionType: 'practice' | 'past_paper' | 'competition';
  answers: Record<string, string>;
  startTime: string;
  endTime?: string;
  score: number;
  correctCount: number;
  wrongCount: number;
  isCompleted: boolean;
}

// Past Paper Types
export interface PastPaper {
  _id: string;
  title: string;
  year: number;
  totalMarks: number;
  duration: number;
  mcqs: string[];
  isActive: boolean;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  isPremium: boolean;
}

// Hall of Fame Types
export interface HallOfFameEntry {
  _id: string;
  userId: string;
  userName: string;
  month: number;
  year: number;
  rank: number;
  score: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// CSV Upload Types
export interface CSVValidationResult {
  valid: boolean;
  row: {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation?: string;
    rowNumber: number;
  };
  errors: string[];
  isDuplicate?: boolean;
}

export interface CSVUploadPreview {
  validRows: CSVValidationResult[];
  invalidRows: CSVValidationResult[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  remainingSlots: number;
}

// Test Result Types
export interface TestResult {
  score: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  percentage: number;
  timeTaken: number;
  timeTakenFormatted: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  users: {
    total: number;
    premium: number;
  };
  content: {
    totalMCQs: number;
    totalPastPapers: number;
    subjectStats: {
      name: string;
      code: string;
      mcqCount: number;
    }[];
  };
  competition: {
    monthlyParticipants: number;
    currentMonth: number;
    currentYear: number;
  };
}

// Constants
export const CONSTANTS = {
  MAX_CHAPTERS_PER_BOOK: 15,
  MAX_MCQS_PER_CHAPTER: 280,
  MAX_MCQS_ENGLISH: 500,
  MAX_MCQS_LOGICAL: 300,
  CSV_BATCH_SIZE: 200,
  MAX_UPLOAD_BATCH: 250,
  PAST_PAPER_MARKS: 180,
  PAST_PAPER_DURATION: 180,
  PREMIUM_PRICE: 2500,
  MONTHLY_WINNERS_COUNT: 3,
  LEADERBOARD_PAGE_SIZE: 50,
} as const;
