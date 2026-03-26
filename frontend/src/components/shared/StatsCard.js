import React from 'react';

const StatsCard = ({ title, value, icon, color = 'primary', subtitle, trend }) => {
  const colors = {
    primary:  'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    emerald:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber:    'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red:      'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    blue:     'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    violet:   'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  };

  return (
    <div className="card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value ?? '—'}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
          {trend !== undefined && (
            <p className={`text-xs font-medium mt-1 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
