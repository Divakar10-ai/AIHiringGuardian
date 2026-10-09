import { apiClient } from './client';

export interface RecommendationDistribution {
  name: string;
  value: number;
}

export interface OverrideTrend {
  time: string;
  rate: number;
  total_reviews: number;
}

export interface MonitoringAlerts {
  bias_alerts: number;
}

export interface MonitoringMetrics {
  recommendation_distribution: RecommendationDistribution[];
  override_trends: OverrideTrend[];
  alerts: MonitoringAlerts;
}

export async function getMonitoringMetrics(): Promise<MonitoringMetrics> {
  return await apiClient<MonitoringMetrics>('/api/v1/monitoring/metrics');
}
