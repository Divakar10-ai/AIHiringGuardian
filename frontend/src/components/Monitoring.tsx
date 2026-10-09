import { useState, useEffect } from 'react';
import { ShieldAlert, UserCheck, PieChart as PieChartIcon } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getMonitoringMetrics, type MonitoringMetrics } from '../api/monitoring';

export const Monitoring = () => {
  const [metrics, setMetrics] = useState<MonitoringMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getMonitoringMetrics();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch monitoring metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const COLORS = {
    'Shortlist': '#0ea5e9',
    'Hold': '#f59e0b',
    'Reject': '#64748b'
  };

  const hasRecommendationData = metrics?.recommendation_distribution.some(d => d.value > 0);
  const totalReviews = metrics?.override_trends.reduce((sum, d) => sum + d.total_reviews, 0) || 0;
  const hasReviewData = totalReviews > 0;

  return (
    <div className="bg-transparent min-h-full pb-20 relative px-8 py-8 h-full">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col">
        
        {/* Sleek Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white drop-shadow-md tracking-tight mb-2">Monitoring</h1>
            <p className="text-sm text-slate-100 font-medium max-w-2xl drop-shadow-md">
              Real-time oversight of algorithmic behavior, human accountability, and systematic risks across the hiring process.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-600">Loading metrics...</div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 p-6 shadow-md shadow-slate-200/50 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Total Reviews (7d)</p>
                  <UserCheck className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-4xl font-bold tracking-tight text-slate-900">{totalReviews}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 p-6 shadow-md shadow-slate-200/50 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest">Bias Alerts</p>
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                {hasReviewData ? (
                  <p className="text-4xl font-bold tracking-tight text-red-500">{metrics?.alerts.bias_alerts}</p>
                ) : (
                  <p className="text-sm font-medium tracking-tight text-slate-600 mt-2">Insufficient data to measure bias.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6 mb-6">
              
              {/* Recommendation Distribution */}
              <div className="col-span-12 lg:col-span-6 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 flex flex-col h-[350px] shadow-md shadow-slate-200/50">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-500" /> Recommendation Distribution
                </h3>
                <p className="text-xs text-slate-600 mb-6">Algorithm outputs across all stages</p>
                <div className="flex-1 w-full relative flex items-center justify-center">
                  {!hasRecommendationData ? (
                    <div className="text-slate-600 text-sm">No evaluation data available.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={metrics?.recommendation_distribution} 
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value"
                        >
                          {metrics?.recommendation_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#64748b'} stroke="#fff" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                          itemStyle={{ color: '#1e293b', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Human Override Rate */}
              <div className="col-span-12 lg:col-span-6 bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-xl p-6 flex flex-col h-[350px] shadow-md shadow-slate-200/50">
                 <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-500" /> Human Override Rate (Last 7 Days)
                </h3>
                <p className="text-xs text-slate-600 mb-6">Frequency of human intervention</p>
                <div className="flex-1 w-full flex items-center justify-center">
                  {!hasReviewData ? (
                    <div className="text-slate-600 text-sm">No human reviews recorded in the last 7 days.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metrics?.override_trends} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                        <Line type="monotone" dataKey="rate" stroke="#059669" strokeWidth={3} dot={{ r: 4, fill: '#059669', strokeWidth: 0 }} name="Override Rate (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
