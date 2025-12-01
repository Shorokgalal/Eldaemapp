export interface Reflection {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  goalId: string;
  content: string;
  createdAt: Date;
  likes: string[];
}

export interface Question {
  id: string;
  text: string;
  createdAt: Date;
  subscriberCount: number;
}

export interface QuestionResponse {
  id: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  questionId: string;
  content: string;
  createdAt: Date;
  likes: string[];
}