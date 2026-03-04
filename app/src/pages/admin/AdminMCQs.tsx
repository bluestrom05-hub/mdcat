import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { mcqAPI, subjectAPI, bookAPI, chapterAPI } from '../../services/api';
import { MCQ, Subject, Book, Chapter, CSVValidationResult } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ChevronLeft,
  Upload,
  Download,
  Plus,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

const AdminMCQs: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [csvPreview, setCsvPreview] = useState<{
    validRows: CSVValidationResult[];
    invalidRows: CSVValidationResult[];
    remainingSlots: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (selectedChapter) {
      fetchMCQs();
    }
  }, [selectedChapter]);

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

  const fetchMCQs = async () => {
    try {
      const response = await mcqAPI.getAll({ chapterId: selectedChapter });
      setMcqs(response.data.data);
    } catch (error) {
      toast.error('Failed to load MCQs');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedChapter) {
      toast.error('Please select a chapter first');
      return;
    }

    setIsUploading(true);
    try {
      const response = await mcqAPI.previewCSV(selectedChapter, file);
      setCsvPreview(response.data.data);
      setShowPreviewDialog(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to preview CSV');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const confirmUpload = async () => {
    if (!csvPreview || !selectedChapter) return;

    setIsUploading(true);
    try {
      const response = await mcqAPI.confirmCSV(selectedChapter, csvPreview.validRows);
      toast.success(response.data.message);
      setShowPreviewDialog(false);
      setCsvPreview(null);
      fetchMCQs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload MCQs');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await mcqAPI.downloadTemplate();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mcq_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  const deleteMCQ = async (id: string) => {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;

    try {
      await mcqAPI.delete(id);
      toast.success('MCQ deleted successfully');
      fetchMCQs();
    } catch (error) {
      toast.error('Failed to delete MCQ');
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
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <span className="text-lg font-semibold">Manage MCQs</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Chapter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div>
                <Label>Chapter</Label>
                <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((c) => (
                      <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {selectedChapter && (
          <div className="flex gap-4 mb-6">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        )}

        {/* MCQs Table */}
        {selectedChapter && (
          <Card>
            <CardHeader>
              <CardTitle>MCQs ({mcqs.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {mcqs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>No MCQs found. Upload some using CSV.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Answer</TableHead>
                      <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mcqs.map((mcq) => (
                      <TableRow key={mcq._id}>
                        <TableCell className="max-w-md truncate">{mcq.question}</TableCell>
                        <TableCell>
                          <Badge>{mcq.correctAnswer}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMCQ(mcq._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>CSV Preview</DialogTitle>
            <DialogDescription>
              Review the MCQs before uploading
            </DialogDescription>
          </DialogHeader>

          {csvPreview && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>{csvPreview.validRows.length} valid</span>
                </div>
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>{csvPreview.invalidRows.length} invalid</span>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>{csvPreview.remainingSlots} slots remaining</span>
                </div>
              </div>

              {csvPreview.invalidRows.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-700 mb-2">Invalid Rows</h4>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {csvPreview.invalidRows.map((row, idx) => (
                      <div key={idx} className="text-sm text-red-600">
                        Row {row.row.rowNumber}: {row.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={confirmUpload}
                  disabled={csvPreview.validRows.length === 0 || isUploading}
                >
                  {isUploading ? <Spinner size="sm" className="mr-2" /> : null}
                  Upload {csvPreview.validRows.length} MCQs
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMCQs;
