
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getReports, createReport } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/formatters';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ReportType {
  id: string;
  name: string;
  description: string;
}

const reportTypes: ReportType[] = [
  { 
    id: 'portfolio-summary', 
    name: 'Portfolio Summary', 
    description: 'Overview of all properties in your portfolio with key metrics'
  },
  { 
    id: 'performance-analysis', 
    name: 'Performance Analysis', 
    description: 'Analysis of property value changes over time'
  },
  { 
    id: 'market-comparison', 
    name: 'Market Comparison', 
    description: 'Compare your properties against market averages'
  },
  { 
    id: 'owner-insights', 
    name: 'Owner Insights', 
    description: 'Detailed information about property owners in your portfolio'
  }
];

const Reports = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [newReportName, setNewReportName] = useState('');
  const [selectedReportType, setSelectedReportType] = useState(reportTypes[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: reports, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const reportsData = await getReports(user.id);
      return reportsData.map(report => ({
        id: report.id,
        ...report.report_data as any,
        date: report.created_at,
      }));
    },
    enabled: !!user?.id
  });
  
  const handleCreateReportDialog = () => {
    setNewReportName('');
    setSelectedReportType(reportTypes[0].id);
    setCreateDialogOpen(true);
  };
  
  const handleCreateReport = async () => {
    try {
      if (!user?.id) {
        toast.error('You must be logged in to create reports');
        return;
      }
      
      if (!newReportName.trim()) {
        toast.error('Please enter a report name');
        return;
      }
      
      setIsGenerating(true);
      
      const selectedType = reportTypes.find(type => type.id === selectedReportType);
      
      const reportData = {
        name: newReportName,
        type: selectedType?.name || 'Custom Export',
        properties: Math.floor(Math.random() * 50) + 10,
        status: 'completed',
        format: 'PDF'
      };
      
      await createReport(user.id, reportData);
      toast.success('Report created successfully');
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDeletePrompt = (reportId: string) => {
    setReportToDelete(reportId);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      // In a real app, this would be an API call to delete the report
      toast.success('Report deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };
  
  const handleViewReport = (reportId: string) => {
    toast.info('Viewing report...');
    // In a real app, this would navigate to a report viewer or open a modal
  };
  
  const handleDownloadReport = (reportId: string) => {
    toast.success('Report downloaded successfully');
    // In a real app, this would trigger a file download
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">Reports</h1>
        </div>
        <div className="text-center p-12">
          <div className="animate-pulse">Loading reports...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">Reports</h1>
        </div>
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Reports</h3>
          <p className="text-red-600 mb-4">Unable to load your reports</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-wealth-primary">Reports</h1>
        <Button onClick={handleCreateReportDialog}>
          Create New Report
        </Button>
      </div>

      {!reports || reports.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No reports yet</h3>
          <p className="text-muted-foreground mb-4">
            Create reports to analyze property data
          </p>
          <Button onClick={handleCreateReportDialog}>Create Report</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Reports</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-4 font-medium">Report Name</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Created</th>
                      <th className="text-left p-4 font-medium">Properties</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="border-t">
                        <td className="p-4">{report.name}</td>
                        <td className="p-4">{report.type}</td>
                        <td className="p-4">{formatDate(report.date)}</td>
                        <td className="p-4">{report.properties}</td>
                        <td className="p-4 text-right">
                          <Button variant="outline" size="sm" className="ml-2"
                            onClick={() => handleViewReport(report.id)}
                          >
                            View
                          </Button>
                          <Button size="sm" className="ml-2"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            Download
                          </Button>
                          <Button variant="destructive" size="sm" className="ml-2"
                            onClick={() => handleDeletePrompt(report.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Create Report Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report-name" className="text-right">
                Report Name
              </Label>
              <Input
                id="report-name"
                value={newReportName}
                onChange={(e) => setNewReportName(e.target.value)}
                placeholder="Q2 2023 Portfolio Analysis"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report-type" className="text-right">
                Report Type
              </Label>
              <select
                id="report-type"
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value)}
                className="col-span-3 p-2 border rounded-md"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right col-span-1"></div>
              <div className="col-span-3 text-sm text-muted-foreground">
                {reportTypes.find(type => type.id === selectedReportType)?.description}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateReport} 
              disabled={isGenerating || !newReportName.trim()}
            >
              {isGenerating ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this report?</p>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
