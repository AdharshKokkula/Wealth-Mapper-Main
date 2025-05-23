
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterState, MapViewState, Property } from '@/types';
import PropertyMap from '@/components/PropertyMap';
import PropertyFilters from '@/components/PropertyFilters';
import { getProperties } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Mock function to get user-specific properties
const getUserProperties = async (userId: string, filters: FilterState) => {
  try {
    // In a real app, this would call the backend API with user_id and filters
    // For now, we'll use the existing getProperties function and filter by user_id
    const allProperties = await getProperties(filters);
    
    // Mock data: Make some properties belong to the current user
    return allProperties.map((property: Property, index: number) => ({
      ...property,
      user_id: index % 3 === 0 ? userId : `other-user-${index % 5}`
    })).filter((p: Property) => p.user_id === userId);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    throw error;
  }
};

const MapView = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    propertyValue: [1000000, 10000000],
    propertySize: [1000, 11000],
    ownerNetWorth: [100000000, 1000000000],
  });

  const [mapViewState, setMapViewState] = useState<MapViewState>({
    center: [37.0902, -95.7129],
    zoom: 4,
  });

  // Fetch user-specific properties with the current filters
  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ['userProperties', user?.id, filters],
    queryFn: () => user ? getUserProperties(user.id, filters) : [],
    enabled: !!user?.id,
    meta: {
      onError: (err: any) => {
        console.error('Error fetching properties:', err);
        toast.error('Failed to load property data');
      }
    }
  });

  // Re-fetch when filters change
  useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [filters, refetch, user?.id]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleViewStateChange = (viewState: MapViewState) => {
    setMapViewState(viewState);
  };

  // If there's an error, show an error message
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <h3 className="text-xl font-medium text-red-800 mb-2">Error Loading Properties</h3>
          <p className="text-red-600">Please try refreshing the page</p>
          <button 
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="w-80 p-4 overflow-auto border-r">
        <PropertyFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          loading={isLoading}
        />
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-1">Properties Found</h3>
          <p className="text-2xl font-bold text-wealth-accent">
            {isLoading ? '...' : properties?.length || 0}
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <PropertyMap
          properties={properties || []}
          loading={isLoading}
          filters={filters}
          onViewStateChange={handleViewStateChange}
          userId={user?.id}
        />
      </div>
    </div>
  );
};

export default MapView;
