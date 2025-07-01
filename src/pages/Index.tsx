
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthPage from '@/components/auth/AuthPage';
import Dashboard from '@/components/Dashboard';
import TestInterface from '@/components/TestInterface';
import Results from '@/components/Results';
import Progress from '@/components/Progress';
import Leaderboard from '@/components/Leaderboard';
import AdminDashboard from '@/components/admin/AdminDashboard';
import Navbar from '@/components/Navbar';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/test/:category" element={
            <ProtectedRoute>
              <TestInterface />
            </ProtectedRoute>
          } />
          <Route path="/results" element={
            <ProtectedRoute>
              <Results />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/auth" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const Index = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </Router>
    </Router>
  );
};

export default Index;
