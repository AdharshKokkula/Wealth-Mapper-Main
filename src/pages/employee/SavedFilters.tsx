
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { FilterState } from '@/types';

interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  date: string;
  filters: FilterState;
}

// Mock function to get user's saved filters
const getUserFilters = async (userId: string): Promise<SavedFilter[]> => {
  // In a real app, this would be an API call to fetch user-specific filters
  // For now, we'll return mock data based on the userId
  
  // Generate some mock filters for the current user
  return [
    {
      id: `${userId}-filter-1`,
      user_id: userId,
      name: 'High-Value Properties',
      date: '2023-05-15',
      filters: {
        propertyValue: [5000000, 10000000],
        propertyType: 'Residential'
      }
    },
    {
      id: `${userId}-filter-2`,
      user_id: userId,
      name: 'Large Commercial Properties',
      date: '2023-05-20',
      filters: {
        propertySize: [5000, 10000],
        propertyType: 'Commercial'
      }
    },
    {
      id: `${userId}-filter-3`,
      user_id: userId,
      name: 'Billionaire Owners',
      date: '2023-06-01',
      filters: {
        ownerNetWorth: [500000000, 1000000000]
      }
    },
  ];
};

// Mock function to save a filter
const saveFilter = async (filter: Omit<SavedFilter, 'id'>): Promise<SavedFilter> => {
  // In a real app, this would be an API call to save a filter
  return {
    ...filter,
    id: crypto.randomUUID(),
  };
};

// Mock function to delete a filter
const deleteFilter = async (filterId: string): Promise<boolean> => {
  // In a real app, this would be an API call to delete a filter
  return true;
};

// Mock function to update a filter
const updateFilter = async (filter: SavedFilter): Promise<SavedFilter> => {
  // In a real app, this would be an API call to update a filter
  return filter;
};

const SavedFilters = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for dialog control
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<SavedFilter | null>(null);
  const [filterName, setFilterName] = useState('');
  
  // Fetch user's saved filters
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchFilters = async () => {
      setLoading(true);
      try {
        const userFilters = await getUserFilters(user.id);
        setFilters(userFilters);
      } catch (err) {
        console.error('Error fetching filters:', err);
        setError('Failed to load saved filters. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilters();
  }, [user?.id]);
  
  const handleCreateFilter = () => {
    setFilterName('');
    setCreateDialogOpen(true);
  };
  
  const handleSaveNewFilter = async () => {
    if (!user?.id || !filterName.trim()) return;
    
    try {
      const newFilter = await saveFilter({
        user_id: user.id,
        name: filterName,
        date: new Date().toISOString(),
        filters: {
          propertyValue: [1000000, 10000000],
          propertySize: [1000, 5000],
          propertyType: 'Residential',
          ownerNetWorth: [10000000, 100000000],
          searchQuery: '',
        }
      });
      
      setFilters([...filters, newFilter]);
      toast.success('Filter saved successfully!');
      setCreateDialogOpen(false);
    } catch (err) {
      console.error('Error saving filter:', err);
      toast.error('Failed to save filter');
    }
  };
  
  const handleEditFilter = (filter: SavedFilter) => {
    setCurrentFilter(filter);
    setFilterName(filter.name);
    setEditDialogOpen(true);
  };
  
  const handleUpdateFilter = async () => {
    if (!currentFilter || !filterName.trim()) return;
    
    try {
      const updatedFilter = await updateFilter({
        ...currentFilter,
        name: filterName,
      });
      
      setFilters(filters.map(f => f.id === updatedFilter.id ? updatedFilter : f));
      toast.success('Filter updated successfully!');
      setEditDialogOpen(false);
    } catch (err) {
      console.error('Error updating filter:', err);
      toast.error('Failed to update filter');
    }
  };
  
  const handleDeletePrompt = (filter: SavedFilter) => {
    setCurrentFilter(filter);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteFilter = async () => {
    if (!currentFilter) return;
    
    try {
      await deleteFilter(currentFilter.id);
      setFilters(filters.filter(f => f.id !== currentFilter.id));
      toast.success('Filter deleted successfully!');
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting filter:', err);
      toast.error('Failed to delete filter');
    }
  };
  
  const handleApplyFilter = (filter: SavedFilter) => {
    toast.success(`Applied filter: ${filter.name}`);
    navigate('/properties/map', { state: { filters: filter.filters } });
  };

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">Saved Filters</h1>
        </div>
        <div className="text-center p-12">
          <div className="animate-pulse">Loading saved filters...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-wealth-primary">Saved Filters</h1>
        </div>
        <div className="text-center p-12 bg-red-50 rounded-lg">
          <h3 className="text-xl font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-wealth-primary">Saved Filters</h1>
        <Button onClick={handleCreateFilter}>
          Create New Filter
        </Button>
      </div>

      {filters.length === 0 ? (
        <div className="text-center p-12 bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">No saved filters yet</h3>
          <p className="text-muted-foreground mb-4">
            Save your search filters to quickly access them later
          </p>
          <Button onClick={() => navigate('/properties/map')}>Go to Map</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filters.map((filter) => (
            <Card key={filter.id}>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{filter.name}</CardTitle>
                  <CardDescription>
                    Saved on {new Date(filter.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditFilter(filter)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleApplyFilter(filter)}
                  >
                    Apply Filter
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeletePrompt(filter)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="flex flex-wrap gap-2">
                  {filter.filters.propertyType && (
                    <Badge>
                      Type: {filter.filters.propertyType}
                    </Badge>
                  )}
                  {filter.filters.propertyValue && (
                    <Badge>
                      Value: {formatCurrency(filter.filters.propertyValue[0])} - {formatCurrency(filter.filters.propertyValue[1])}
                    </Badge>
                  )}
                  {filter.filters.propertySize && (
                    <Badge>
                      Size: {filter.filters.propertySize[0]} - {filter.filters.propertySize[1]} sq ft
                    </Badge>
                  )}
                  {filter.filters.ownerNetWorth && (
                    <Badge>
                      Owner Net Worth: {formatCurrency(filter.filters.ownerNetWorth[0])} - {formatCurrency(filter.filters.ownerNetWorth[1])}
                    </Badge>
                  )}
                  {filter.filters.searchQuery && (
                    <Badge>
                      Search: {filter.filters.searchQuery}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create Filter Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Filter</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="filter-name" className="text-right">
                Filter Name
              </Label>
              <Input 
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="High Value Properties"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                Filter Type
              </div>
              <div className="col-span-3">
                Default Property Filter
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewFilter} disabled={!filterName.trim()}>
              Create Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Filter Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filter</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-filter-name" className="text-right">
                Filter Name
              </Label>
              <Input 
                id="edit-filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFilter} disabled={!filterName.trim()}>
              Update Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Filter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this filter?</p>
            <p className="font-semibold mt-2">{currentFilter?.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFilter}>
              Delete Filter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedFilters;
