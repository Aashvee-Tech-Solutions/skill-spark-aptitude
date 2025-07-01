
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calculator, 
  Brain, 
  BookOpen, 
  BarChart3, 
  Clock, 
  Trophy,
  TrendingUp,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface CategoryStats {
  category: string;
  attempts: number;
  avgScore: number;
  bestScore: number;
  totalQuestions: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [recentAttempts, setRecentAttempts] = useState<TestAttempt[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      id: 'quantitative',
      name: 'Quantitative Aptitude',
      icon: Calculator,
      description: 'Mathematical calculations, percentages, ratios',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'logical',
      name: 'Logical Reasoning',
      icon: Brain,
      description: 'Pattern recognition, analytical thinking',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 'verbal',
      name: 'Verbal Ability',
      icon: BookOpen,
      description: 'Grammar, vocabulary, reading comprehension',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 'data',
      name: 'Data Interpretation',
      icon: BarChart3,
      description: 'Charts, graphs, data analysis',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent test attempts
      const { data: attempts } = await supabase
        .from('test_attempts')
        .select('*')
        .eq('user_id', user?.id)
        .order('completed_at', { ascending: false })
        .limit(5);

      setRecentAttempts(attempts || []);

      // Fetch question counts per category
      const { data: questions } = await supabase
        .from('questions')
        .select('category');

      const questionCounts = questions?.reduce((acc, q) => {
        acc[q.category] = (acc[q.category] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number }) || {};

      setTotalQuestions(questionCounts);

      // Calculate category stats
      const stats = categories.map(category => {
        const categoryAttempts = attempts?.filter(a => a.category === category.id) || [];
        const avgScore = categoryAttempts.length > 0 
          ? Math.round(categoryAttempts.reduce((sum, a) => sum + a.score, 0) / categoryAttempts.length)
          : 0;
        const bestScore = categoryAttempts.length > 0 
          ? Math.max(...categoryAttempts.map(a => a.score))
          : 0;

        return {
          category: category.id,
          attempts: categoryAttempts.length,
          avgScore,
          bestScore,
          totalQuestions: questionCounts[category.id] || 0
        };
      });

      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const totalAttempts = recentAttempts.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(recentAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
    : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {profile?.full_name || user?.email}!
        </h1>
        <p className="text-xl text-gray-600">Ready to challenge yourself with aptitude tests?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-700">{totalAttempts}</p>
            <p className="text-blue-600">Tests Taken</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-700">{avgScore}%</p>
            <p className="text-green-600">Average Score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-700">
              {Math.max(...categoryStats.map(s => s.bestScore), 0)}%
            </p>
            <p className="text-purple-600">Best Score</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-700">
              {recentAttempts.length > 0 ? Math.round(recentAttempts.reduce((sum, a) => sum + a.time_spent, 0) / recentAttempts.length / 60) : 0}m
            </p>
            <p className="text-orange-600">Avg Time</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Test Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const stats = categoryStats.find(s => s.category === category.id);
            const Icon = category.icon;
            
            return (
              <Card 
                key={category.id}
                className="hover:shadow-lg transition-all duration-300 border-2 hover:border-indigo-200"
              >
                <CardHeader className={`${category.bgColor} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 ${category.color} rounded-lg text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className={`${category.textColor}`}>
                          {category.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {stats?.totalQuestions || 0} questions
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {stats && stats.attempts > 0 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Your Progress</span>
                          <span>{stats.avgScore}% avg</span>
                        </div>
                        <Progress value={stats.avgScore} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{stats.attempts} attempts</span>
                          <span>Best: {stats.bestScore}%</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-2">
                        <p className="text-sm text-gray-500">No attempts yet</p>
                      </div>
                    )}
                    
                    <Button 
                      asChild 
                      className={`w-full ${category.color} hover:opacity-90`}
                      disabled={!stats?.totalQuestions}
                    >
                      <Link to={`/test/${category.id}`}>
                        {stats?.totalQuestions ? 'Start Test' : 'Coming Soon'}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {recentAttempts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <span>Recent Test Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${
                      categories.find(c => c.id === attempt.category)?.color || 'bg-gray-500'
                    } text-white`}>
                      {React.createElement(
                        categories.find(c => c.id === attempt.category)?.icon || Clock,
                        { className: "h-4 w-4" }
                      )}
                    </div>
                    <div>
                      <p className="font-medium capitalize">{attempt.category} Test</p>
                      <p className="text-sm text-gray-600">
                        {attempt.score}% • {Math.floor(attempt.time_spent / 60)}m {attempt.time_spent % 60}s
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={attempt.score >= 80 ? 'default' : attempt.score >= 60 ? 'secondary' : 'destructive'}
                    >
                      {attempt.score >= 80 ? 'Excellent' : attempt.score >= 60 ? 'Good' : 'Needs Work'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(attempt.completed_at).toLocaleDateString()}
                    </p>
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

export default Dashboard;
