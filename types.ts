
export type MCATSection = 
  | 'Biology' 
  | 'Biochemistry' 
  | 'General Chemistry' 
  | 'Organic Chemistry' 
  | 'Physics' 
  | 'Behavioral Sciences' 
  | 'CARS' 
  | 'Practice Exam';

export type RecurrenceType = 'None' | 'Daily' | 'Weekly' | 'Custom' | 'SpacedRepetition';
export type ViewType = 'daily' | 'weekly' | 'monthly';
export type MasteryRating = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface StudyTask {
  id: string;
  groupId?: string; // Links recurring tasks
  originalTaskId?: string; // Links Spaced Repetition reviews to the original chapter
  reviewIteration?: number; // 0 for original, 1-5 for SR reviews
  title: string;
  description: string;
  section: MCATSection;
  completed: boolean;
  date: string; // ISO format YYYY-MM-DD
  duration: string;
  recurrence?: RecurrenceType;
  customInterval?: number; // Days for custom recurrence
  masteryRating?: MasteryRating;
  isFSRSActive?: boolean; // Flagged for intensive review
  userId?: string;
}

export interface AIResponse {
  suggestion: string;
  updatedTasks: StudyTask[];
}
