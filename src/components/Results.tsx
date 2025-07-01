
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, BarChart3, Trophy, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, questions, category, timeSpent } = location.state || {};

  if (!answers || !questions) {
    navigate('/');
    return null;
  }

  const correctAnswers = answers.filter((answer: string, index: number) => 
    answer === questions[index].correct
  ).length;

  const score = Math.round((correctAnswers / questions.length) * 100);
  const timeSpentFormatted = Math.floor(timeSpent / 60) + 'm ' + (timeSpent % 60) + 's';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { text: 'Very Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { text: 'Average', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  const badge = getScoreBadge(score);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Results Header */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-300" />
          </div>
          <CardTitle className="text-3xl mb-2">Test Completed!</CardTitle>
          <p className="text-indigo-100 capitalize">{category} Aptitude Test</p>
        </CardHeader>
      </Card>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <BarChart3 className="h-8 w-8 text-indigo-600 mx-auto" />
              <p className="text-sm text-gray-600">Your Score</p>
              <p className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}%</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Check className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-4xl font-bold text-green-600">{correctAnswers}</p>
              <p className="text-sm text-gray-500">out of {questions.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-6">
            <div className="space-y-2">
              <Clock className="h-8 w-8 text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600">Time Taken</p>
              <p className="text-4xl font-bold text-blue-600">{timeSpentFormatted}</p>
              <p className="text-sm text-gray-500">Average: 2m per question</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Performance</span>
              <span className="text-sm text-gray-500">{score}%</span>
            </div>
            <Progress value={score} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            <span>Question by Question Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question: any, index: number) => {
            const isCorrect = answers[index] === question.correct;
            const userAnswer = answers[index];
            
            return (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
              }`}>
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-gray-800">
                      Question {index + 1}: {question.question}
                    </h4>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${
                      isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Your Answer:</p>
                      <p className={`font-medium ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {userAnswer || 'Not answered'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Correct Answer:</p>
                      <p className="font-medium text-green-700">{question.correct}</p>
                    </div>
                  </div>
                  
                  {!isCorrect && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <span>Back to Dashboard</span>
        </Button>
        <Button
          onClick={() => navigate(`/test/${category}`)}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
        >
          <span>Retake Test</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => navigate('/progress')}
          className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
        >
          <span>View Progress</span>
          <BarChart3 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Results;
