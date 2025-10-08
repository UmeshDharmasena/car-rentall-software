'use client'

import { useState, useEffect } from 'react';
import { Search, MessageSquare, FileText, Star, Check, ArrowLeft } from 'lucide-react';
import { createClient } from 'utils/supabase/client';

// Define interfaces for props and state
interface ReviewFormProps {
  softwareId: string;
  softwareName: string;
  onBack: () => void;
}

interface ReviewFormData {
  softwareName: string;
  firstName: string;
  lastName: string;
  email: string;
  overallRating: number;
  prosText: string;
  consText: string;
  overallExperience: string;
  reviewTitle: string;
  easeOfUse: number;
  featuresRating: number;
  customerSupport: number;
  valueForMoney: number;
  easeOfDeployment: number;
  easeOfSetup: number;
  pricing: string;
  recommendation: number;
}

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
}

interface Software {
  software_id: string;
  name: string;
  description: string;
  logo?: string;
}

// Main App component that renders the entire application
const App = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredSoftware, setFilteredSoftware] = useState<Software[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<{id: string, name: string} | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) { // Start searching after 2 characters
      setLoading(true);
      setError(null);
      
      try {
        const { data: softwareData, error: searchError } = await supabase
          .from('Software')
          .select('software_id, name, description, logo')
          .ilike('name', `%${term}%`)
          .limit(10);

        if (searchError) {
          throw searchError;
        }

        setFilteredSoftware(softwareData || []);
      } catch (err: any) {
        console.error('Search error:', err);
        setError('Failed to search software');
        setFilteredSoftware([]);
      } finally {
        setLoading(false);
      }
    } else {
      setFilteredSoftware([]);
    }
  };

  const handleSoftwareSelect = (software: Software) => {
    setSelectedSoftware({ id: software.software_id, name: software.name });
    setSearchTerm(''); // Clear the search bar
    setFilteredSoftware([]); // Hide the dropdown
  };

  // Conditionally render the ReviewForm or the search page
  if (selectedSoftware) {
    return (
      <ReviewForm 
        softwareId={selectedSoftware.id}
        softwareName={selectedSoftware.name} 
        onBack={() => setSelectedSoftware(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-left mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            WRITE A SOFTWARE REVIEW
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Compare top car rental solutions by price, features, and user ratings. Choose software tailored to your business size and needs, with reviews from real rental companies to help you pick the right fit.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Search Bar with Dropdown */}
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()} className="mb-12 relative">
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-lg pl-10 pr-12 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              placeholder="Search for Software (type at least 3 characters)"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {loading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          {filteredSoftware.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
              <ul className="py-1">
                {filteredSoftware.map((software) => (
                  <li
                    key={software.software_id}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSoftwareSelect(software)}
                  >
                    <div className="flex items-center gap-3">
                      {software.logo ? (
                        <img
                          src={software.logo} 
                          alt={`${software.name} logo`}
                          className="w-10 h-10 object-contain rounded border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">
                            {software.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="font-medium text-gray-900">{software.name}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {searchTerm.length > 2 && filteredSoftware.length === 0 && !loading && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
              <div className="px-4 py-3 text-gray-500 text-center">
                No software found matching "{searchTerm}"
              </div>
            </div>
          )}
        </form>

        {/* Three Step Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Search for the software you use.</h3>
            <p className="text-sm text-gray-600">We have many software options to choose from.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Write a really helpful review.</h3>
            <p className="text-sm text-gray-600">It only takes 5 minutes.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">It's all in the details!</h3>
            <p className="text-sm text-gray-600">The more specific and in-depth your review is, the better.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ReviewForm component
const ReviewForm = ({ softwareId, softwareName, onBack }: ReviewFormProps) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    softwareName: '',
    firstName: '',
    lastName: '',
    email: '',
    overallRating: 0,
    prosText: '',
    consText: '',
    overallExperience: '',
    reviewTitle: '',
    easeOfUse: 0,
    featuresRating: 0,
    customerSupport: 0,
    valueForMoney: 0,
    easeOfDeployment: 0,
    easeOfSetup: 0,
    pricing: '$',
    recommendation: 0
  });

  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (softwareName) {
      setFormData(prev => ({ ...prev, softwareName }));
    }
  }, [softwareName]);

  const handleInputChange = (field: keyof ReviewFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const StarRating = ({ rating, onRatingChange, label }: StarRatingProps) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Calculate category rating as average of individual ratings
      const categoryRatings = [
        formData.easeOfUse,
        formData.featuresRating,
        formData.customerSupport,
        formData.valueForMoney,
        formData.easeOfDeployment,
        formData.easeOfSetup
      ].filter(rating => rating > 0);

      // Store as array instead of average if the column expects JSON array
      const categoryRatingData = categoryRatings.length > 0 ? categoryRatings : null;

      // Convert pricing to percentage
      const pricingPercentage = formData.pricing.length * 20;

      const reviewData = {
        title: formData.reviewTitle,
        reviewer_name: `${formData.firstName} ${formData.lastName}`.trim(),
        reviewer_email: formData.email,
        overall_rating: formData.overallRating,
        pros: formData.prosText,
        cons: formData.consText,
        experience_description: formData.overallExperience || null,
        category_ratings: categoryRatingData, // Now sending array instead of average
        pricing_perception: pricingPercentage,
        recommendation_score: formData.recommendation,
        software_id: softwareId
      };

      console.log('Submitting review data:', reviewData);

      const { data, error: insertError } = await (supabase as any)
        .from('Review')
        .insert(reviewData)
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('Review submitted successfully:', data);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h2>
          <p className="text-gray-600 mb-6">Thank you for sharing your experience. Your review will help others make informed decisions.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Write Another Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Search
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Review for {softwareName}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Review Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Give your review a title *
              </label>
              <input
                type="text"
                required
                value={formData.reviewTitle}
                onChange={(e) => handleInputChange('reviewTitle', e.target.value)}
                placeholder="e.g., Great software for managing our fleet"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Overall Rating */}
            <StarRating
              rating={formData.overallRating}
              onRatingChange={(rating) => handleInputChange('overallRating', rating)}
              label="How would you rate the overall quality of this product? *"
            />

            {/* Category Tags */}
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Consider covering these topics to make your review more helpful:
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['LEARNING CURVE', 'SECURITY', 'VALUE FOR MONEY', 'GENERAL MANAGEMENT', 'SELLING AND PAYMENTS', 'BUGS AND ISSUES'].map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pros: What did you like most about this Rental Software?
                </label>
                <textarea
                  rows={4}
                  value={formData.prosText}
                  onChange={(e) => handleInputChange('prosText', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cons: What did you like least about this Rental Software?
                </label>
                <textarea
                  rows={4}
                  value={formData.consText}
                  onChange={(e) => handleInputChange('consText', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Overall Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your overall experience with this Rental Software
              </label>
              <textarea
                rows={4}
                value={formData.overallExperience}
                onChange={(e) => handleInputChange('overallExperience', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Additional Ratings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StarRating
                rating={formData.easeOfUse}
                onRatingChange={(rating) => handleInputChange('easeOfUse', rating)}
                label="Ease of Use"
              />
              <StarRating
                rating={formData.featuresRating}
                onRatingChange={(rating) => handleInputChange('featuresRating', rating)}
                label="Features & Functionality"
              />
              <StarRating
                rating={formData.customerSupport}
                onRatingChange={(rating) => handleInputChange('customerSupport', rating)}
                label="Customer Support"
              />
              <StarRating
                rating={formData.valueForMoney}
                onRatingChange={(rating) => handleInputChange('valueForMoney', rating)}
                label="Value for Money"
              />
              <StarRating
                rating={formData.easeOfDeployment}
                onRatingChange={(rating) => handleInputChange('easeOfDeployment', rating)}
                label="Ease of Deployment"
              />
              <StarRating
                rating={formData.easeOfSetup}
                onRatingChange={(rating) => handleInputChange('easeOfSetup', rating)}
                label="Ease of Setup"
              />
            </div>

            {/* Pricing Comparison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How does the pricing for this Rental Software compare to similar products?
              </label>
              <div className="flex gap-2">
                {['$', '$$', '$$$', '$$$$', '$$$$$'].map((price) => (
                  <button
                    key={price}
                    type="button"
                    onClick={() => handleInputChange('pricing', price)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.pricing === price
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                    }`}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How likely is it that you would recommend this Rental Software to a friend or colleague?
              </label>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => handleInputChange('recommendation', score)}
                      className={`w-10 h-10 rounded-lg border transition-colors ${
                        formData.recommendation === score
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Not Likely</span>
                <span>Very Likely</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={submitting}
                className={`px-12 py-4 text-lg font-bold rounded ${
                  submitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;