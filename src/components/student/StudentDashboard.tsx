import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Clock, Users, Play, CheckCircle, Trophy } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_hours: number;
  is_active: boolean;
}

interface Enrollment {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
  courses: Course;
}

const StudentDashboard = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch enrolled courses
      const { data: enrollmentData } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses (*)
        `)
        .eq('user_id', user?.id);

      const enrolledCourseIds = enrollmentData?.map(e => e.course_id) || [];
      
      // Fetch available courses (not enrolled)
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .not('id', 'in', `(${enrolledCourseIds.join(',') || 'null'})`)
        .order('created_at', { ascending: false });

      setEnrollments(enrollmentData || []);
      setAvailableCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    setEnrolling(courseId);
    
    try {
      const { error } = await supabase
        .from('course_enrollments')
        .insert([{
          user_id: user?.id,
          course_id: courseId,
          progress: 0
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully enrolled in course!"
      });

      fetchData();
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive"
      });
    } finally {
      setEnrolling(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCourses = enrollments.filter(e => e.completed_at);
  const inProgressCourses = enrollments.filter(e => !e.completed_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Learning Dashboard</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{enrollments.length}</p>
            <p className="text-sm text-blue-600">Enrolled Courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Play className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">{inProgressCourses.length}</p>
            <p className="text-sm text-orange-600">In Progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{completedCourses.length}</p>
            <p className="text-sm text-green-600">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">
              {enrollments.length > 0 
                ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
                : 0}%
            </p>
            <p className="text-sm text-purple-600">Avg Progress</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrolled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enrolled">My Courses</TabsTrigger>
          <TabsTrigger value="available">Available Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses ({enrollments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{enrollment.courses.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {enrollment.courses.description}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getDifficultyColor(enrollment.courses.difficulty)}>
                          {enrollment.courses.difficulty}
                        </Badge>
                        <Badge variant="outline">{enrollment.courses.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {enrollment.courses.duration_hours}h
                        </div>
                      </div>
                    </div>
                    {enrollment.completed_at && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{enrollment.progress || 0}%</span>
                    </div>
                    <Progress value={enrollment.progress || 0} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <p className="text-xs text-muted-foreground">
                      Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                    <Button size="sm" variant="outline">
                      Continue Learning
                    </Button>
                  </div>
                </div>
              ))}

              {enrollments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No courses enrolled yet</p>
                  <p className="text-sm">Browse available courses to start learning!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Courses ({availableCourses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableCourses.map((course) => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                        <Badge variant="outline">{course.category}</Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {course.duration_hours}h
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => enrollInCourse(course.id)}
                      disabled={enrolling === course.id}
                      className="ml-4"
                    >
                      {enrolling === course.id ? 'Enrolling...' : 'Enroll Now'}
                    </Button>
                  </div>
                </div>
              ))}

              {availableCourses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>All available courses enrolled!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;