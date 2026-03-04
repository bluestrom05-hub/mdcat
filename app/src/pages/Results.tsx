import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { testAPI } from '../services/api';
import { TestResult as TestResultType } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  ChevronLeft,
  RotateCcw
} from 'lucide-react';

interface TestSessionData {
  id: string;
  type: string;
  pastPaper?: { title: string; year: number };
  chapter?: { name: string };
  score: number;
  correctCount: number;
  wrongCount: number;
  timeTaken: string;
  completedAt: string;
}

const Results: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [result, setResult] = useState<TestResultType | null>(null);
  const [session, setSession] = useState<TestSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      const response = await testAPI.getResult(sessionId!);
      setSession(response.data.data.session);
      
      // Calculate result from session data
      const totalQuestions = response.data.data.session.correctCount + 
        response.data.data.session.wrongCount;
      const unansweredCount = totalQuestions - 
        (response.data.data.session.correctCount + response.data.data.session.wrongCount);
      
      setResult({
        score: response.data.data.session.score,
        correctCount: response.data.data.session.correctCount,
        wrongCount: response.data.data.session.wrongCount,
        unansweredCount: unansweredCount > 0 ? unansweredCount : 0,
        percentage: totalQuestions > 0 
          ? Math.round((response.data.data.session.correctCount / totalQuestions) * 100) 
          : 0,
        timeTaken: 0,
        timeTakenFormatted: response.data.data.session.timeTaken,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-500' };
    if (percentage >= 70) return { grade: 'B', color: 'text-blue-500' };
    if (percentage >= 60) return { grade: 'C', color: 'text-yellow-500' };
    if (percentage >= 50) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!result || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Results not found</h2>
          <Link to="/">
            <Button className="mt-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { grade, color } = getGrade(result.percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Results</h1>
          <p className="text-gray-600 mt-2">
            {session.pastPaper?.title || session.chapter?.name}
          </p>
        </div>

        {/* Score Card */}
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="flex flex-col items-center">
              <div className={`text-6xl font-bold ${color} mb-2`}>
                {grade}
              </div>
              <div className="text-2xl font-semibold text-gray-700">
                {result.percentage}%
              </div>
              <p className="text-gray-500 mt-2">
                Score: {result.score} points
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {result.correctCount}
              </div>
              <p className="text-sm text-gray-500">Correct</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">
                {result.wrongCount}
              </div>
              <p className="text-sm text-gray-500">Wrong</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-700">
                {result.unansweredCount}
              </div>
              <p className="text-sm text-gray-500">Unanswered</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {result.timeTakenFormatted}
              </div>
              <p className="text-sm text-gray-500">Time Taken</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Message */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.percentage >= 80 ? (
              <div className="flex items-start gap-3">
                <Award className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-green-700">Excellent Performance!</p>
                  <p className="text-gray-600">
                    You did great! Keep up the good work and continue practicing.
                  </p>
                </div>
              </div>
            ) : result.percentage >= 60 ? (
              <div className="flex items-start gap-3">
                <TrendingUp className="h-6 w-6 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-700">Good Performance</p>
                  <p className="text-gray-600">
                    You're doing well, but there's room for improvement. Focus on your weak areas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <RotateCcw className="h-6 w-6 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-700">Keep Practicing</p>
                  <p className="text-gray-600">
                    Don't give up! Practice more to improve your score.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link to="/practice">
            <Button variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Practice More
            </Button>
          </Link>
          <Link to="/past-papers">
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Take Another Test
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Results;
