import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaderboardAPI } from '../services/api';
import { LeaderboardEntry } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Trophy,
  ChevronLeft,
  Medal,
  Award,
  Crown,
  Star,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
} from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; score: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const now = new Date();
  const currentMonth = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  useEffect(() => {
    fetchLeaderboard();
    fetchMyRank();
  }, [page]);

  const fetchLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.getLeaderboard({ page, limit: 50 });
      setEntries(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyRank = async () => {
    try {
      const response = await leaderboardAPI.getMyRank();
      setMyRank(response.data.data);
    } catch (error) {
      // User might not have a rank yet
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-medium">#{rank}</span>;
    }
  };

  const getRowStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
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
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Leaderboard</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monthly Leaderboard</h1>
          <p className="text-gray-600 mt-2">
            {currentMonth} {currentYear}
          </p>
        </div>

        {/* My Rank Card */}
        {myRank && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Your Rank</p>
                  <p className="text-3xl font-bold text-primary">#{myRank.rank}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Your Score</p>
                  <p className="text-3xl font-bold text-primary">{myRank.score}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {entries.slice(0, 3).map((entry, index) => {
              const positions = [1, 0, 2]; // 2nd, 1st, 3rd
              const pos = positions[index];
              const performer = entries[pos];
              if (!performer) return null;

              return (
                <Card
                  key={performer.userId}
                  className={`text-center ${
                    pos === 0
                      ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 scale-110 z-10'
                      : pos === 1
                      ? 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-300 mt-4'
                      : 'bg-gradient-to-br from-amber-100 to-amber-200 border-amber-300 mt-4'
                  }`}
                >
                  <CardContent className="p-4">
                    {pos === 0 ? (
                      <Crown className="h-10 w-10 text-yellow-500 mx-auto mb-2" />
                    ) : pos === 1 ? (
                      <Medal className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    ) : (
                      <Award className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    )}
                    <p className="font-semibold truncate">{performer.name}</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {performer.score}
                    </p>
                    {performer.isPremium && (
                      <Badge className="mt-2 bg-yellow-500">
                        <Star className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No scores recorded yet this month. Be the first!
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {entries.slice(3).map((entry) => (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getRowStyle(
                        entry.rank
                      )}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 text-center">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div>
                          <p className="font-medium">{entry.name}</p>
                          {entry.isPremium && (
                            <Badge className="bg-yellow-500 text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {entry.score}
                        </p>
                        <p className="text-sm text-gray-500">points</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeftIcon className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Leaderboard resets at the start of each month</p>
          <p className="mt-1">Top 3 winners receive Premium status automatically</p>
        </div>
      </main>
    </div>
  );
};

export default Leaderboard;
