import React from 'react';

export const HazardBadge = ({ level }) => {
  const classes = {
    Low:     'hazard-low',
    Medium:  'hazard-medium',
    High:    'hazard-high',
    Extreme: 'hazard-extreme',
  };
  const icons = { Low: '🟢', Medium: '🟡', High: '🟠', Extreme: '🔴' };
  return (
    <span className={`badge ${classes[level] || 'hazard-low'}`}>
      {icons[level]} {level}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const classes = {
    approved: 'status-approved',
    pending:  'status-pending',
    returned: 'status-returned',
    rejected: 'status-rejected',
    overdue:  'status-overdue',
  };
  const icons = { approved: '✅', pending: '⏳', returned: '↩️', rejected: '❌', overdue: '⚠️' };
  return (
    <span className={`badge ${classes[status] || 'status-pending'}`}>
      {icons[status]} {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export const TypeBadge = ({ type }) => (
  <span className={`badge ${type === 'borrow' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
    {type === 'borrow' ? '📤 Borrow' : '📥 Return'}
  </span>
);

export default HazardBadge;
