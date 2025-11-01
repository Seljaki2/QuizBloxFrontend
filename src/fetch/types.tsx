export interface Quiz {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  description: string;
  subject: Subject;
  image?: string | null;
  questions: Question[];
  creator: AppUser;
  isPublic: boolean;
  options?: Record<string, any> | null;
}

export interface Result {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  user?: AppUser | null;
  username?: string | null;
  answer: Answer;
  userEntry?: string | null;
}

export interface Subject {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  name: string;
  teacher: AppUser[];
  quizzes: Quiz[];
}



export interface Answer {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  text: string;
  position: number;
  isCorrect: boolean;
  question: Question;
  results?: Result[];
  media?: any | null;
}


export interface Question {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  text: string;
  answers?: Answer[];
  media?: any | null;
  customTime?: number;
  questionType: QuestionType;
}

export interface AppUser {
  isAdmin: boolean;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isTeacher: boolean;
  totalScore: number | undefined;
};

export interface Session {
  host: AppUser;
  quiz: Quiz;
  endTime: Date;
}

export interface GuestUser {
  guestUsername: string;
  guestId: string;
  totalScore: number | undefined;
}
export type QuestionType =
  | 'CUSTOM_ANWSER'
  | 'MEDIA_ANWSER'
  | 'PRESET_ANWSER';