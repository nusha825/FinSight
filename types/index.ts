export interface User {
  id: number;
  fullName: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Aquarium {
  id: number;
  userId: number;
  name: string;
  height: number;
  width: number;
  length: number;
  fishCount: number;
  createdAt: string;
}

export interface FishReport {
  id: number;
  userId: number;
  aquariumId: number | null;
  videoUri: string | null;
  fishCondition: 'Normal' | 'Stressed' | 'Hungry';
  suggestion: string;
  temperature: number;
  phLevel: number;
  waterStatus: 'Safe' | 'Warning' | 'Dangerous';
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  type: 'water_quality' | 'fish_stress' | 'reminder';
  isRead: boolean;
  createdAt: string;
}

export interface WaterQuality {
  temperature: number;
  phLevel: number;
  status: 'Safe' | 'Warning' | 'Dangerous';
  suggestion: string;
}
