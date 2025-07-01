
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
}

const TestInterface = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, [category]);

  useEffect(() => {
    if (questions.length === 0) return;
    
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
  }, [questions]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('category', category)
        .limit(10);

      if (error) throw error;

      const formattedQuestions = data?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options)
      })) || [];

      setQuestions(formattedQuestions);
      setAnswers(new Array(formattedQuestions.length).fill(''));
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to load questions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (currentQuestion < questions.length - 1) {
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

  const handleSubmitTest = async () => {
    if (!user) return;

    const correctAnswers = answers.filter((answer, index) => 
      answer === questions[index].correct_answer
    ).length;

    const score = Math.round((correctAnswers / questions.length) * 100);
    const timeSpent = 3600 - timeRemaining;

    try {
      const { error } = await supabase
        .from('test_attempts')
        .insert([{
          user_id: user.id,
          category: category || '',
          questions_data: JSON.stringify(questions),
          answers: JSON.stringify(answers),
          score: score,
          total_questions: questions.length,
          time_spent: timeSpent
        }]);

      if (error) throw error;

      // Navigate to results with the test data
      navigate('/results', { 
        state: { 
          answers, 
          questions, 
          category,
          timeSpent,
          score,
          correctAnswers
        } 
      });
    } catch (error) {
      console.error('Error saving test results:', error);
      toast({
        title: "Error",
        description: "Failed to save test results",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
        <p className="text-gray-600 mb-4">There are no questions available for this category yet.</p>
        <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
      </div>
    );
  }

  const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl capitalize">{category} Test</CardTitle>
              <p className="text-indigo-100">Question {currentQuestion + 1} of {questions.length}</p>
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
            {questions[currentQuestion].question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions[currentQuestion].options.map((option, index) => (
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
          {currentQuestion < questions.length - 1 ? (
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
            {questions.map((_, index) => (
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
