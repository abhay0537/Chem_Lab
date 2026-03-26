import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4 text-center p-4">
      <div className="text-8xl mb-4">🧪</div>
      <h1 className="text-6xl font-bold text-white">404</h1>
      <h2 className="text-xl font-semibold text-slate-300">Experiment Not Found</h2>
      <p className="text-slate-500 max-w-sm">This page seems to have evaporated. Let's get you back to the lab.</p>
      <button onClick={() => navigate(-1)} className="mt-4 btn-primary">
        ← Go Back
      </button>
    </div>
  );
};

export default NotFound;
