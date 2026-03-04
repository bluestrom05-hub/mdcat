import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { leaderboardAPI, subjectAPI } from '../services/api';
import { LeaderboardEntry, Subject } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { 
  BookOpen, 
  Trophy, 
  Users, 
  Target, 
  Crown,
  Medal,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [topPerformers, setTopPerformers] = useState<LeaderboardEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [performersRes, subjectsRes] = await Promise.all([
        leaderboardAPI.getTopPerformers(),
        subjectAPI.getAll(),
      ]);
      setTopPerformers(performersRes.data.data);
      setSubjects(subjectsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300';
      case 2:
        return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300';
      case 3:
        return 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MDCAT Prep</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/leaderboard">
                <Button variant="ghost" size="sm">
                  <Trophy className="h-4 w-4 mr-2" />
                  Leaderboard
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="ghost" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">Admin</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your MDCAT preparation journey
          </p>
          {user?.isPremium && (
            <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600">
              <Star className="h-3 w-3 mr-1" />
              Premium Member
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/practice">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Practice</CardTitle>
                <CardDescription>Practice MCQs by subject and chapter</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Start Practice
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/past-papers">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Past Papers</CardTitle>
                <CardDescription>Take full-length past paper tests</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  View Papers
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/leaderboard">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Compete with other students</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  View Rankings
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Top Performers Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                  Top Performers This Month
                </CardTitle>
                <CardDescription>
                  Congratulations to our top students!
                </CardDescription>
              </div>
              <Link to="/leaderboard">
                <Button variant="outline">View Full Leaderboard</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scores recorded yet this month. Be the first!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPerformers.map((performer) => (
                  <Card
                    key={performer.userId}
                    className={`${getRankColor(performer.rank)} border-2`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        {getRankIcon(performer.rank)}
                        <h3 className="mt-3 font-semibold text-lg">{performer.name}</h3>
                        <p className="text-3xl font-bold text-primary mt-2">
                          {performer.score}
                        </p>
                        <p className="text-sm text-gray-600">points</p>
                        {performer.isPremium && (
                          <Badge className="mt-2 bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subjects Section */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects</CardTitle>
            <CardDescription>Select a subject to start practicing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Link
                  key={subject._id}
                  to={`/practice?subject=${subject._id}`}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{subject.name}</h3>
                          <p className="text-sm text-gray-500">{subject.code}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Home;
