
export enum SessionType {
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  EARNED_BREAK = 'earned_break'
}

export interface TimerSettings {
  workTime: number;
  shortBreak: number;
  longBreak: number;
  ritualTime: number;
}

export interface SessionRecord {
  id: string;
  type: SessionType;
  startTime: Date;
  endTime: Date;
  completed: boolean;
  task?: string;
  isClutch?: boolean;
}

export interface DailyStats {
  work: number;
  short_break: number;
  earned_break: number;
  clutch_activations: number;
}

export interface AIAdvice {
  tip: string;
  strategy: string;
  focusMantra: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface FeatureRequest {
  id: string;
  text: string;
  votes: number;
  timestamp: number;
  isInitial?: boolean;
}
