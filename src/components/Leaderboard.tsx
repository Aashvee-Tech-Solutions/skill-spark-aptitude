
import React from 'react';
import { Trophy, Award, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Leaderboard = () => {
  const leaderboardData = [
    { rank: 1, name: 'Sarah Chen', score: 2847, tests: 45, avgScore: 94, streak: 28 },
    { rank: 2, name: 'Michael Rodriguez', score: 2765, tests: 42, avgScore: 91, streak: 15 },
    { rank: 3, name: 'Emily Johnson', score: 2698, tests: 38, avgScore: 89, streak: 22 },
    { rank: 4, name: 'David Park', score: 2634, tests: 41, avgScore: 87, streak: 12 },
    { rank: 5, name: 'Jessica Liu', score: 2598, tests: 36, avgScore: 86, streak: 18 },
    { rank: 6, name: 'Alex Thompson', score: 2543, tests: 39, avgScore: 85, streak: 9 },
    { rank: 7, name: 'Maria Garcia', score: 2487, tests: 34, avgScore: 84, streak: 14 },
    { rank: 8, name: 'You', score: 2345, tests: 26, avgScore: 74, streak: 12 },
    { rank: 9, name: 'Ryan Wilson', score: 2298, tests: 31, avgScore: 82, streak: 7 },
    { rank: 10, name: 'Lisa Anderson', score: 2234, tests: 29, avgScore: 81, streak: 11 },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Award className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankClass = (rank: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return 'bg-blue-50 border-blue-200 border-2';
    }
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const topThree = leaderboardData.slice(0, 3);
  const remainingUsers = leaderboardData.slice(3);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Leaderboard
        </h1>
        <p className="text-gray-600">See how you rank against other learners</p>
      </div>

      {/* Top 3 Podium */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-end space-x-4">
            {/* Second Place */}
            <div className="text-center">
              <div className="relative">
                <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-gray-300">
                  <AvatarFallback className="text-lg font-bold bg-gray-100">
                    {topThree[1]?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Award className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800">{topThree[1]?.name}</h3>
              <p className="text-2xl font-bold text-gray-600">{topThree[1]?.score}</p>
              <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600 mt-2">
                #2
              </div>
            </div>

            {/* First Place */}
            <div className="text-center">
              <div className="relative">
                <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-yellow-400">
                  <AvatarFallback className="text-xl font-bold bg-yellow-100">
                    {topThree[0]?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-3 -right-2">
                  <Crown className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{topThree[0]?.name}</h3>
              <p className="text-3xl font-bold text-yellow-600">{topThree[0]?.score}</p>
              <div className="bg-yellow-100 px-3 py-1 rounded-full text-sm text-yellow-700 mt-2">
                Champion
              </div>
            </div>

            {/* Third Place */}
            <div className="text-center">
              <div className="relative">
                <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-orange-300">
                  <AvatarFallback className="text-lg font-bold bg-orange-100">
                    {topThree[2]?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2">
                  <Award className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-800">{topThree[2]?.name}</h3>
              <p className="text-2xl font-bold text-orange-600">{topThree[2]?.score}</p>
              <div className="bg-orange-100 px-3 py-1 rounded-full text-sm text-orange-600 mt-2">
                #3
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Rankings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboardData.map((user, index) => {
            const isCurrentUser = user.name === 'You';
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${getRankClass(user.rank, isCurrentUser)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 text-center">
                      {getRankIcon(user.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={`font-semibold ${isCurrentUser ? 'bg-blue-100 text-blue-700' : ''}`}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className={`font-semibold ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                        {user.name}
                        {isCurrentUser && <span className="ml-2 text-sm text-blue-600">(You)</span>}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user.tests} tests • {user.streak} day streak
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isCurrentUser ? 'text-blue-700' : 'text-gray-800'}`}>
                      {user.score}
                    </p>
                    <p className="text-sm text-gray-600">{user.avgScore}% avg</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-blue-700">Rank #8</p>
            <p className="text-sm text-blue-600">Your Current Position</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-green-700">+3</p>
            <p className="text-sm text-green-600">Positions This Week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <Crown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-lg font-bold text-purple-700">502</p>
            <p className="text-sm text-purple-600">Points to Next Rank</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
