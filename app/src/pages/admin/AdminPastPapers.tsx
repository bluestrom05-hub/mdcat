import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, testAPI } from '../../services/api';
import { PastPaper } from '../../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ChevronLeft, Plus, Trash2, FileText, Eye, EyeOff } from 'lucide-react';
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

const AdminPastPapers: React.FC = () => {
  const [pastPapers, setPastPapers] = useState<PastPaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newPaper, setNewPaper] = useState({ title: '', year: '', mcqIds: '' });

  useEffect(() => {
    fetchPastPapers();
  }, []);

  const fetchPastPapers = async () => {
    try {
      const response = await testAPI.getPastPapers({ limit: 100 });
      setPastPapers(response.data.data);
    } catch (error) {
      toast.error('Failed to load past papers');
    } finally {
      setIsLoading(false);
    }
  };

  const createPastPaper = async () => {
    try {
      const mcqIds = newPaper.mcqIds.split(',').map((id) => id.trim()).filter(Boolean);
      await adminAPI.createPastPaper({
        title: newPaper.title,
        year: parseInt(newPaper.year),
        mcqIds,
      });
      toast.success('Past paper created');
      setShowDialog(false);
      setNewPaper({ title: '', year: '', mcqIds: '' });
      fetchPastPapers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create past paper');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await adminAPI.updatePastPaper(id, { isActive: !isActive });
      toast.success('Past paper updated');
      fetchPastPapers();
    } catch (error) {
      toast.error('Failed to update past paper');
    }
  };

  const deletePastPaper = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await adminAPI.deletePastPaper(id);
      toast.success('Past paper deleted');
      fetchPastPapers();
    } catch (error) {
      toast.error('Failed to delete past paper');
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
              <span className="text-lg font-semibold">Manage Past Papers</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Past Papers</h2>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Past Paper
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastPapers.map((paper) => (
                  <TableRow key={paper._id}>
                    <TableCell className="font-medium">{paper.title}</TableCell>
                    <TableCell>{paper.year}</TableCell>
                    <TableCell>{paper.mcqs?.length || 0}</TableCell>
                    <TableCell>
                      <Badge variant={paper.isActive ? 'default' : 'secondary'}>
                        {paper.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleActive(paper._id, paper.isActive)}
                        >
                          {paper.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deletePastPaper(paper._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Past Paper</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={newPaper.title} onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })} />
            </div>
            <div>
              <Label>Year</Label>
              <Input type="number" value={newPaper.year} onChange={(e) => setNewPaper({ ...newPaper, year: e.target.value })} />
            </div>
            <div>
              <Label>MCQ IDs (comma-separated)</Label>
              <Input value={newPaper.mcqIds} onChange={(e) => setNewPaper({ ...newPaper, mcqIds: e.target.value })} placeholder="id1, id2, id3..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={createPastPaper}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPastPapers;
