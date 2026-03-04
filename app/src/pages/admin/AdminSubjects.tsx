import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subjectAPI, boardAPI, bookAPI } from '../../services/api';
import { Subject, Board, Book } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Trash2, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const AdminSubjects: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubjectDialog, setShowSubjectDialog] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [newSubject, setNewSubject] = useState({ name: '', code: '', type: 'science', description: '' });
  const [newBook, setNewBook] = useState({ subjectId: '', boardId: '', class: '11' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, boardsRes] = await Promise.all([
        subjectAPI.getAll(),
        boardAPI.getAll(),
      ]);
      setSubjects(subjectsRes.data.data);
      setBoards(boardsRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const createSubject = async () => {
    try {
      await subjectAPI.create(newSubject);
      toast.success('Subject created successfully');
      setShowSubjectDialog(false);
      setNewSubject({ name: '', code: '', type: 'science', description: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create subject');
    }
  };

  const createBook = async () => {
    try {
      await bookAPI.create({
        subjectId: newBook.subjectId,
        boardId: newBook.boardId,
        class: parseInt(newBook.class),
      });
      toast.success('Book created successfully');
      setShowBookDialog(false);
      setNewBook({ subjectId: '', boardId: '', class: '11' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create book');
    }
  };

  const deleteSubject = async (id: string) => {
    if (!confirm('Are you sure? This will delete all related content.')) return;
    try {
      await subjectAPI.delete(id);
      toast.success('Subject deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete subject');
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
              <span className="text-lg font-semibold">Subjects & Books</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <Button onClick={() => setShowSubjectDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
          <Button onClick={() => setShowBookDialog(true)} variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subjects.map((subject) => (
            <Card key={subject._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{subject.name}</CardTitle>
                    <p className="text-sm text-gray-500">{subject.code}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteSubject(subject._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{subject.description}</p>
                <p className="text-sm text-gray-500 mt-2">Type: {subject.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Add Subject Dialog */}
      <Dialog open={showSubjectDialog} onOpenChange={setShowSubjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} />
            </div>
            <div>
              <Label>Code</Label>
              <Input value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={newSubject.type} onValueChange={(v) => setNewSubject({ ...newSubject, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="logical">Logical Reasoning</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={newSubject.description} onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubjectDialog(false)}>Cancel</Button>
            <Button onClick={createSubject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Book Dialog */}
      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Book</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Subject</Label>
              <Select value={newBook.subjectId} onValueChange={(v) => setNewBook({ ...newBook, subjectId: v })}>
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
              <Label>Board</Label>
              <Select value={newBook.boardId} onValueChange={(v) => setNewBook({ ...newBook, boardId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select board" />
                </SelectTrigger>
                <SelectContent>
                  {boards.map((b) => (
                    <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class</Label>
              <Select value={newBook.class} onValueChange={(v) => setNewBook({ ...newBook, class: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="11">11</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>Cancel</Button>
            <Button onClick={createBook}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubjects;
