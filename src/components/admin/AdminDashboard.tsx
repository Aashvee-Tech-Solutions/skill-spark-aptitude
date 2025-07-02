
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Users, BookOpen, BarChart3, Trash2 } from 'lucide-react';
import CourseManagement from './CourseManagement';

interface Question {
  id: string;
  category: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: string;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface TestAttempt {
  id: string;
  user_id: string;
  category: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
  profiles: { full_name: string | null; email: string } | null;
}

const AdminDashboard = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState({
    category: '',
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch questions
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      // Parse options for each question
      const formattedQuestions = questionsData?.map(q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string)
      })) || [];

      // Fetch users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch test attempts
      const { data: attemptsData } = await supabase
        .from('test_attempts')
        .select('*')
        .order('completed_at', { ascending: false });

      // Manually join with profiles data
      const attemptsWithProfiles = attemptsData?.map(attempt => {
        const userProfile = usersData?.find(user => user.id === attempt.user_id);
        return {
          ...attempt,
          profiles: userProfile ? {
            full_name: userProfile.full_name,
            email: userProfile.email
          } : null
        };
      }) || [];

      setQuestions(formattedQuestions);
      setUsers(usersData || []);
      setTestAttempts(attemptsWithProfiles);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.category || !newQuestion.question || !newQuestion.correct_answer) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty options
    const validOptions = newQuestion.options.filter(opt => opt.trim() !== '');
    
    if (validOptions.length < 2) {
      toast({
        title: "Error",
        description: "Please provide at least 2 options",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('questions')
        .insert([{
          ...newQuestion,
          options: JSON.stringify(validOptions)
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question added successfully"
      });

      setNewQuestion({
        category: '',
        question: '',
        options: ['', '', '', ''],
        correct_answer: '',
        explanation: '',
        difficulty: 'medium'
      });

      fetchData();
    } catch (error) {
      console.error('Error adding question:', error);
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Question deleted successfully"
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to delete question",
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

  const stats = {
    totalUsers: users.length,
    totalQuestions: questions.length,
    totalAttempts: testAttempts.length,
    avgScore: testAttempts.length > 0 
      ? Math.round(testAttempts.reduce((sum, attempt) => sum + attempt.score, 0) / testAttempts.length)
      : 0
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{stats.totalUsers}</p>
            <p className="text-sm text-blue-600">Total Users</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{stats.totalQuestions}</p>
            <p className="text-sm text-green-600">Total Questions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{stats.totalAttempts}</p>
            <p className="text-sm text-purple-600">Test Attempts</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{stats.avgScore}%</p>
            <p className="text-sm text-orange-600">Average Score</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="courses">
          <CourseManagement />
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Question
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newQuestion.category} onValueChange={(value) => 
                      setNewQuestion(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quantitative">Quantitative</SelectItem>
                        <SelectItem value="logical">Logical</SelectItem>
                        <SelectItem value="verbal">Verbal</SelectItem>
                        <SelectItem value="data">Data Interpretation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={newQuestion.difficulty} onValueChange={(value) => 
                      setNewQuestion(prev => ({ ...prev, difficulty: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the question"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  {newQuestion.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newQuestion.options];
                        newOptions[index] = e.target.value;
                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                </div>

                <div>
                  <Label htmlFor="correct_answer">Correct Answer</Label>
                  <Input
                    id="correct_answer"
                    value={newQuestion.correct_answer}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, correct_answer: e.target.value }))}
                    placeholder="Enter the correct answer"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explain the correct answer"
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Question
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Questions Library ({questions.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <Badge variant="secondary">{question.category}</Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="font-medium mb-2">{question.question}</p>
                  <div className="text-sm text-gray-600">
                    <p><strong>Options:</strong> {question.options.join(', ')}</p>
                    <p><strong>Correct:</strong> {question.correct_answer}</p>
                    {question.explanation && (
                      <p><strong>Explanation:</strong> {question.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.full_name || user.email}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results ({testAttempts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testAttempts.map((attempt) => (
                  <div key={attempt.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {attempt.profiles?.full_name || attempt.profiles?.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          {attempt.category} • {attempt.score}% ({attempt.score}/{attempt.total_questions})
                        </p>
                        <p className="text-xs text-gray-500">
                          Time: {Math.floor(attempt.time_spent / 60)}m {attempt.time_spent % 60}s • 
                          {new Date(attempt.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={attempt.score >= 80 ? 'default' : attempt.score >= 60 ? 'secondary' : 'destructive'}
                      >
                        {attempt.score >= 80 ? 'Excellent' : attempt.score >= 60 ? 'Good' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
