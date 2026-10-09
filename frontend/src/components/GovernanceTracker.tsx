import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

export type GovernanceStage = 
  | 'AI Tool Registration'
  | 'Policy Mapping'
  | 'Candidate Evaluation Event'
  | 'Human Review'
  | 'Decision Record'
  | 'Monitoring'
  | 'Audit Report';

export const GOVERNANCE_STAGES: GovernanceStage[] = [
  'AI Tool Registration',
  'Policy Mapping',
  'Candidate Evaluation Event',
  'Human Review',
  'Decision Record',
  'Monitoring',
  'Audit Report'
];

interface GovernanceTrackerProps {
  currentStage: GovernanceStage;
}

export function GovernanceTracker({ currentStage }: GovernanceTrackerProps) {
  const currentIndex = GOVERNANCE_STAGES.indexOf(currentStage);

  return (
    <div className="w-full bg-white/60 backdrop-blur-md border-b border-slate-200/40 py-3 px-8 z-10 relative">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between">
        {GOVERNANCE_STAGES.map((stage, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          let statusColor = 'text-slate-600';
          let bgColor = 'bg-slate-100';
          let borderColor = 'border-slate-300';
          
          if (isCurrent) {
            statusColor = 'text-blue-700';
            bgColor = 'bg-cyan-50';
            borderColor = 'border-cyan-300 shadow-sm';
          } else if (isCompleted) {
            statusColor = 'text-emerald-700';
            bgColor = 'bg-emerald-50';
            borderColor = 'border-emerald-200';
          }

          return (
            <div key={stage} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${bgColor} ${borderColor}`}>
                {isCompleted ? (
                  <CheckCircle2 className={`w-4 h-4 ${statusColor}`} />
                ) : isCurrent ? (
                  <Circle className={`w-4 h-4 ${statusColor} fill-current`} />
                ) : (
                  <Circle className={`w-4 h-4 ${statusColor}`} />
                )}
                <span className={`text-[11px] font-bold tracking-wide whitespace-nowrap uppercase ${statusColor}`}>
                  {stage}
                </span>
              </div>
              {index < GOVERNANCE_STAGES.length - 1 && (
                <div className="flex-1 h-px bg-slate-300 mx-2 flex items-center justify-center">
                  <ArrowRight className={`w-3 h-3 ${isCompleted ? 'text-emerald-600/70' : 'text-slate-400'}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
