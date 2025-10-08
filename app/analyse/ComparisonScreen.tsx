"use client";

import React, { useState, useEffect } from 'react';
import { createClient } from 'utils/supabase/client';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface ComparisonScreenProps {
  selectedSoftware: string[];
  onBack: () => void;
  onClose: () => void;
}

interface Software {
  software_id: string;
  name: string;
  description: string;
  ui_type: string[];
  ui_description: string;
  platform_supported: string[];
  typical_customers: string[];
  content: string[];
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

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ 
  selectedSoftware, 
  onBack, 
  onClose 
}) => {
  const [softwareData, setSoftwareData] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    overview: true,
    pricing: true,
    features: true,
    support: false
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchSoftwareData();
  }, [selectedSoftware]);

  const fetchSoftwareData = async () => {
    try {
      setLoading(true);
      const softwarePromises = selectedSoftware.map(async (name) => {
        const { data: softwareData, error: softwareError } = await supabase
          .from('Software')
          .select('*')
          .eq('name', name)
          .single();

        if (softwareError || !softwareData) {
          console.error('Error fetching software:', softwareError);
          return null;
        }

        const software = softwareData as any;

        const [featuresRes, pricingRes, supportRes, reviewsRes] = await Promise.all([
          supabase
            .from('Feature')
            .select('*')
            .eq('software_id', software.software_id),
          supabase
            .from('PricingPlan')
            .select('*')
            .eq('software_id', software.software_id),
          supabase
            .from('SupportOption')
            .select('*')
            .eq('software_id', software.software_id),
          supabase
            .from('Review')
            .select('overall_rating')
            .eq('software_id', software.software_id)
        ]);

        const reviews = reviewsRes.data || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum, r) => sum + (r as any).overall_rating, 0) / reviews.length
          : 4.5;

        return {
          ...software,
          features: featuresRes.data || [],
          pricing_plans: pricingRes.data || [],
          support_option: supportRes.data?.[0] || null,
          rating: Math.round(avgRating * 10) / 10,
          review_count: reviews.length
        } as Software;
      });

      const results = await Promise.all(softwarePromises);
      setSoftwareData(results.filter(s => s !== null) as Software[]);
    } catch (err) {
      console.error('Error fetching software data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatCost = (cost: number | null | undefined) => {
    if (cost === null || cost === undefined) return 'Contact Vendor';
    if (cost === 0) return 'Free';
    return `$${cost.toFixed(0)}`;
  };

  const getLowestPrice = (pricingPlans: PricingPlan[] | undefined) => {
    if (!pricingPlans || pricingPlans.length === 0) return null;
    const validPrices = pricingPlans
      .map(p => p.cost)
      .filter(cost => cost !== null && cost !== undefined && cost > 0);
    return validPrices.length > 0 ? Math.min(...validPrices) : null;
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
    return stars;
  };

  const getAllFeatures = () => {
    const featuresSet = new Set<string>();
    softwareData.forEach(software => {
      software.features?.forEach(feature => {
        featuresSet.add(feature.feature_name);
      });
    });
    return Array.from(featuresSet).sort();
  };

  const hasFeature = (software: Software, featureName: string) => {
    return software.features?.some(f => f.feature_name === featureName) || false;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-lg">Loading comparison data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to selection
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="col-span-1"></div>
          {softwareData.map((software, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-100 rounded-lg p-4 mb-2">
                <h3 className="font-bold text-lg mb-2">{software.name}</h3>
                <div className="text-yellow-500 text-sm mb-1">
                  {renderStars(software.rating || 0)}
                </div>
                <div className="text-sm text-gray-600">
                  {software.rating?.toFixed(1)} ({software.review_count || 0} reviews)
                </div>
              </div>
              <Link href={`/product/${encodeURIComponent(software.name)}`}>
                <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors">
                  LEARN MORE
                </button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-xl font-bold">OVERVIEW</h2>
            {expandedSections.overview ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.overview && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="font-medium">Description</div>
                {softwareData.map((software, index) => (
                  <div key={index} className="text-sm text-gray-700 p-3 bg-gray-50 rounded">
                    {software.description}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="font-medium">Platforms</div>
                {softwareData.map((software, index) => (
                  <div key={index} className="text-sm">
                    {software.platform_supported?.map((platform, idx) => (
                      <div key={idx} className="flex items-center gap-1 mb-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{platform}</span>
                      </div>
                    )) || <span className="text-gray-400">No data</span>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="font-medium">Typical Customers</div>
                {softwareData.map((software, index) => (
                  <div key={index} className="text-sm">
                    {software.typical_customers?.join(', ') || 
                     <span className="text-gray-400">No data</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => toggleSection('pricing')}
            className="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-xl font-bold">PRICING</h2>
            {expandedSections.pricing ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.pricing && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-3">
                  <div className="font-medium h-8">Starting from</div>
                  <div className="font-medium h-8">Free trial</div>
                  <div className="font-medium h-8">Free version</div>
                  <div className="font-medium h-8">Total plans</div>
                </div>
                {softwareData.map((software, index) => {
                  const lowestPrice = getLowestPrice(software.pricing_plans);
                  return (
                    <div key={index} className="space-y-3">
                      <div className="text-2xl font-bold text-blue-600 h-8">
                        {formatCost(lowestPrice)}
                        {lowestPrice && lowestPrice > 0 && 
                          <span className="text-sm text-gray-600 font-normal">/mo</span>
                        }
                      </div>
                      <div className="flex items-center h-8">
                        {software.free_trial ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex items-center h-8">
                        {software.free_version ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="font-bold text-lg text-center h-8">
                        {software.pricing_plans?.length || 0}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Detailed Pricing Plans</h3>
                {softwareData.map((software, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="font-semibold mb-2">{software.name}</h4>
                    {software.pricing_plans && software.pricing_plans.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {software.pricing_plans.map((plan, planIndex) => (
                          <div key={planIndex} className="border rounded-lg p-3 bg-gray-50">
                            <div className="font-medium text-sm mb-1">{plan.plan_name}</div>
                            <div className="text-lg font-bold text-blue-600 mb-2">
                              {formatCost(plan.cost)}
                              {plan.cost > 0 && <span className="text-xs text-gray-600 font-normal">/mo</span>}
                            </div>
                            <div className="text-xs text-gray-600 mb-2">
                              {plan.included_features}
                            </div>
                            {plan.payment_options && plan.payment_options.length > 0 && (
                              <div className="text-xs text-gray-500">
                                {plan.payment_options.join(', ')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No pricing plans available</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => toggleSection('features')}
            className="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-xl font-bold">KEY FEATURES</h2>
            {expandedSections.features ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.features && (
            <div className="mt-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="space-y-2">
                  <div className="font-medium">Total features</div>
                  {getAllFeatures().map((feature, idx) => (
                    <div key={idx} className="text-sm py-2 border-t">
                      {feature}
                    </div>
                  ))}
                </div>
                {softwareData.map((software, index) => (
                  <div key={index} className="space-y-2">
                    <div className="font-bold text-lg text-center">
                      {software.features?.length || 0}
                    </div>
                    {getAllFeatures().map((feature, idx) => (
                      <div key={idx} className="flex justify-center py-2 border-t">
                        {hasFeature(software, feature) ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => toggleSection('support')}
            className="w-full flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <h2 className="text-xl font-bold">SUPPORT OPTIONS</h2>
            {expandedSections.support ? <ChevronUp /> : <ChevronDown />}
          </button>
          
          {expandedSections.support && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-5 gap-4">
                <div className="font-medium">Support Channels</div>
                {softwareData.map((software, index) => (
                  <div key={index} className="text-sm">
                    {software.support_option?.channels?.map((channel, idx) => (
                      <div key={idx} className="flex items-center gap-1 mb-1">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>{channel}</span>
                      </div>
                    )) || <span className="text-gray-400">No data</span>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="font-medium">Training Options</div>
                {softwareData.map((software, index) => (
                  <div key={index} className="text-sm">
                    {software.support_option?.training_options?.map((option, idx) => (
                      <div key={idx} className="mb-1">{option}</div>
                    )) || <span className="text-gray-400">No data</span>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-4">
                <div className="font-medium">Self-Help Resources</div>
                {softwareData.map((software, index) => (
                  <div key={index} className="flex items-center">
                    {software.support_option?.self_help_resources ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonScreen;