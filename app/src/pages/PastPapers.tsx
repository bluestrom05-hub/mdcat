import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { testAPI } from '../services/api';
import { PastPaper } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BookOpen, ChevronLeft, Clock, FileText, Play, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PastPapers: React.FC = () => {
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<PastPaper | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchPastPapers();
  }, []);

  const fetchPastPapers = async () => {
    try {
      const response = await testAPI.getPastPapers();
      setPastPapers(response.data.data);
    } catch (error) {
      toast.error('Failed to load past papers');
    } finally {
      setIsLoading(false);
    }
  };

  const startTest = async () => {
    if (!selectedPaper) return;

    setIsStarting(true);
    try {
      const response = await testAPI.startPastPaper(selectedPaper._id);
      const { sessionId } = response.data.data;
      window.location.href = `/test/${sessionId}`;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start test');
      setIsStarting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Past Papers</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Past Papers</h1>
          <p className="text-gray-600 mt-2">
            Take full-length past paper tests to prepare for MDCAT
          </p>
        </div>

        {pastPapers.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No past papers available</h3>
            <p className="text-gray-500">Check back later for new papers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastPapers.map((paper) => (
              <Card key={paper._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <Badge variant="secondary">{paper.year}</Badge>
                  </div>
                  <CardDescription>
                    Full-length MDCAT practice test
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="h-4 w-4" />
                      <span>{paper.totalMarks} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(paper.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Year: {paper.year}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedPaper(paper)}
                    className="w-full"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-gray-600">
              <li>• Each test consists of 180 MCQs</li>
              <li>• Time limit is 3 hours (180 minutes)</li>
              <li>• Scoring: +1 for correct, -1 for wrong, 0 for unanswered</li>
              <li>• Test auto-submits when time expires</li>
              <li>• Your score contributes to the monthly leaderboard</li>
            </ul>
          </CardContent>
        </Card>
      </main>

      {/* Start Test Dialog */}
      <Dialog open={!!selectedPaper} onOpenChange={() => setSelectedPaper(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Test</DialogTitle>
            <DialogDescription>
              You are about to start <strong>{selectedPaper?.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-500" />
              <span>{selectedPaper?.totalMarks} Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>{selectedPaper ? formatDuration(selectedPaper.duration) : ''}</span>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Once started, the timer cannot be paused. 
                Make sure you have enough time before beginning.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPaper(null)}>
              Cancel
            </Button>
            <Button onClick={startTest} disabled={isStarting}>
              {isStarting ? <Spinner size="sm" className="mr-2" /> : null}
              Start Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PastPapers;
