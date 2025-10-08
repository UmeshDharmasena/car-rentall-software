"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ComparisonPopup from './ComparisonPopup';
import { createClient } from 'utils/supabase/client';

interface Software {
  software_id: string;
  name: string;
  description: string;
  ui_type: string[];
  ui_description: string;
  platform_supported: string[];
  typical_customers: string[];
  content: string[];
  user_id: string;
  created_at: string;
  free_trial: boolean;
  free_version: boolean;
  features?: Feature[];
  pricing_plans?: PricingPlan[];
  support_option?: SupportOption;
  rating?: number;
  review_count?: number;
  cheapest_price?: number | null;
}

interface Feature {
  feature_id: string;
  software_id: string;
  feature_name: string;
  feature_description: string;
}

interface PricingPlan {
  plan_id: string;
  software_id: string;
  plan_name: string;
  cost: number;
  included_features: string;
  payment_options: string[];
}

interface SupportOption {
  support_id: string;
  software_id: string;
  channels: string[];
  hours: string[];
  training_options: string[];
  self_help_resources: boolean;
}

interface Filters {
  features: string[];
  model: string[];
  rating: string;
}

const AnalyzePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [software, setSoftware] = useState<Software[]>([]);
  const [filteredSoftware, setFilteredSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const [filters, setFilters] = useState<Filters>({
    features: [],
    model: [],
    rating: ''
  });

  const supabase = createClient();
  const itemsPerPage = 8;

  const availableFeatures = [
    'Customer Database',
    'API',
    'Accounting',
    'Access Controls/Permissions',
    'Activity Dashboard',
    'Fleet Management',
    'Booking System',
    'Payment Processing',
    'Reporting',
    'Mobile App'
  ];

  const modelOptions = [
    'Free',
    'Open Source', 
    'Free Trial',
    'One time purchase',
    'Subscription'
  ];

  const ratingOptions = [
    { label: 'All Reviews', value: '' },
    { label: '★★★★☆ & up', value: '4' },
    { label: '★★★☆☆ & up', value: '3' },
    { label: '★★☆☆☆ & up', value: '2' }
  ];

  useEffect(() => {
    fetchSoftware();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
    setCurrentPage(1);
  }, [software, searchTerm, filters]);

  const fetchSoftware = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: softwareData, error: softwareError } = await supabase
        .from('Software')
        .select(`
          *,
          Feature(*),
          PricingPlan(*),
          SupportOption(*)
        `);

      if (softwareError) throw softwareError;

      const { data: allReviews, error: reviewsError } = await supabase
        .from('Review')
        .select('software_id, overall_rating');

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
      }

      const reviewsBySoftware: { [key: string]: any[] } = {};
      if (allReviews) {
        allReviews.forEach((review: any) => {
          if (!reviewsBySoftware[review.software_id]) {
            reviewsBySoftware[review.software_id] = [];
          }
          reviewsBySoftware[review.software_id].push(review);
        });
      }

      const transformedSoftware: Software[] = (softwareData || []).map((item: any) => {
        const softwareReviews = reviewsBySoftware[item.software_id] || [];
        const avgRating = softwareReviews.length > 0
          ? softwareReviews.reduce((sum, review) => sum + review.overall_rating, 0) / softwareReviews.length
          : 0;

        const pricingPlans = item.PricingPlan || [];
        const validPrices = pricingPlans
          .map((p: PricingPlan) => p.cost)
          .filter((cost: number) => cost !== null && cost !== undefined && cost > 0);
        
        const cheapestPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;

        return {
          ...item,
          features: item.Feature || [],
          pricing_plans: pricingPlans,
          support_option: item.SupportOption?.[0] || null,
          rating: softwareReviews.length > 0 ? Math.round(avgRating * 10) / 10 : undefined,
          review_count: softwareReviews.length,
          cheapest_price: cheapestPrice
        };
      });

      setSoftware(transformedSoftware);
      setTotalCount(transformedSoftware.length);
    } catch (err: any) {
      console.error('Error fetching software:', err);
      setError(err.message || 'Failed to fetch software data');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...software];

    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.features.length > 0) {
      filtered = filtered.filter(item =>
        filters.features.some(feature =>
          item.features?.some(f => f.feature_name.toLowerCase().includes(feature.toLowerCase())) ||
          item.description.toLowerCase().includes(feature.toLowerCase())
        )
      );
    }

    if (filters.model.length > 0) {
      filtered = filtered.filter(item => {
        const hasFreeTrial = item.free_trial;
        const hasFreeVersion = item.free_version;
        const hasPaidPlans = item.pricing_plans?.some(p => p.cost > 0);
        
        return filters.model.some(model => {
          switch (model) {
            case 'Free':
              return hasFreeVersion;
            case 'Free Trial':
              return hasFreeTrial;
            case 'Subscription':
              return item.pricing_plans?.some(p => p.payment_options?.includes('Subscription'));
            case 'One time purchase':
              return item.pricing_plans?.some(p => p.payment_options?.includes('One time'));
            default:
              return true;
          }
        });
      });
    }

    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(item => (item.rating || 0) >= minRating);
    }

    setFilteredSoftware(filtered);
  };

  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    if (filterType === 'rating') {
      setFilters(prev => ({ ...prev, [filterType]: value }));
    } else {
      setFilters(prev => {
        const currentArray = prev[filterType] as string[];
        const newArray = currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value];
        return { ...prev, [filterType]: newArray };
      });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      features: [],
      model: [],
      rating: ''
    });
    setSearchTerm('');
  };

  const totalPages = Math.ceil(filteredSoftware.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSoftware.slice(startIndex, endIndex);

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const formatRating = (rating: number, reviewCount: number) => {
    const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    return `${rating.toFixed(1)} ${stars} (${reviewCount})`;
  };

  const formatCost = (cost: number | null | undefined) => {
    if (cost === null || cost === undefined) return 'Contact Vendor';
    if (cost === 0) return 'Free';
    return `$${cost.toFixed(2)}`;
  };

  const truncateDescription = (description: string, maxLength: number = 100) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + '...';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading software...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
          <button 
            onClick={() => fetchSoftware()} 
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4 items-center">
          <input
            type="text"
            placeholder="Search software..."
            className="border p-2 rounded w-[900px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link href="/list-software" className="bg-gray-200 px-4 py-2 rounded text-black no-underline">
            List Your Software
          </Link>
        </div>
        <h1>
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded"
            onClick={() => setIsPopupOpen(true)}
          >
            Comparison
          </button>
        </h1>
      </div>

      <div className="flex">
        <div className="w-1/4 p-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Filter results</h2>
              {(filters.features.length > 0 || filters.model.length > 0 || filters.rating) && (
                <button 
                  onClick={clearAllFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="font-medium">Features</div>
              {availableFeatures.map((feature) => (
                <label key={feature} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-2"
                    checked={filters.features.includes(feature)}
                    onChange={() => handleFilterChange('features', feature)}
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="font-bold mb-2">Model</h2>
            {modelOptions.map((model) => (
              <label key={model} className="flex items-center">
                <input 
                  type="checkbox" 
                  className="mr-2"
                  checked={filters.model.includes(model)}
                  onChange={() => handleFilterChange('model', model)}
                />
                {model}
              </label>
            ))}
          </div>

          <div>
            <h2 className="font-bold mb-2">User rating</h2>
            {ratingOptions.map((option) => (
              <label key={option.value} className="flex items-center">
                <input 
                  type="radio" 
                  name="rating"
                  className="mr-2"
                  checked={filters.rating === option.value}
                  onChange={() => handleFilterChange('rating', option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="w-3/4 p-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredSoftware.length)} of {filteredSoftware.length} results
            </div>
          </div>

          {currentItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No software found matching your criteria.</p>
              <button 
                onClick={clearAllFilters}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {currentItems.map((item) => (
                <div key={item.software_id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-lg">{item.name}</strong>
                        
                        {item.free_trial && (
                          <span className="bg-cyan-100 text-black px-2 py-1 rounded text-xs">FREE TRIAL</span>
                        )}
                        {item.free_version && (
                          <span className="bg-orange-100 text-black px-2 py-1 rounded text-xs">FREE VERSION</span>
                        )}
                      </div>
                      <div className="text-yellow-500 text-sm mt-1">
                        {formatRating(item.rating || 0, item.review_count || 0)}
                      </div>
                    </div>
                    <Link href={`/product/${encodeURIComponent(item.name)}`}>
                      <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
                        LEARN MORE
                      </button>
                    </Link>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-2">{truncateDescription(item.description)}</p>
                  
                  {item.ui_description && (
                    <p className="text-sm mb-2">{item.ui_description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.ui_type?.map((type, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {type}
                      </span>
                    ))}
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Starting at: </span>
                    {formatCost(item.cheapest_price)}
                    {item.cheapest_price && item.cheapest_price > 0 && '/month'}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => {
                        if (selectedSoftware.length < 4) {
                          setSelectedSoftware([...selectedSoftware, item.name]);
                        }
                      }}
                      disabled={selectedSoftware.includes(item.name) || selectedSoftware.length >= 4}
                      className={`text-xs px-3 py-1 rounded ${
                        selectedSoftware.includes(item.name) 
                          ? 'bg-gray-300 text-gray-500' 
                          : selectedSoftware.length >= 4
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-cyan-500 text-white hover:bg-cyan-600'
                      }`}
                    >
                      {selectedSoftware.includes(item.name) ? 'Added' : 'Compare'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button 
            className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                className={`px-3 py-2 border rounded hover:bg-gray-100 ${
                  currentPage === pageNum ? 'bg-green-500 text-white' : ''
                }`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
          
          <span className="px-3 py-2 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      {isPopupOpen && (
        <ComparisonPopup
          onClose={() => setIsPopupOpen(false)}
          onAdd={(softwareName: string) => {
            if (selectedSoftware.length < 4 && !selectedSoftware.includes(softwareName)) {
              setSelectedSoftware([...selectedSoftware, softwareName]);
            }
          }}
          onRemove={(softwareName: string) => 
            setSelectedSoftware(selectedSoftware.filter(s => s !== softwareName))
          }
          selectedSoftware={selectedSoftware}
        />
      )}
    </div>
  );
};

export default AnalyzePage;