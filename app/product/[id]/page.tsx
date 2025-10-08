"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Star, StarHalf, Users, Award, Clock, Phone, Mail, MessageCircle, Book, Play, Image as ImageIcon } from 'lucide-react';
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
  free_trial: boolean;
  free_version: boolean;
  features?: Feature[];
  pricing_plans?: PricingPlan[];
  support_option?: SupportOption;
  rating?: number;
  review_count?: number;
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

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  name: string;
}

const ProductPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const softwareName = params?.id as string;
  
  const [software, setSoftware] = useState<Software | null>(null);
  const [alternativeSoftware, setAlternativeSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const supabase = createClient();

  useEffect(() => {
    if (softwareName) {
      const decodedName = decodeURIComponent(softwareName);
      fetchSoftwareDetails(decodedName);
      fetchAlternatives(decodedName);
    }
  }, [softwareName]);

  const fetchSoftwareDetails = async (name: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data: softwareData, error: softwareError } = await supabase
        .from('Software')
        .select('*')
        .eq('name', name)
        .single();

      if (softwareError) {
        console.error('Supabase query error:', softwareError);
        throw softwareError;
      }

      if (!softwareData) {
        throw new Error('Software not found');
      }

      const baseSoftware = {
        software_id: (softwareData as any).software_id || '',
        name: (softwareData as any).name || '',
        description: (softwareData as any).description || '',
        ui_type: (softwareData as any).ui_type || [],
        ui_description: (softwareData as any).ui_description || '',
        platform_supported: (softwareData as any).platform_supported || [],
        typical_customers: (softwareData as any).typical_customers || [],
        content: (softwareData as any).content || [],
        logo: (softwareData as any).logo || undefined,
        user_id: (softwareData as any).user_id || '',
        free_trial: (softwareData as any).free_trial || false,
        free_version: (softwareData as any).free_version || false,
      };

      const [featuresRes, pricingRes, supportRes, reviewsRes] = await Promise.all([
        supabase
          .from('Feature')
          .select('*')
          .eq('software_id', baseSoftware.software_id),
        supabase
          .from('PricingPlan')  
          .select('*')
          .eq('software_id', baseSoftware.software_id),
        supabase
          .from('SupportOption')
          .select('*')
          .eq('software_id', baseSoftware.software_id),
        supabase
          .from('Review')
          .select('overall_rating')
          .eq('software_id', baseSoftware.software_id)
      ]);

      const features: Feature[] = Array.isArray(featuresRes.data) ? featuresRes.data as Feature[] : [];
      const pricing: PricingPlan[] = Array.isArray(pricingRes.data) ? pricingRes.data as PricingPlan[] : [];
      const support: SupportOption[] = Array.isArray(supportRes.data) ? supportRes.data as SupportOption[] : [];
      const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];

      if (featuresRes.error) throw new Error('Failed to fetch features: ' + featuresRes.error.message);
      if (pricingRes.error) throw new Error('Failed to fetch pricing: ' + pricingRes.error.message);
      if (supportRes.error) throw new Error('Failed to fetch support: ' + supportRes.error.message);
      if (reviewsRes.error) console.error('Failed to fetch reviews:', reviewsRes.error);

      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum: number, review: any) => sum + review.overall_rating, 0) / reviews.length
        : 0;

      const transformedSoftware: Software = {
        ...baseSoftware,
        features: features,
        pricing_plans: pricing,
        support_option: support.length > 0 ? support[0] : undefined,
        rating: reviews.length > 0 ? Math.round(avgRating * 10) / 10 : undefined,
        review_count: reviews.length
      };

      setSoftware(transformedSoftware);

      if (transformedSoftware.content && transformedSoftware.content.length > 0) {
        const media: MediaItem[] = transformedSoftware.content.map((url: string) => ({
          url,
          type: url.includes('video') || url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image',
          name: url.split('/').pop() || 'Media'
        }));
        setMediaItems(media);
        setSelectedMedia(media[0] || null);
      }

    } catch (err: any) {
      console.error('Error fetching software details:', err);
      setError(err.message || 'Failed to fetch software details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlternatives = async (currentName: string) => {
    try {
      const isAiRentoSoft = currentName === 'AiRentoSoft';
      
      let softwareData: any[] = [];
      
      if (isAiRentoSoft) {
        const { data, error: softwareError } = await supabase
          .from('Software')
          .select('*')
          .neq('name', currentName)
          .limit(4);
        
        if (softwareError) {
          console.error('Alternative software fetch error:', softwareError);
          return;
        }
        softwareData = data || [];
      } else {
        const { data: aiRentoData, error: aiRentoError } = await supabase
          .from('Software')
          .select('*')
          .eq('name', 'AiRentoSoft')
          .single();
        
        const { data: othersData, error: othersError } = await supabase
          .from('Software')
          .select('*')
          .neq('name', currentName)
          .neq('name', 'AiRentoSoft')
          .limit(3);
        
        if (othersError) {
          console.error('Alternative software fetch error:', othersError);
        }
        
        softwareData = [];
        if (aiRentoData) {
          softwareData.push(aiRentoData);
        }
        if (othersData && Array.isArray(othersData)) {
          softwareData.push(...othersData);
        }
      }

      if (!softwareData || !Array.isArray(softwareData)) {
        return;
      }

      const alternatives: Software[] = [];
      
      for (const rawItem of softwareData) {
        const item = {
          software_id: (rawItem as any).software_id || '',
          name: (rawItem as any).name || '',
          description: (rawItem as any).description || '',
          ui_type: (rawItem as any).ui_type || [],
          ui_description: (rawItem as any).ui_description || '',
          platform_supported: (rawItem as any).platform_supported || [],
          typical_customers: (rawItem as any).typical_customers || [],
          content: (rawItem as any).content || [],
          logo: (rawItem as any).logo || undefined,
          user_id: (rawItem as any).user_id || '',
          free_trial: (rawItem as any).free_trial || false,
          free_version: (rawItem as any).free_version || false,
        };

        const [pricingRes, reviewsRes] = await Promise.all([
          supabase
            .from('PricingPlan')
            .select('*')
            .eq('software_id', item.software_id),
          supabase
            .from('Review')
            .select('overall_rating')
            .eq('software_id', item.software_id)
        ]);

        const reviews = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.overall_rating, 0) / reviews.length
          : 0;

        const pricingPlans = Array.isArray(pricingRes.data) ? pricingRes.data as PricingPlan[] : [];

        const alternative: Software = {
          ...item,
          pricing_plans: pricingPlans,
          rating: reviews.length > 0 ? Math.round(avgRating * 10) / 10 : undefined,
          review_count: reviews.length
        };
        
        alternatives.push(alternative);
      }

      setAlternativeSoftware(alternatives);
    } catch (err: any) {
      console.error('Error fetching alternatives:', err);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const formatCost = (cost: number | null | undefined) => {
    if (cost === null || cost === undefined) return 'Contact Vendor';
    if (cost === 0) return 'Free';
    return `${cost.toFixed(0)}`;
  };

  const getLowestPrice = (pricingPlans: PricingPlan[] | undefined) => {
    if (!pricingPlans || pricingPlans.length === 0) return null;
    const validPrices = pricingPlans
      .map(p => p.cost)
      .filter(cost => cost !== null && cost !== undefined && cost > 0);
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

  const getSupportIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      case 'knowledge base': return <Book className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-lg">Loading software details...</div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 flex-1">
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
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{software.name}</h1>
                  {software.free_trial && (
                    <span className="bg-cyan-100 text-black px-3 py-1 rounded text-sm font-medium">FREE TRIAL</span>
                  )}
                  {software.free_version && (
                    <span className="bg-orange-100 text-black px-3 py-1 rounded text-sm font-medium">FREE VERSION</span>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {renderStars(software.rating || 0)}
                    <span className="text-sm text-gray-600 ml-2">({software.review_count})</span>
                  </div>
                  <button 
                    onClick={() => router.push(`/review/${encodeURIComponent(software.name)}`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    VIEW REVIEWS
                  </button>
                  <button 
                    onClick={() => router.push(`/write-review?software=${encodeURIComponent(software.name)}&id=${software.software_id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                    Write A Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">What is {software.name}?</h2>
              <p className="text-gray-700 mb-6">{software.description}</p>
              
              {mediaItems.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-lg p-4 flex justify-center items-center h-96">
                    {selectedMedia ? (
                      selectedMedia.type === 'image' ? (
                        <img 
                          src={selectedMedia.url} 
                          alt="Software screenshot"
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      ) : (
                        <video 
                          src={selectedMedia.url}
                          controls
                          className="max-h-full max-w-full object-contain rounded"
                        />
                      )
                    ) : (
                      <div className="text-gray-500">No media selected</div>
                    )}
                  </div>

                  <div className="flex gap-2 overflow-x-auto">
                    {mediaItems.map((media, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMedia(media)}
                        className={`flex-shrink-0 w-20 h-20 border-2 rounded overflow-hidden ${
                          selectedMedia?.url === media.url ? 'border-blue-500' : 'border-gray-200'
                        }`}
                      >
                        {media.type === 'image' ? (
                          <img 
                            src={media.url} 
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Play className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Ease of use</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-medium mb-2">Ease of Setup</div>
                  <div className="flex justify-center mb-1">
                    {renderStars(4.2)}
                  </div>
                  <div className="text-sm text-gray-600">4.2</div>
                </div>
                <div className="text-center">
                  <div className="font-medium mb-2">Ease of Deployment</div>
                  <div className="flex justify-center mb-1">
                    {renderStars(4.1)}
                  </div>
                  <div className="text-sm text-gray-600">4.1</div>
                </div>
                <div className="text-center">
                  <div className="font-medium mb-2">Ease of Use</div>
                  <div className="flex justify-center mb-1">
                    {renderStars(4.3)}
                  </div>
                  <div className="text-sm text-gray-600">4.3</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Pricing Plans</h3>
              
              {software.pricing_plans && software.pricing_plans.length > 0 ? (
                <div className="space-y-4">
                  {software.pricing_plans.map((plan, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-lg">{plan.plan_name}</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCost(plan.cost)}
                          {plan.cost > 0 && <span className="text-sm text-gray-600 font-normal">/month</span>}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {plan.included_features}
                      </div>

                      {plan.payment_options && plan.payment_options.length > 0 && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="text-sm font-medium mb-2">Payment Options:</div>
                          <div className="flex flex-wrap gap-2">
                            {plan.payment_options.map((option, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {option}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No pricing information available for this software</div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Features</h3>
              <div className="space-y-4">
                {software.features && software.features.length > 0 ? (
                  software.features.map((feature) => (
                    <div key={feature.feature_id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">{feature.feature_name}</span>
                        <div className="flex items-center gap-1">
                          {renderStars(Math.random() * 2 + 3).slice(0, 4)}
                          <span className="text-xs text-gray-500 ml-1">
                            {(Math.random() * 2 + 3).toFixed(1)}
                          </span>
                        </div>
                      </div>
                      {feature.feature_description && (
                        <p className="text-xs text-gray-600">{feature.feature_description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">No features available for this software</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold mb-4">Support and Training</h3>
              
              {software.support_option ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Training</h4>
                    <div className="space-y-1">
                      {software.support_option.training_options && software.support_option.training_options.length > 0 ? (
                        software.support_option.training_options.map((option, index) => (
                          <div key={index} className="text-sm">{option}</div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No training options available</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Support</h4>
                    <div className="space-y-2">
                      {software.support_option.channels && software.support_option.channels.length > 0 ? (
                        software.support_option.channels.map((channel, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {getSupportIcon(channel)}
                            <span className="text-sm capitalize">{channel}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-500">No support channels available</div>
                      )}
                    </div>
                    
                    {software.support_option.hours && software.support_option.hours.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="text-sm font-medium mb-1">Hours:</div>
                        {software.support_option.hours.map((hour, index) => (
                          <div key={index} className="text-sm text-gray-600">{hour}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No support information available for this software</div>
              )}
            </div>
          </div>
        </div>

        {alternativeSoftware.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-center mb-6">{software.name} Alternatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {alternativeSoftware.map((alt) => {
                const lowestPrice = getLowestPrice(alt.pricing_plans);
                return (
                  <div key={alt.software_id} className="border rounded-lg overflow-hidden">
                    <div className="p-4 text-center">
                      {alt.logo ? (
                        <img 
                          src={alt.logo} 
                          alt={`${alt.name} logo`}
                          className="w-16 h-16 object-contain rounded-lg mx-auto mb-3 border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <span className="text-blue-600 font-bold text-lg">
                            {alt.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h3 className="font-bold mb-2">{alt.name}</h3>
                      <div className="flex justify-center items-center gap-1 mb-2">
                        {renderStars(alt.rating || 0).slice(0, 5)}
                        <span className="text-xs text-gray-600">({alt.review_count})</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Starting from</span>
                          <span className="font-bold">
                            {formatCost(lowestPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Free trial</span>
                          <span className={alt.free_trial ? 'text-green-600' : 'text-red-600'}>
                            {alt.free_trial ? '✓' : '✗'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Free version</span>
                          <span className={alt.free_version ? 'text-green-600' : 'text-red-600'}>
                            {alt.free_version ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>

                      <button 
                        onClick={() => router.push(`/product/${encodeURIComponent(alt.name)}`)}
                        className="w-full bg-orange-500 text-white py-2 px-4 rounded mt-4 hover:bg-orange-600">
                        LEARN MORE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;