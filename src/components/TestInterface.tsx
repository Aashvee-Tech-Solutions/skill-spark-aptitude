
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const TestInterface = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes in seconds
  const [answers, setAnswers] = useState<string[]>([]);

  // Sample questions - in a real app, these would come from an API
  const sampleQuestions = [
    {
      id: 1,
      question: "If a train travels at 60 km/h for 2 hours, how far does it travel?",
      options: ["100 km", "120 km", "140 km", "160 km"],
      correct: "120 km",
      explanation: "Distance = Speed × Time = 60 km/h × 2 h = 120 km"
    },
    {
      id: 2,
      question: "What is 15% of 200?",
      options: ["25", "30", "35", "40"],
      correct: "30",
      explanation: "15% of 200 = (15/100) × 200 = 30"
    },
    {
      id: 3,
      question: "If x + 5 = 12, what is the value of x?",
      options: ["5", "6", "7", "8"],
      correct: "7",
      explanation: "x + 5 = 12, therefore x = 12 - 5 = 7"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleSubmitTest = () => {
    navigate('/results', { 
      state: { 
        answers, 
        questions: sampleQuestions, 
        category,
        timeSpent: 3600 - timeRemaining 
      } 
    });
  };

  const progressPercentage = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl capitalize">{category} Test</CardTitle>
              <p className="text-indigo-100">Question {currentQuestion + 1} of {sampleQuestions.length}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-xl font-mono">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">
            {sampleQuestions[currentQuestion].question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sampleQuestions[currentQuestion].options.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedAnswer === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedAnswer === option
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300'
                }`}>
                  {selectedAnswer === option && (
                    <Check className="h-3 w-3 text-white m-0.5" />
                  )}
                </div>
                <span className="text-gray-800">{option}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex space-x-3">
          {currentQuestion < sampleQuestions.length - 1 ? (
            <Button
              onClick={handleNextQuestion}
              disabled={!selectedAnswer}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitTest}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Submit Test</span>
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Question Navigator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 gap-2">
            {sampleQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentQuestion(index);
                  setSelectedAnswer(answers[index] || '');
                }}
                className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-indigo-600 text-white'
                    : answers[index]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestInterface;
