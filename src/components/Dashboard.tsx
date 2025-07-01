
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Award, BarChart3, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const testCategories = [
    {
      id: 'quantitative',
      title: 'Quantitative Aptitude',
      description: 'Mathematical problem solving and numerical reasoning',
      difficulty: 'Beginner to Advanced',
      questions: 50,
      time: '60 min',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      id: 'logical',
      title: 'Logical Reasoning',
      description: 'Pattern recognition and logical thinking skills',
      difficulty: 'Intermediate',
      questions: 40,
      time: '45 min',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      id: 'verbal',
      title: 'Verbal Ability',
      description: 'Language comprehension and communication skills',
      difficulty: 'Beginner to Expert',
      questions: 35,
      time: '40 min',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      id: 'data',
      title: 'Data Interpretation',
      description: 'Chart analysis and data comprehension',
      difficulty: 'Advanced',
      questions: 30,
      time: '50 min',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    }
  ];

  const recentStats = {
    testsCompleted: 12,
    averageScore: 78,
    totalTime: '8h 30m',
    streak: 5
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to AptitudeHub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master your aptitude skills with our comprehensive testing and learning platform
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tests Completed</p>
                <p className="text-2xl font-bold text-blue-700">{recentStats.testsCompleted}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Average Score</p>
                <p className="text-2xl font-bold text-green-700">{recentStats.averageScore}%</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Study Time</p>
                <p className="text-2xl font-bold text-purple-700">{recentStats.totalTime}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Current Streak</p>
                <p className="text-2xl font-bold text-orange-700">{recentStats.streak} days</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Choose Your Test Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader className={`${category.bgColor} rounded-t-lg`}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className={`text-xl ${category.textColor}`}>
                      {category.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      {category.description}
                    </CardDescription>
                  </div>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>📊 {category.difficulty}</span>
                  <span>❓ {category.questions} Questions</span>
                  <span>⏱️ {category.time}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Your Progress</span>
                    <span className="text-gray-700 font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>

                <Link to={`/test/${category.id}`}>
                  <Button className={`w-full bg-gradient-to-r ${category.color} hover:opacity-90 transition-opacity`}>
                    Start Test
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { test: 'Quantitative Aptitude', score: 85, date: '2 hours ago', status: 'completed' },
              { test: 'Logical Reasoning', score: 72, date: '1 day ago', status: 'completed' },
              { test: 'Verbal Ability', score: 90, date: '2 days ago', status: 'completed' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.test}</p>
                    <p className="text-sm text-gray-600">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-green-600">{activity.score}%</p>
                  <p className="text-xs text-gray-500 capitalize">{activity.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
