
import React from 'react';
import { BarChart3, Trophy, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const ProgressTracker = () => {
  const progressData = [
    { category: 'Quantitative Aptitude', progress: 75, tests: 8, avgScore: 78, bestScore: 92 },
    { category: 'Logical Reasoning', progress: 60, tests: 5, avgScore: 72, bestScore: 85 },
    { category: 'Verbal Ability', progress: 85, tests: 10, avgScore: 81, bestScore: 95 },
    { category: 'Data Interpretation', progress: 45, tests: 3, avgScore: 65, bestScore: 78 },
  ];

  const achievements = [
    { title: 'First Test', icon: '🎯', description: 'Completed your first test', earned: true },
    { title: 'Speed Demon', icon: '⚡', description: 'Finished a test in under 30 minutes', earned: true },
    { title: 'Perfect Score', icon: '💯', description: 'Scored 100% on any test', earned: false },
    { title: 'Consistent Learner', icon: '📚', description: 'Take tests for 7 consecutive days', earned: true },
    { title: 'Master', icon: '👑', description: 'Average score above 90% in any category', earned: false },
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
            <p className="text-2xl font-bold text-blue-700">26</p>
            <p className="text-sm text-blue-600">Total Tests</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">74%</p>
            <p className="text-sm text-green-600">Average Score</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">15h</p>
            <p className="text-sm text-purple-600">Study Time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">12</p>
            <p className="text-sm text-orange-600">Streak Days</p>
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
                <span className="text-sm text-gray-600">{item.progress}% Complete</span>
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
                    <div className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Earned
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Performance chart will be displayed here</p>
              <p className="text-sm">Track your scores over time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;
