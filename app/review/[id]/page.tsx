"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Star, StarHalf, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
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
  logo?: string;
  user_id: string;
  rating?: number;
  review_count?: number;
}

interface Review {
  review_id: string;
  title: string;
  reviewer_name: string;
  reviewer_email: string;
  overall_rating: number;
  pros: string;
  cons: string;
  experience_description: string | null;
  category_ratings: number[] | null;
  pricing_perception: number | null;
  recommendation_score: number | null;
  software_id: string;
  created_at: string;
}

const ReviewsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const softwareName = params?.id as string;
  
  const [software, setSoftware] = useState<Software | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [filterBy, setFilterBy] = useState<string>('all');

  const supabase = createClient();

  useEffect(() => {
    if (softwareName) {
      const decodedName = decodeURIComponent(softwareName);
      fetchSoftwareAndReviews(decodedName);
    }
  }, [softwareName]);

  const fetchSoftwareAndReviews = async (name: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Searching for software with name:', name);

      // First try exact match
      let { data: softwareData, error: softwareError } = await supabase
        .from('Software')
        .select('*')
        .eq('name', name)
        .single();

      // If exact match fails, try case-insensitive search
      if (softwareError || !softwareData) {
        console.log('Exact match failed, trying case-insensitive search');
        
        const { data: ilikeData, error: ilikeError } = await supabase
          .from('Software')
          .select('*')
          .ilike('name', name)
          .single();
          
        if (ilikeError || !ilikeData) {
          throw new Error(`Software not found: ${ilikeError?.message || 'No matching software found'}`);
        }
        
        softwareData = ilikeData;
        softwareError = null;
      }

      if (!softwareData) {
        throw new Error('Software not found');
      }

      console.log('Found software:', softwareData);

      // Type assertion to handle the raw database response
      const rawSoftware = softwareData as any;

      const transformedSoftware: Software = {
        software_id: rawSoftware.software_id || '',
        name: rawSoftware.name || '',
        description: rawSoftware.description || '',
        ui_type: rawSoftware.ui_type || [],
        ui_description: rawSoftware.ui_description || '',
        platform_supported: rawSoftware.platform_supported || [],
        typical_customers: rawSoftware.typical_customers || [],
        content: rawSoftware.content || [],
        logo: rawSoftware.logo || undefined,
        user_id: rawSoftware.user_id || '',
      };

      await fetchReviews(transformedSoftware);
      
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (softwareData: Software) => {
    console.log('Fetching reviews for software_id:', softwareData.software_id);

    // First, let's check if there are any reviews at all in the table
    const { data: allReviews, error: allReviewsError } = await supabase
      .from('Review')
      .select('software_id')
      .limit(10);

    if (allReviewsError) {
      console.error('Error checking all reviews:', allReviewsError);
    } else {
      const sampleIds = (allReviews as any[])?.map((r: any) => r.software_id) || [];
      console.log('Sample software_ids in Review table:', sampleIds);
    }

    // Fetch reviews for this specific software
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('Review')
      .select('*')
      .eq('software_id', softwareData.software_id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Reviews fetch error:', reviewsError);
    }

    const reviewsArray = reviewsData as any[] || [];
    console.log('Raw reviews data:', reviewsArray);
    console.log('Number of reviews found:', reviewsArray.length);

    // Also try to fetch reviews with different approaches if none found
    if (reviewsArray.length === 0) {
      const { data: joinedData, error: joinError } = await supabase
        .from('Review')
        .select(`
          *,
          Software!inner(name, software_id)
        `)
        .eq('Software.name', softwareData.name);

      if (joinError) {
        console.error('Join query error:', joinError);
      } else {
        const joinedArray = joinedData as any[] || [];
        console.log('Reviews found via join:', joinedArray);
        
        if (joinedArray.length > 0) {
          const transformedReviews: Review[] = joinedArray.map((review: any) => ({
            review_id: review.review_id,
            title: review.title,
            reviewer_name: review.reviewer_name,
            reviewer_email: review.reviewer_email,
            overall_rating: review.overall_rating,
            pros: review.pros,
            cons: review.cons,
            experience_description: review.experience_description,
            category_ratings: review.category_ratings,
            pricing_perception: review.pricing_perception,
            recommendation_score: review.recommendation_score,
            software_id: review.software_id,
            created_at: review.created_at
          }));

          const avgRating = transformedReviews.length > 0 
            ? transformedReviews.reduce((sum, review) => sum + review.overall_rating, 0) / transformedReviews.length
            : 0;

          setSoftware({
            ...softwareData,
            rating: Math.round(avgRating * 10) / 10,
            review_count: transformedReviews.length
          });
          
          setReviews(transformedReviews);
          return;
        }
      }
    }

    const transformedReviews: Review[] = reviewsArray.map((review: any) => ({
      review_id: review.review_id,
      title: review.title,
      reviewer_name: review.reviewer_name,
      reviewer_email: review.reviewer_email,
      overall_rating: review.overall_rating,
      pros: review.pros,
      cons: review.cons,
      experience_description: review.experience_description,
      category_ratings: review.category_ratings,
      pricing_perception: review.pricing_perception,
      recommendation_score: review.recommendation_score,
      software_id: review.software_id,
      created_at: review.created_at
    }));

    console.log('Transformed reviews:', transformedReviews);

    const avgRating = transformedReviews.length > 0 
      ? transformedReviews.reduce((sum, review) => sum + review.overall_rating, 0) / transformedReviews.length
      : 0;

    setSoftware({
      ...softwareData,
      rating: Math.round(avgRating * 10) / 10,
      review_count: transformedReviews.length
    });
    
    setReviews(transformedReviews);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className={`${sizeClass} fill-yellow-400 text-yellow-400`} />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className={`${sizeClass} text-gray-300`} />);
    }

    return stars;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPricingText = (perception: number | null) => {
    if (!perception) return '';
    if (perception <= 20) return 'Very affordable';
    if (perception <= 40) return 'Affordable';
    if (perception <= 60) return 'Moderately priced';
    if (perception <= 80) return 'Expensive';
    return 'Very expensive';
  };

  const getRecommendationText = (score: number | null) => {
    if (!score) return '';
    if (score >= 9) return 'Highly recommended';
    if (score >= 7) return 'Recommended';
    if (score >= 5) return 'Neutral';
    return 'Not recommended';
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      const rating = Math.floor(review.overall_rating);
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const sortedAndFilteredReviews = () => {
    let filtered = [...reviews];
    
    if (filterBy !== 'all') {
      const rating = parseInt(filterBy);
      filtered = filtered.filter(review => Math.floor(review.overall_rating) === rating);
    }

    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.overall_rating - b.overall_rating);
        break;
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-lg">Loading reviews...</div>
      </div>
    );
  }

  if (error || !software) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Software not found'}</div>
          <button 
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6">
            {software.logo ? (
              <img 
                src={software.logo} 
                alt={`${software.name} logo`}
                className="w-16 h-16 object-contain rounded-lg border border-gray-200 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-lg">
                  {software.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{software.name}</h1>
              <p className="text-sm text-gray-600 mb-3">{software.description}</p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {renderStars(software.rating || 0)}
                  <span className="text-lg font-bold ml-2">{software.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-gray-600">({totalReviews})</span>
                </div>
                <button 
                  onClick={() => router.push(`/write-review?software=${encodeURIComponent(software.name)}&id=${software.software_id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                  WRITE A REVIEW
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-medium mb-4">Overall rating</h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = ratingDistribution[rating as keyof typeof ratingDistribution];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <button
                      key={rating}
                      onClick={() => setFilterBy(rating.toString())}
                      className={`flex items-center gap-2 w-full text-left p-2 rounded hover:bg-gray-50 ${
                        filterBy === rating.toString() ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {renderStars(rating, 'sm')}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                        <div 
                          className="bg-orange-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setFilterBy('all')}
                className={`w-full mt-3 px-3 py-1 text-sm rounded border ${
                  filterBy === 'all' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                Show All Reviews
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {sortedAndFilteredReviews().length} of {totalReviews} reviews
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {sortedAndFilteredReviews().length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-500 mb-4">
                    {totalReviews === 0 
                      ? 'No reviews have been written for this software yet.'
                      : 'No reviews found matching your criteria.'
                    }
                  </div>
                  {totalReviews === 0 && (
                    <button
                      onClick={() => router.push(`/write-review?software=${encodeURIComponent(software.name)}&id=${software.software_id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Be the first to write a review
                    </button>
                  )}
                  {totalReviews > 0 && (
                    <button
                      onClick={() => setFilterBy('all')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Show all reviews
                    </button>
                  )}
                </div>
              ) : (
                sortedAndFilteredReviews().map((review) => (
                  <div key={review.review_id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-medium text-sm">
                          {getInitials(review.reviewer_name)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-900">{review.reviewer_name}</span>
                          <div className="flex items-center gap-1">
                            {renderStars(review.overall_rating, 'sm')}
                            <span className="text-sm text-gray-600 ml-1">
                              {review.overall_rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(review.created_at)}
                          </div>
                          {review.recommendation_score && (
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {getRecommendationText(review.recommendation_score)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {review.title && (
                      <h4 className="font-medium text-lg text-gray-900 mb-3">{review.title}</h4>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {review.pros && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">Pros</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                              {review.pros}
                            </p>
                          </div>
                        )}
                        
                        {review.cons && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ThumbsDown className="h-4 w-4 text-red-600" />
                              <span className="font-medium text-red-700">Cons</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-red-50 p-3 rounded">
                              {review.cons}
                            </p>
                          </div>
                        )}
                      </div>

                      {review.experience_description && (
                        <div>
                          <span className="font-medium text-gray-900">Overall Experience:</span>
                          <p className="text-sm text-gray-700 mt-1">{review.experience_description}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-6 pt-3 border-t border-gray-100 text-sm text-gray-600">
                        {review.pricing_perception && (
                          <div>
                            <span className="font-medium">Pricing:</span> {getPricingText(review.pricing_perception)}
                          </div>
                        )}
                        {review.recommendation_score && (
                          <div>
                            <span className="font-medium">Recommendation Score:</span> {review.recommendation_score}/10
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;