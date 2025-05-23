
import { useEffect, useState, useRef } from 'react';
import { Property, MapViewState, FilterState } from '@/types';
import PropertyDetails from './PropertyDetails';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { createSavedView } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from './ui/alert';

// Declare the L variable from Leaflet, which will be available from the CDN
declare const L: any;

interface PropertyMapProps {
  properties: Property[];
  loading: boolean;
  filters: FilterState;
  userId?: string;
  onViewStateChange?: (viewState: MapViewState) => void;
}

// Mock functions for property CRUD operations
const createProperty = async (property: Partial<Property>): Promise<Property> => {
  // In a real app, this would call an API endpoint
  const newProperty: Property = {
    id: crypto.randomUUID(),
    address: property.address || 'New Property',
    latitude: property.latitude || 0,
    longitude: property.longitude || 0,
    value: property.value,
    size: property.size,
    type: property.type,
    owner_id: '00000000-0000-0000-0000-000000000001', // Default owner
    user_id: property.user_id || '', // Will be set by the component
    ...property,
  };
  
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return newProperty;
};

const updateProperty = async (id: string, updates: Partial<Property>): Promise<Property> => {
  // In a real app, this would call an API endpoint
  await new Promise(resolve => setTimeout(resolve, 300));
  return { ...updates, id } as Property;
};

const deleteProperty = async (id: string): Promise<boolean> => {
  // In a real app, this would call an API endpoint
  await new Promise(resolve => setTimeout(resolve, 300));
  return true;
};

