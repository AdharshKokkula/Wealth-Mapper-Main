
import { useState } from 'react';
import { FilterState } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { toast } from 'sonner';

interface PropertyFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
}

const PropertyFilters = ({ filters, onFiltersChange, loading }: PropertyFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [expanded, setExpanded] = useState(true);
  
  const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land', 'Agricultural'];
  
  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({ ...localFilters, searchQuery: e.target.value });
  };
  
  const handlePropertyTypeChange = (value: string) => {
    setLocalFilters({ ...localFilters, propertyType: value === "all" ? undefined : value });
  };
  
  const handlePropertyValueChange = (value: number[]) => {
    setLocalFilters({ ...localFilters, propertyValue: [value[0], value[1]] });
  };
  
  const handlePropertySizeChange = (value: number[]) => {
    setLocalFilters({ ...localFilters, propertySize: [value[0], value[1]] });
  };
  
  const handleNetWorthChange = (value: number[]) => {
    setLocalFilters({ ...localFilters, ownerNetWorth: [value[0], value[1]] });
  };
  
  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };
  
  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      searchQuery: '',
      propertyType: undefined,
      propertyValue: undefined,
      propertySize: undefined,
      ownerNetWorth: undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };
  
  const handleSaveFilters = () => {
    console.log('Saving filters:', localFilters);
    toast.success('Filters saved successfully');
  };
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3 flex flex-row justify-between items-center cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-lg">
          Search & Filters
        </CardTitle>
        <Button variant="ghost" size="sm">
          {expanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by address or owner name"
              className="pl-8"
              value={localFilters.searchQuery || ''}
              onChange={handleSearchQueryChange}
            />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Property Type</label>
              </div>
              <Select
                value={localFilters.propertyType || "all"}
                onValueChange={handlePropertyTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {propertyTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Property Value</label>
                <span className="text-xs text-muted-foreground">
                  {localFilters.propertyValue 
                    ? `${formatCurrency(localFilters.propertyValue[0])} - ${formatCurrency(localFilters.propertyValue[1])}` 
                    : 'Any Value'}
                </span>
              </div>
              <Slider
                defaultValue={[1000000, 10000000]}
                min={1000000}
                max={10000000}
                step={500000}
                value={localFilters.propertyValue || [1000000, 10000000]}
                onValueChange={handlePropertyValueChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Property Size</label>
                <span className="text-xs text-muted-foreground">
                  {localFilters.propertySize 
                    ? `${formatNumber(localFilters.propertySize[0])} - ${formatNumber(localFilters.propertySize[1])} sq ft` 
                    : 'Any Size'}
                </span>
              </div>
              <Slider
                defaultValue={[1000, 11000]}
                min={1000}
                max={11000}
                step={500}
                value={localFilters.propertySize || [1000, 11000]}
                onValueChange={handlePropertySizeChange}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Owner Net Worth</label>
                <span className="text-xs text-muted-foreground">
                  {localFilters.ownerNetWorth 
                    ? `${formatCurrency(localFilters.ownerNetWorth[0])} - ${formatCurrency(localFilters.ownerNetWorth[1])}` 
                    : 'Any Net Worth'}
                </span>
              </div>
              <Slider
                defaultValue={[100000000, 1000000000]}
                min={100000000}
                max={1000000000}
                step={50000000}
                value={localFilters.ownerNetWorth || [100000000, 1000000000]}
                onValueChange={handleNetWorthChange}
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyFilters} className="flex-1" disabled={loading}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleResetFilters} disabled={loading}>
              Reset
            </Button>
            <Button variant="secondary" onClick={handleSaveFilters} disabled={loading}>
              Save
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default PropertyFilters;
