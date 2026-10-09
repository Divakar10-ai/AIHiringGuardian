import React from 'react';

export const AppLogo: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" className="text-cyan-500" />
    <path d="M7 17c1.5-2 3.5-3 5-3s3.5 1 5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cyan-500" />
    <circle cx="12" cy="11" r="1" fill="currentColor" className="text-blue-500" />
    <circle cx="9" cy="15" r="1" fill="currentColor" className="text-blue-500" />
    <circle cx="15" cy="15" r="1" fill="currentColor" className="text-blue-500" />
    <path d="M12 11l-3 4M12 11l3 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-blue-500" />
  </svg>
);
