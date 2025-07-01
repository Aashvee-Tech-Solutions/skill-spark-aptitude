
import React, { useState, useEffect } from 'react';
import { BarChart3, Trophy, Clock, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TestAttempt {
  id: string;
  category: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
}

const ProgressTracker = () => {
  const { user } = useAuth();
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      const { data } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false });

      setTestAttempts(data || []);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const categories = ['quantitative', 'logical', 'verbal', 'data'];
  
  const progressData = categories.map(category => {
    const categoryAttempts = testAttempts.filter(attempt => attempt.category === category);
    const avgScore = categoryAttempts.length > 0 
      ? Math.round(categoryAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / categoryAttempts.length)
      : 0;
    const bestScore = categoryAttempts.length > 0 
      ? Math.max(...categoryAttempts.map(attempt => attempt.score))
      : 0;
    
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1) + ' Aptitude',
      progress: Math.min(avgScore, 100),
      tests: categoryAttempts.length,
      avgScore,
      bestScore
    };
  });

  const totalTests = testAttempts.length;
  const overallAvg = totalTests > 0 
    ? Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalTests)
    : 0;
  const totalStudyTime = Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.time_spent, 0) / 3600);
  const streakDays = 7; // This would need more complex calculation based on attempt dates

  const achievements = [
    { title: 'First Test', icon: '🎯', description: 'Completed your first test', earned: totalTests > 0 },
    { title: 'Speed Demon', icon: '⚡', description: 'Finished a test in under 30 minutes', 
      earned: testAttempts.some(attempt => attempt.time_spent < 1800) },
    { title: 'Perfect Score', icon: '💯', description: 'Scored 100% on any test', 
      earned: testAttempts.some(attempt => attempt.score === 100) },
    { title: 'Consistent Learner', icon: '📚', description: 'Take tests for 7 consecutive days', earned: totalTests >= 5 },
    { title: 'Master', icon: '👑', description: 'Average score above 90% in any category', 
      earned: progressData.some(p => p.avgScore >= 90) },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Your Progress
        </h1>
        <p className="text-gray-600">Track your improvement across all test categories</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{totalTests}</p>
            <p className="text-sm text-blue-600">Total Tests</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{overallAvg}%</p>
            <p className="text-sm text-green-600">Average Score</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{totalStudyTime}h</p>
            <p className="text-sm text-purple-600">Study Time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{Math.max(...progressData.map(p => p.bestScore), 0)}%</p>
            <p className="text-sm text-orange-600">Best Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>Progress by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {progressData.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-800">{item.category}</h3>
                <span className="text-sm text-gray-600">{item.progress}% Progress</span>
              </div>
              
              <Progress value={item.progress} className="h-3" />
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-700">{item.tests}</p>
                  <p className="text-gray-600">Tests Taken</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-700">{item.avgScore}%</p>
                  <p className="text-gray-600">Average Score</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-700">{item.bestScore}%</p>
                  <p className="text-gray-600">Best Score</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all ${
                  achievement.earned
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className="text-3xl">{achievement.icon}</div>
                  <h3 className="font-semibold text-gray-800">{achievement.title}</h3>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  {achievement.earned && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Earned
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Tests */}
      {testAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testAttempts.slice(0, 5).map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{attempt.category} Test</p>
                    <p className="text-sm text-gray-600">
                      {new Date(attempt.completed_at).toLocaleDateString()} • 
                      {Math.floor(attempt.time_spent / 60)}m {attempt.time_spent % 60}s
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{attempt.score}%</p>
                    <Badge 
                      variant={attempt.score >= 80 ? 'default' : attempt.score >= 60 ? 'secondary' : 'destructive'}
                    >
                      {attempt.score >= 80 ? 'Excellent' : attempt.score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;
