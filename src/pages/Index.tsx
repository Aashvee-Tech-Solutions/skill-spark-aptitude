
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import TestInterface from '../components/TestInterface';
import Results from '../components/Results';
import Progress from '../components/Progress';
import Leaderboard from '../components/Leaderboard';
import Navbar from '../components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/test/:category" element={<TestInterface />} />
          <Route path="/results" element={<Results />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default Index;