const PropertyMap = ({ properties, loading, filters, userId, onViewStateChange }: PropertyMapProps) => {
  const { user } = useAuth();
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // New states for property creation/editing
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [newPropertyCoords, setNewPropertyCoords] = useState<[number, number] | null>(null);
  const [newPropertyDialogOpen, setNewPropertyDialogOpen] = useState(false);
  const [newPropertyData, setNewPropertyData] = useState({
    address: '',
    value: 0,
    size: 0,
    type: 'Residential',
  });
  
  // State for property deletion confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  // Initialize map on component mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map
    const map = L.map(mapContainerRef.current).setView([37.0902, -95.7129], 4);
    
    // Add tile layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Save map instance to ref
    mapRef.current = map;
    
    // Listen for map move/zoom events
    map.on('moveend', () => {
      if (onViewStateChange) {
        const center = map.getCenter();
        onViewStateChange({
          center: [center.lat, center.lng],
          zoom: map.getZoom(),
          bounds: [
            [map.getBounds().getSouth(), map.getBounds().getWest()],
            [map.getBounds().getNorth(), map.getBounds().getEast()]
          ]
        });
      }
    });

    // Add click handler for adding new properties when in add mode
    map.on('click', (e: any) => {
      if (isAddingProperty) {
        setNewPropertyCoords([e.latlng.lat, e.latlng.lng]);
        setNewPropertyDialogOpen(true);
      }
    });

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onViewStateChange, isAddingProperty]);

  // Update markers when properties change
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => {
      if (mapRef.current) marker.remove();
    });
    markersRef.current = [];
    
    // Add new markers
    properties.forEach(property => {
      if (property.user_id !== user?.id) return; // Only show current user's properties
      
      const marker = L.marker([property.latitude, property.longitude], {
        icon: L.divIcon({
          className: 'property-marker',
          html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>`,
          iconSize: [16, 16]
        })
      }).addTo(mapRef.current);
      
      // Add click handler
      marker.on('click', () => {
        setSelectedProperty(property);
      });
      
      markersRef.current.push(marker);
    });
    
    // If we have markers and they're visible, fit bounds
    if (markersRef.current.length > 0 && !loading) {
      const group = L.featureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [properties, loading, user?.id]);

  const handleSaveView = () => {
    setSaveDialogOpen(true);
  };

  const saveView = async () => {
    if (!mapRef.current || !userId || !viewName.trim()) {
      toast.error('Unable to save view');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const center = mapRef.current.getCenter();
      const viewState: MapViewState = {
        center: [center.lat, center.lng],
        zoom: mapRef.current.getZoom(),
        bounds: [
          [mapRef.current.getBounds().getSouth(), mapRef.current.getBounds().getWest()],
          [mapRef.current.getBounds().getNorth(), mapRef.current.getBounds().getEast()]
        ]
      };
      
      // Save to Supabase
      await createSavedView(userId, { 
        name: viewName,
        date: new Date().toISOString(),
        viewState,
        filters,
        propertyCount: properties.filter(p => p.user_id === user?.id).length,
      });
      
      toast.success('Map view saved successfully!');
      setSaveDialogOpen(false);
      setViewName('');
    } catch (error) {
      console.error('Error saving view:', error);
      toast.error('Failed to save map view');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAddPropertyMode = () => {
    setIsAddingProperty(!isAddingProperty);
    if (!isAddingProperty) {
      toast.info('Click on the map to add a new property', {
        duration: 3000,
      });
    }
  };

  const handleAddProperty = async () => {
    if (!newPropertyCoords || !user) return;
    
    try {
      const newProperty = await createProperty({
        address: newPropertyData.address,
        latitude: newPropertyCoords[0],
        longitude: newPropertyCoords[1],
        value: newPropertyData.value,
        size: newPropertyData.size,
        type: newPropertyData.type,
        user_id: user.id,
      });
      
      toast.success('Property created successfully!');
      setNewPropertyDialogOpen(false);
      setIsAddingProperty(false);
      setNewPropertyCoords(null);
      setNewPropertyData({
        address: '',
        value: 0,
        size: 0,
        type: 'Residential',
      });
      
      // In a real app, we would refetch properties or update the list
      // For now, we'll just add it to the map manually
      const marker = L.marker([newProperty.latitude, newProperty.longitude], {
        icon: L.divIcon({
          className: 'property-marker',
          html: `<div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>`,
          iconSize: [16, 16]
        })
      }).addTo(mapRef.current);
      
      marker.on('click', () => {
        setSelectedProperty(newProperty);
      });
      
      markersRef.current.push(marker);
      
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error('Failed to create property');
    }
  };

  const handleDeleteProperty = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    
    try {
      await deleteProperty(propertyToDelete.id);
      toast.success('Property deleted successfully!');
      
      // Remove marker from map
      const markerIndex = markersRef.current.findIndex(
        marker => 
          marker.getLatLng().lat === propertyToDelete.latitude && 
          marker.getLatLng().lng === propertyToDelete.longitude
      );
      
      if (markerIndex !== -1) {
        markersRef.current[markerIndex].remove();
        markersRef.current.splice(markerIndex, 1);
      }
      
      // Clear selected property if it's the one being deleted
      if (selectedProperty?.id === propertyToDelete.id) {
        setSelectedProperty(null);
      }
      
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      
      // In a real app, we would refetch properties or update the list
      
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    }
  };

  return (
    <div className="relative h-full">
      {/* Map container */}
      <div 
        ref={mapContainerRef} 
        className="map-container"
        style={{ height: 'calc(100vh - 4rem)' }}
      />
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="text-xl font-semibold animate-pulse">Loading properties...</div>
        </div>
      )}
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10 space-y-2">
        <Button 
          onClick={handleSaveView}
          variant="secondary" 
          className="shadow-lg"
          disabled={loading || !userId}
        >
          Save Current View
        </Button>
        
        <Button 
          onClick={toggleAddPropertyMode}
          variant={isAddingProperty ? "destructive" : "default"} 
          className="shadow-lg"
          disabled={loading || !userId}
        >
          {isAddingProperty ? 'Cancel Adding' : 'Add Property'}
        </Button>
      </div>
      
      {/* Add property mode indicator */}
      {isAddingProperty && (
        <div className="absolute top-4 left-4 z-10">
          <Alert variant="default" className="bg-white/80 shadow-lg border border-blue-500">
            <AlertDescription>
              Click anywhere on the map to add a new property
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      {/* Property details popup */}
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 z-10 max-w-2xl mx-auto">
          <PropertyDetails 
            property={selectedProperty} 
            onClose={() => setSelectedProperty(null)}
            onDelete={() => handleDeleteProperty(selectedProperty)}
          />
        </div>
      )}

      {/* Save view dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Map View</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="Downtown Properties"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                Properties
              </div>
              <div className="col-span-3">
                {properties.filter(p => p.user_id === user?.id).length} properties visible
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveView} disabled={isSaving || !viewName.trim()}>
              {isSaving ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add property dialog */}
      <Dialog open={newPropertyDialogOpen} onOpenChange={setNewPropertyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={newPropertyData.address}
                onChange={(e) => setNewPropertyData({...newPropertyData, address: e.target.value})}
                placeholder="123 Main St"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                Value ($)
              </Label>
              <Input
                id="value"
                type="number"
                value={newPropertyData.value}
                onChange={(e) => setNewPropertyData({...newPropertyData, value: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">
                Size (sqft)
              </Label>
              <Input
                id="size"
                type="number"
                value={newPropertyData.size}
                onChange={(e) => setNewPropertyData({...newPropertyData, size: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <select
                id="type"
                value={newPropertyData.type}
                onChange={(e) => setNewPropertyData({...newPropertyData, type: e.target.value})}
                className="col-span-3 p-2 border rounded-md"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Land">Land</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-muted-foreground">
                Coordinates
              </div>
              <div className="col-span-3">
                {newPropertyCoords ? `${newPropertyCoords[0].toFixed(6)}, ${newPropertyCoords[1].toFixed(6)}` : 'Unknown'}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => {
              setNewPropertyDialogOpen(false);
              setNewPropertyCoords(null);
            }}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAddProperty} 
              disabled={!newPropertyData.address.trim() || !newPropertyCoords}
            >
              Add Property
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete property confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Property</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this property?</p>
            <p className="font-semibold mt-2">{propertyToDelete?.address}</p>
            <p className="text-sm text-muted-foreground mt-1">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteProperty}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyMap;
