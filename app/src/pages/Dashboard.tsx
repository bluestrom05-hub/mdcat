import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp,
  Clock,
  Star,
  ChevronRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">MDCAT Prep</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user?.name}</span>
              {user?.isPremium && (
                <Badge className="bg-yellow-500">
                  <Star className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-500">Tests Taken</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-500">Avg. Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0h</p>
                  <p className="text-sm text-gray-500">Study Time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-sm text-gray-500">Rank</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/practice">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <Target className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Start Practice</CardTitle>
                <CardDescription>
                  Practice MCQs by subject and chapter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  Practice Now
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
                <CardDescription>
                  Take full-length past paper tests
                </CardDescription>
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
                <CardDescription>
                  Compete with other students
                </CardDescription>
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
      </main>
    </div>
  );
};

export default Dashboard;
