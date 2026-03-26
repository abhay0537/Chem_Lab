import React from 'react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
    <div className="text-5xl animate-bounce">⚗️</div>
    <div className="w-8 h-8 border-3 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" style={{ borderWidth: 3 }} />
    <p className="text-slate-400 text-sm font-medium">Loading ChemLab...</p>
  </div>
);

export default LoadingScreen;
