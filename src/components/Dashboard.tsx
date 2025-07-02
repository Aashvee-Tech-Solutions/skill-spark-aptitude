
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './admin/AdminDashboard';
import StudentDashboard from './student/StudentDashboard';

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show admin dashboard for admin users
  if (profile?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Show student dashboard for students
  return <StudentDashboard />;
};

export default Dashboard;
