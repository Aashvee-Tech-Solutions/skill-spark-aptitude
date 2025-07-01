
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  email: string;
  category?: string;
  avg_score: number;
  total_attempts: number;
  best_score: number;
  rank: number;
}

const Leaderboard = () => {
  const { user } = useAuth();
  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categoryLeaderboards, setCategoryLeaderboards] = useState<{
    [key: string]: LeaderboardEntry[]
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      // Fetch overall leaderboard with proper join
      const { data: attempts, error: attemptsError } = await supabase
        .from('test_attempts')
        .select(`
          user_id,
          score,
          profiles!inner (
            full_name,
            email
          )
        `);

      if (attemptsError) {
        console.error('Error fetching test attempts:', attemptsError);
        setLoading(false);
        return;
      }

      const userStats = attempts?.reduce((acc: any, attempt: any) => {
        const userId = attempt.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            full_name: attempt.profiles?.full_name || null,
            email: attempt.profiles?.email || '',
            total_score: 0,
            total_attempts: 0,
            best_score: 0
          };
        }
        
        acc[userId].total_score += attempt.score;
        acc[userId].total_attempts += 1;
        acc[userId].best_score = Math.max(acc[userId].best_score, attempt.score);
        
        return acc;
      }, {}) || {};

      const overallLeaderboard = Object.values(userStats)
        .map((stats: any) => ({
          ...stats,
          avg_score: Math.round(stats.total_score / stats.total_attempts)
        }))
        .sort((a: any, b: any) => b.avg_score - a.avg_score)
        .map((entry: any, index) => ({ ...entry, rank: index + 1 }));

      setOverallLeaderboard(overallLeaderboard);

      // Fetch category leaderboards
      const categories = ['quantitative', 'logical', 'verbal', 'data'];
      const categoryData: { [key: string]: LeaderboardEntry[] } = {};

      for (const category of categories) {
        const { data: categoryAttempts } = await supabase
          .from('test_attempts')
          .select(`
            user_id,
            score,
            profiles!inner (
              full_name,
              email
            )
          `)
          .eq('category', category);

        const categoryUserStats = categoryAttempts?.reduce((acc: any, attempt: any) => {
          const userId = attempt.user_id;
          if (!acc[userId]) {
            acc[userId] = {
              user_id: userId,
              full_name: attempt.profiles?.full_name || null,
              email: attempt.profiles?.email || '',
              category,
              total_score: 0,
              total_attempts: 0,
              best_score: 0
            };
          }
          
          acc[userId].total_score += attempt.score;
          acc[userId].total_attempts += 1;
          acc[userId].best_score = Math.max(acc[userId].best_score, attempt.score);
          
          return acc;
        }, {}) || {};

        categoryData[category] = Object.values(categoryUserStats)
          .map((stats: any) => ({
            ...stats,
            avg_score: Math.round(stats.total_score / stats.total_attempts)
          }))
          .sort((a: any, b: any) => b.avg_score - a.avg_score)
          .map((entry: any, index) => ({ ...entry, rank: index + 1 }))
          .slice(0, 10);
      }

      setCategoryLeaderboards(categoryData);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Star className="h-6 w-6 text-gray-300" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { text: 'Champion', variant: 'default' as const };
    if (rank <= 3) return { text: 'Elite', variant: 'secondary' as const };
    if (rank <= 10) return { text: 'Expert', variant: 'outline' as const };
    return { text: 'Rising', variant: 'outline' as const };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const userRank = overallLeaderboard.find(entry => entry.user_id === user?.id);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-600">See how you rank against other test takers</p>
      </div>

      {/* User's Rank Card */}
      {userRank && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getRankIcon(userRank.rank)}
                <div>
                  <p className="font-semibold text-lg">Your Rank: #{userRank.rank}</p>
                  <p className="text-gray-600">Average Score: {userRank.avg_score}%</p>
                </div>
              </div>
              <Badge {...getRankBadge(userRank.rank)}>
                {getRankBadge(userRank.rank).text}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overall" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overall">Overall</TabsTrigger>
          <TabsTrigger value="quantitative">Quantitative</TabsTrigger>
          <TabsTrigger value="logical">Logical</TabsTrigger>
          <TabsTrigger value="verbal">Verbal</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overall">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>Overall Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overallLeaderboard.slice(0, 20).map((entry) => (
                  <div 
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      entry.user_id === user?.id 
                        ? 'bg-indigo-50 border-2 border-indigo-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {entry.rank <= 3 ? (
                          getRankIcon(entry.rank)
                        ) : (
                          <span className="font-bold text-gray-500">#{entry.rank}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {entry.full_name || entry.email}
                          {entry.user_id === user?.id && (
                            <span className="ml-2 text-sm text-indigo-600">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry.total_attempts} tests • Best: {entry.best_score}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{entry.avg_score}%</p>
                      <Badge {...getRankBadge(entry.rank)}>
                        {getRankBadge(entry.rank).text}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {['quantitative', 'logical', 'verbal', 'data'].map((category) => (
          <TabsContent key={category} value={category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <span className="capitalize">{category} Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(categoryLeaderboards[category] || []).map((entry) => (
                    <div 
                      key={entry.user_id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        entry.user_id === user?.id 
                          ? 'bg-indigo-50 border-2 border-indigo-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10">
                          {entry.rank <= 3 ? (
                            getRankIcon(entry.rank)
                          ) : (
                            <span className="font-bold text-gray-500">#{entry.rank}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {entry.full_name || entry.email}
                            {entry.user_id === user?.id && (
                              <span className="ml-2 text-sm text-indigo-600">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {entry.total_attempts} tests • Best: {entry.best_score}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-indigo-600">{entry.avg_score}%</p>
                        <Badge {...getRankBadge(entry.rank)}>
                          {getRankBadge(entry.rank).text}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Leaderboard;
