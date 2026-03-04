import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subjectAPI, bookAPI, chapterAPI } from '../../services/api';
import { Subject, Book, Chapter } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminChapters: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newChapter, setNewChapter] = useState({ bookId: '', name: '', number: '' });

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

  const createChapter = async () => {
    try {
      await chapterAPI.create({
        bookId: selectedBook,
        name: newChapter.name,
        number: parseInt(newChapter.number),
      });
      toast.success('Chapter created successfully');
      setShowDialog(false);
      setNewChapter({ bookId: '', name: '', number: '' });
      fetchChapters();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create chapter');
    }
  };

  const deleteChapter = async (id: string) => {
    if (!confirm('Are you sure? This will delete all MCQs in this chapter.')) return;
    try {
      await chapterAPI.delete(id);
      toast.success('Chapter deleted');
      fetchChapters();
    } catch (error) {
      toast.error('Failed to delete chapter');
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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <span className="text-lg font-semibold">Manage Chapters</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Book</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook} disabled={!selectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select book" />
                  </SelectTrigger>
                  <SelectContent>
                    {books.map((b) => (
                      <SelectItem key={b._id} value={b._id}>{b.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedBook && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Chapters</h2>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>MCQs</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chapters.map((chapter) => (
                      <TableRow key={chapter._id}>
                        <TableCell>{chapter.number}</TableCell>
                        <TableCell>{chapter.name}</TableCell>
                        <TableCell>{chapter.mcqCount} / {chapter.maxMcqs}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteChapter(chapter._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chapter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newChapter.name} onChange={(e) => setNewChapter({ ...newChapter, name: e.target.value })} />
            </div>
            <div>
              <Label>Number</Label>
              <Input type="number" value={newChapter.number} onChange={(e) => setNewChapter({ ...newChapter, number: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={createChapter}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChapters;
