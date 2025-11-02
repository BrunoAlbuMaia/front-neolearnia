import {  apiRequest } from './client';
import type {
  DashboardOverview,
  DashboardActivity,
  DashboardDifficulty,
  DashboardReviewSchedule,
  DashboardSpeedAnalysis,
} from '../types';

export const dashboardApi = {
  getOverview: () =>
    apiRequest<DashboardOverview>('GET', '/api/dashboard/overview'),

  getActivity: () =>
    apiRequest<DashboardActivity[]>('GET','/api/dashboard/activity'),

  getDifficulty: () =>
    apiRequest<DashboardDifficulty>('GET','/api/dashboard/difficulty'),

  getReviewSchedule: () =>
    apiRequest<DashboardReviewSchedule>('GET','/api/dashboard/review_schedule'),

  getSpeedAnalysis: () =>
    apiRequest<DashboardSpeedAnalysis>('GET', '/api/dashboard/speed_analysis'),
};

