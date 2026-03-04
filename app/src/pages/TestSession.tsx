import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { testAPI, mcqAPI } from '../services/api';
import { MCQ, TestSession as TestSessionType } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const TestSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<TestSessionType | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showTimeUpDialog, setShowTimeUpDialog] = useState(false);

  const currentMCQ = mcqs[currentIndex];

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowTimeUpDialog(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const fetchSession = async () => {
    try {
      // Get test session details
      const sessionRes = await testAPI.getResult(sessionId!);
      if (sessionRes.data.data.session.isCompleted) {
        navigate(`/results/${sessionId}`);
        return;
      }
    } catch {
      // Session not completed yet, continue
    }

    try {
      // Get past paper details with MCQs
      const pastPapersRes = await testAPI.getPastPapers();
      // For practice sessions, we need to fetch MCQs differently
      // This is simplified - in production, you'd have a dedicated endpoint
      setIsLoading(false);
    } catch (error) {
      toast.error('Failed to load test session');
      navigate('/');
    }
  };

  const handleAnswer = async (answer: string) => {
    if (!currentMCQ) return;

    const newAnswers = { ...answers, [currentMCQ._id]: answer };
    setAnswers(newAnswers);

    try {
      await testAPI.saveAnswer(sessionId!, currentMCQ._id, answer);
    } catch (error) {
      toast.error('Failed to save answer');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await testAPI.submitTest(sessionId!);
      toast.success('Test submitted successfully!');
      navigate(`/results/${sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit test');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      await testAPI.autoSubmit(sessionId!);
      toast.success('Test auto-submitted due to time expiration');
      navigate(`/results/${sessionId}`);
    } catch (error) {
      toast.error('Failed to auto-submit test');
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">Test Session</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="h-5 w-5 text-primary" />
                <span className={timeRemaining < 300 ? 'text-red-600' : ''}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowSubmitDialog(true)}
                disabled={isSubmitting}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            {currentMCQ && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Question {currentIndex + 1} of {mcqs.length}</CardTitle>
                    <Badge variant="outline">
                      {getAnsweredCount()} / {mcqs.length} Answered
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-lg font-medium">
                    {currentMCQ.question}
                  </div>

                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map((option) => {
                      const optionKey = `option${option}` as keyof MCQ;
                      const optionText = currentMCQ[optionKey] as string;
                      const isSelected = answers[currentMCQ._id] === option;

                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswer(option)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {option}
                            </span>
                            <span>{optionText}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentIndex((prev) => Math.min(mcqs.length - 1, prev + 1))}
                disabled={currentIndex === mcqs.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {mcqs.map((mcq, index) => {
                    const isAnswered = !!answers[mcq._id];
                    const isCurrent = index === currentIndex;

                    return (
                      <button
                        key={mcq._id}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                          isCurrent
                            ? 'bg-primary text-white'
                            : isAnswered
                            ? 'bg-green-100 text-green-700 border border-green-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 rounded" />
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded" />
                    <span>Current</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Submit Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              You have answered {getAnsweredCount()} out of {mcqs.length} questions.
              {getAnsweredCount() < mcqs.length && (
                <span className="block mt-2 text-amber-600">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  You have {mcqs.length - getAnsweredCount()} unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Up Dialog */}
      <AlertDialog open={showTimeUpDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Time's Up!</AlertDialogTitle>
            <AlertDialogDescription>
              Your test time has expired. The test will be auto-submitted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleAutoSubmit}>
              Submit Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestSessionPage;
