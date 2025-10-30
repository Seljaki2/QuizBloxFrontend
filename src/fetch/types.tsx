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
  media?: string | null;
}


export interface Question {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  text: string;
  answers?: Answer[];
  media?: string | null;
  customTime?: number | null;
  questionType: QuestionType;
}

export interface AppUser  {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    username: string;
    isTeacher: boolean;
};

export interface GuestUser{
  guestUsername: string;
  guestId: string;
}
export type QuestionType =
  | 'CUSTOM_ANWSER'
  | 'MEDIA_ANWSER'
  | 'PRESET_ANWSER';