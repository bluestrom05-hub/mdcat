import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { subjectAPI, bookAPI, chapterAPI, testAPI } from '../services/api';
import { Subject, Book, Chapter } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BookOpen, ChevronLeft, Play, FileText } from 'lucide-react';

const Practice: React.FC = () => {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const subjectIdFromUrl = searchParams.get('subject');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectIdFromUrl || '');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchBooks();
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters();
    }
  }, [selectedBook]);

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data.data);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await bookAPI.getAll({ subjectId: selectedSubject });
      setBooks(response.data.data);
      setSelectedBook('');
      setChapters([]);
    } catch (error) {
      toast.error('Failed to load books');
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await chapterAPI.getAll({ bookId: selectedBook });
      setChapters(response.data.data);
    } catch (error) {
      toast.error('Failed to load chapters');
    }
  };

  const startPractice = async (chapterId: string) => {
    setIsStarting(true);
    try {
      const response = await testAPI.startPractice(chapterId);
      const { sessionId } = response.data.data;
      window.location.href = `/test/${sessionId}`;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start practice');
    } finally {
      setIsStarting(false);
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
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-lg font-semibold">Practice</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Practice MCQs</h1>
          <p className="text-gray-600 mt-2">
            Select a subject, book, and chapter to start practicing
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Book
                </label>
                <Select
                  value={selectedBook}
                  onValueChange={setSelectedBook}
                  disabled={!selectedSubject || books.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((book) => (
                      <SelectItem key={book._id} value={book._id}>
                        {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSubject('');
                    setSelectedBook('');
                    setBooks([]);
                    setChapters([]);
                  }}
                  disabled={!selectedSubject}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters */}
        {chapters.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Chapters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chapters.map((chapter) => (
                <Card key={chapter._id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{chapter.name}</CardTitle>
                      <Badge variant="secondary">#{chapter.number}</Badge>
                    </div>
                    <CardDescription>
                      {chapter.mcqCount} MCQs available
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => startPractice(chapter._id)}
                      disabled={chapter.mcqCount === 0 || isStarting}
                      className="w-full"
                    >
                      {isStarting ? (
                        <Spinner size="sm" className="mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedBook && chapters.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No chapters found</h3>
            <p className="text-gray-500">This book doesn't have any chapters yet.</p>
          </div>
        )}

        {!selectedSubject && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Select a subject</h3>
            <p className="text-gray-500">Choose a subject to view available books and chapters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Practice;
