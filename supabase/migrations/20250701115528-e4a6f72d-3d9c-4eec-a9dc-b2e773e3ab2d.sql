
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('quantitative', 'logical', 'verbal', 'data')),
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create test attempts table
CREATE TABLE public.test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  questions_data JSONB NOT NULL,
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER NOT NULL, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Questions policies
CREATE POLICY "Everyone can view questions" ON public.questions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage questions" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Test attempts policies
CREATE POLICY "Users can view own test attempts" ON public.test_attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own test attempts" ON public.test_attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all test attempts" ON public.test_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample questions
INSERT INTO public.questions (category, question, options, correct_answer, explanation, difficulty) VALUES
('quantitative', 'If a train travels at 60 km/h for 2 hours, how far does it travel?', 
 '["100 km", "120 km", "140 km", "160 km"]', '120 km', 
 'Distance = Speed × Time = 60 km/h × 2 h = 120 km', 'easy'),

('quantitative', 'What is 15% of 200?', 
 '["25", "30", "35", "40"]', '30', 
 '15% of 200 = (15/100) × 200 = 30', 'easy'),

('quantitative', 'If x + 5 = 12, what is the value of x?', 
 '["5", "6", "7", "8"]', '7', 
 'x + 5 = 12, therefore x = 12 - 5 = 7', 'easy'),

('logical', 'What comes next in the sequence: 2, 4, 8, 16, ?', 
 '["24", "28", "32", "40"]', '32', 
 'Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32', 'medium'),

('logical', 'If all roses are flowers and some flowers are red, which is true?', 
 '["All roses are red", "Some roses are red", "No roses are red", "Some roses may be red"]', 
 'Some roses may be red', 'This follows logically from the given statements', 'medium'),

('verbal', 'Choose the synonym of "abundant":', 
 '["scarce", "plentiful", "limited", "rare"]', 'plentiful', 
 'Abundant means existing in large quantities; plentiful', 'easy'),

('verbal', 'Complete the analogy: Book is to Library as __ is to Museum', 
 '["Painting", "Artifact", "Visitor", "Building"]', 'Artifact', 
 'Books are stored in libraries, artifacts are stored in museums', 'medium'),

('data', 'In a pie chart showing 25% red, 35% blue, 20% green, what percentage is remaining?', 
 '["15%", "20%", "25%", "30%"]', '20%', 
 '100% - (25% + 35% + 20%) = 100% - 80% = 20%', 'easy');

-- Create admin user (you'll need to update this with your actual admin email)
-- This is just a placeholder - you'll need to sign up with this email first
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@aptitudehub.com';
