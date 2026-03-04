import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { testAPI, premiumAPI } from '../services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Crown,
  Star,
  ChevronLeft,
  Edit2,
  Check,
  X,
  History,
  Award,
} from 'lucide-react';

interface TestHistory {
  _id: string;
  sessionType: string;
  pastPaper?: { title: string; year: number };
  chapter?: { name: string };
  score: number;
  correctCount: number;
  wrongCount: number;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [testHistory, setTestHistory] = useState<TestHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState<{ isPremium: boolean; premiumSince?: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [historyRes, premiumRes] = await Promise.all([
        testAPI.getHistory({ page: 1, limit: 5 }),
        premiumAPI.getStatus(),
      ]);
      setTestHistory(historyRes.data.data);
      setPremiumStatus(premiumRes.data.data);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      // This would need an API endpoint
      // await authAPI.updateProfile(name);
      if (user) {
        updateUser({ ...user, name });
      }
      setIsEditing(false);
      toast.success('Name updated successfully');
    } catch (error) {
      toast.error('Failed to update name');
    } finally {
      setIsSaving(false);
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
                <User className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Profile</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-48"
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveName}
                        disabled={isSaving}
                      >
                        {isSaving ? <Spinner size="sm" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setName(user?.name || '');
                          setIsEditing(false);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">{user?.name}</h1>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                  {premiumStatus?.isPremium ? (
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium Member
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Free Member</Badge>
                  )}
                  {user?.role === 'admin' && (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Premium Status */}
          {!premiumStatus?.isPremium && (
            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription>
                  Unlock exclusive features and benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    No ads
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Custom themes
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Premium badge
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Advanced stats
                  </li>
                </ul>
                <Link to="/premium">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                    Upgrade Now - 2500 PKR
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {testHistory.length}
                  </p>
                  <p className="text-sm text-gray-500">Tests Taken</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">
                    {testHistory.reduce((acc, t) => acc + t.correctCount, 0)}
                  </p>
                  <p className="text-sm text-gray-500">Correct Answers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test History */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Test History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tests taken yet. Start practicing!
              </div>
            ) : (
              <div className="space-y-3">
                {testHistory.map((test) => (
                  <div
                    key={test._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {test.pastPaper?.title || test.chapter?.name || 'Practice Session'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(test.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {test.score > 0 ? '+' : ''}{test.score}
                      </p>
                      <p className="text-sm text-gray-500">
                        {test.correctCount} correct, {test.wrongCount} wrong
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
