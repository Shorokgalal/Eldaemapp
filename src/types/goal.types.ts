export interface Goal {
  id: string;
  title: string;
  description: string;
  category?: string;
  color?: string;
  icon?: string;
  duration?: string;
  createdBy: string;
  createdAt: Date;
  subscriberCount: number;
  progress?: number;
  isPinned?: boolean;
  totalVotes?: number;
  yesVotes?: number;
  noVotes?: number;
}

export type GoalStatus = 'active' | 'paused' | 'finished' | 'pending_renewal';

export interface DailyRecord {
  date: Date;
  status: 'completed' | 'failed' | 'skipped';
  quantity?: number;
  reflection?: string;
}

export interface Cycle {
  cycleNumber: number;
  startDate: Date;
  endDate: Date | null;
  status: GoalStatus;
  dailyRecords: DailyRecord[];
}

export interface UserGoalHistory {
  id: string;
  goalId: string;
  goalTitle: string;
  userId: string;
  status: GoalStatus;
  cycles: Cycle[];
  currentStreak: number;
  joinedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  goalId: string;
  joinedAt: Date;
  status: 'active' | 'paused' | 'completed';
  currentCycle: number;
  cycleStartDate: Date;
  joinAnswers?: {
    why: string;
    when: string;
    what: string;
  };
}

export interface CycleRenewal {
  id: string;
  userId: string;
  goalId: string;
  subscriptionId: string;
  cycleNumber: number;
  createdAt: Date;
  cycleWhy: string;
  workSchedule: string;
  goals: string;
}

export interface Vote {
  id: string;
  userId: string;
  goalId: string;
  subscriptionId: string;
  cycleNumber: number;
  vote: 'yes' | 'no';
  date: Date;
  quantity?: number;
  hasReflection?: boolean;
}

export interface VoteHistoryItem {
  date: Date;
  vote: 'yes' | 'no' | 'none';
}
