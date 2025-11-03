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
  id: String;
  host: AppUser;
  quiz: Quiz;
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

export interface TeacherReport {
    id: string,
    title: string;
    predmet: string;
    description: string;
    avg_score: number;
    questiong_percentages: number[];
    quiz_correct_percentage: number;
    total_students: number;
};

export interface StudentReport {
    id: string,
    title: string;
    predmet: string;
    description: string;
    totalScore: number;
    avg_score: number;
    questionsAndAnswers: QuestionsAndAnswers[];
};

export interface QuestionsAndAnswers {
    question_img_path: string;
    question: string;
    correct_answer: string[];
    is_user_answer_img: boolean;
    user_answer: string;
};
