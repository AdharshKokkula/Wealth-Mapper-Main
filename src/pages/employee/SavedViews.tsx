
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getSavedViews } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MapViewState, FilterState } from '@/types';

interface SavedView {
  id: string;
  name: string;
  date: string;
  propertyCount: number;
  viewState: MapViewState;
  filters: FilterState;
}

// Mock function to update a saved view
const updateSavedView = async (viewId: string, data: Partial<SavedView>): Promise<SavedView> => {
  // In a real app, this would be an API call
  return { id: viewId, ...data } as SavedView;
};

// Mock function to delete a saved view
const deleteSavedView = async (viewId: string): Promise<boolean> => {
  // In a real app, this would be an API call
  return true;
};

const SavedViews = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState('');
  
  const { data: views, isLoading, error, refetch } = useQuery({
    queryKey: ['savedViews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const savedViewsData = await getSavedViews(user.id);
      return savedViewsData.map(view => ({
        id: view.id,
        ...view.view_data as any,
      })) as SavedView[];
    },
    enabled: !!user?.id
  });
  
  const handleLoadView = (view: SavedView) => {
    toast.success('Loading saved view...');
    navigate('/properties/map', { state: { viewState: view.viewState, filters: view.filters } });
  };
  
  const handleEditView = (view: SavedView) => {
    setCurrentView(view);
    setViewName(view.name);
    setEditDialogOpen(true);
  };
  
  const handleUpdateView = async () => {
    if (!currentView || !viewName.trim()) return;
    
    try {
      await updateSavedView(currentView.id, {
        name: viewName,
      });
      
      toast.success('View updated successfully');
      refetch();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating view:', error);
      toast.error('Failed to update view');
    }
  };
  
  const handleDeletePrompt = (view: SavedView) => {
    setCurrentView(view);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteView = async () => {
    if (!currentView) return;
    
    try {
      await deleteSavedView(currentView.id);
      toast.success('View deleted successfully');
      refetch();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting view:', error);
      toast.error('Failed to delete view');
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">Saved Map Views</h1>
        </div>
        <div className="text-center p-12">
          <div className="animate-pulse">Loading saved views...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">Saved Map Views</h1>
        </div>
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Saved Views</h3>
          <p className="text-red-600 mb-4">Unable to load your saved map views</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-wealth-primary">Saved Map Views</h1>
        <Button onClick={() => navigate('/properties/map')}>
          Create New View
        </Button>
      </div>

      {!views || views.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No saved views yet</h3>
          <p className="text-muted-foreground mb-4">
            Save your map views to quickly access them later
          </p>
          <Button onClick={() => navigate('/properties/map')}>Go to Map</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {views.map((view) => (
            <Card key={view.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle>{view.name}</CardTitle>
                <CardDescription>
                  Saved on {new Date(view.date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-wealth-secondary"
                  >
                    <path d="M8 6l4-4 4 4" />
                    <path d="M12 2v10.3a4 4 0 0 1-1.172 2.872L3.6 22" />
                    <path d="m9 18 1 1 9.9-9.9" />
                  </svg>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {view.propertyCount} properties
                    </p>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEditView(view)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleLoadView(view)}
                    >
                      Load View
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeletePrompt(view)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Edit View Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Saved View</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                View Name
              </Label>
              <Input
                id="name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Downtown Properties"
                className="col-span-3"
              />
            </div>
            {currentView && (
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right text-sm text-muted-foreground">
                  Properties
                </div>
                <div className="col-span-3">
                  {currentView.propertyCount} properties visible
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateView} disabled={!viewName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Saved View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this saved view?</p>
            <p className="font-semibold mt-2">{currentView?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteView}>
              Delete View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedViews;
