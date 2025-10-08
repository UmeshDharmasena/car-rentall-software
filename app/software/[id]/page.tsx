'use client'

import { useState } from 'react'
import { Star, Check, X, Users, Award, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

// Sample software data - in real app, this would come from props/API
const softwareData = {
  id: 1,
  name: 'AiRentoSoft',
  tagline: 'Cloud-based car rental software',
  rating: 4.5,
  totalReviews: 231,
  description: 'AiRentoSoft is an advanced cloud-based car rental software built for the future. AiRentoSoft revolutionizes your car rental operations with intelligent automation and provides designed to simplify and automate your business. Our comprehensive platform streamlines every aspect of your rental operations, from seamless online bookings to advanced analytics.',
  pricing: {
    startingFrom: '$99',
    plans: [
      {
        name: 'Starter',
        price: '$99',
        features: ['Up to 50 vehicles', 'Basic reporting', 'Email support', 'Online booking']
      },
      {
        name: 'Professional',
        price: '$199',
        features: ['Up to 200 vehicles', 'Advanced analytics', 'Priority support', 'Mobile app', 'GPS tracking']
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        features: ['Unlimited vehicles', 'Custom integrations', 'Dedicated support', 'White-label options']
      }
    ]
  },
  features: {
    'Security & Compliance': ['Data encryption', 'GDPR compliance', 'Regular backups', 'Access controls'],
    'Fleet Management': ['Vehicle tracking', 'Maintenance scheduling', 'Fuel management', 'Insurance tracking'],
    'Booking & Reservation': ['Online booking', 'Mobile reservations', 'Calendar integration', 'Payment processing'],
    'Reporting & Analytics': ['Custom reports', 'Revenue analytics', 'Fleet utilization', 'Customer insights']
  },
  pros: [
    'User-friendly interface',
    'Excellent customer support',
    'Comprehensive feature set',
    'Regular updates and improvements',
    'Reliable cloud infrastructure'
  ],
  cons: [
    'Can be expensive for small businesses',
    'Learning curve for advanced features',
    'Limited customization options',
    'Integration setup can be complex'
  ],
  alternatives: [
    { name: 'RentCar Pro', rating: 4.2, startingPrice: '$79' },
    { name: 'FleetMaster', rating: 4.1, startingPrice: '$59' },
    { name: 'RENTALS', rating: 4.7, startingPrice: '$129' }
  ]
}

const reviews = [
  {
    id: 1,
    author: 'Miranda W.',
    role: 'Fleet Manager',
    company: 'City Car Rentals',
    rating: 5,
    date: '2024-02-15',
    title: 'Excellent comprehensive solution',
    content: 'AiRentoSoft has transformed our operations. The booking system is intuitive, and the reporting features give us insights we never had before. Customer support is outstanding.',
    helpful: 23,
    pros: ['Easy to use', 'Great support', 'Comprehensive features'],
    cons: ['Initial setup time']
  },
  {
    id: 2,
    author: 'John D.',
    role: 'Business Owner',
    company: 'Downtown Rentals',
    rating: 4,
    date: '2024-02-10',
    title: 'Good software with room for improvement',
    content: 'Overall satisfied with AiRentoSoft. The core features work well, but I wish there were more customization options for reports.',
    helpful: 18,
    pros: ['Reliable', 'Good mobile app', 'Regular updates'],
    cons: ['Limited customization', 'Price point']
  },
  {
    id: 3,
    author: 'Sarah M.',
    role: 'Operations Manager',
    company: 'Elite Fleet Services',
    rating: 5,
    date: '2024-02-05',
    title: 'Perfect for growing businesses',
    content: 'We started with the Professional plan and it scaled perfectly with our growth. The analytics help us make data-driven decisions.',
    helpful: 31,
    pros: ['Scalable', 'Great analytics', 'Professional support'],
    cons: ['None significant']
  }
]

const SoftwareDetailPage = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSections, setExpandedSections] = useState<string[]>(['Security & Compliance'])
  const [showAllReviews, setShowAllReviews] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'reviews', label: 'User Reviews' },
    { id: 'alternatives', label: 'Alternatives' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {softwareData.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">{softwareData.tagline}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < softwareData.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="font-semibold">{softwareData.rating}</span>
                  <span className="text-gray-600">({softwareData.totalReviews} reviews)</span>
                </div>
                <div className="text-primary-600 font-semibold">
                  Starting from {softwareData.pricing.startingFrom}/month
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary">
                Add to Compare
              </button>
              <Link href="/write-review" className="btn-primary">
                Write a Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="card p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What is {softwareData.name}?</h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {softwareData.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-green-600">Pros</h3>
                    <ul className="space-y-2">
                      {softwareData.pros.map((pro, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">Cons</h3>
                    <ul className="space-y-2">
                      {softwareData.cons.map((con, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Overall Rating</span>
                    <span className="font-semibold">{softwareData.rating}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Reviews</span>
                    <span className="font-semibold">{softwareData.totalReviews}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Price</span>
                    <span className="font-semibold">{softwareData.pricing.startingFrom}/month</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ease of Use</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Setup', rating: 4 },
                    { label: 'Learning', rating: 4 },
                    { label: 'Administration', rating: 5 }
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.label}</span>
                        <span>{item.rating}/5</span>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-2 w-6 rounded ${i < item.rating ? 'bg-primary-600' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {Object.entries(softwareData.features).map(([category, features]) => (
              <div key={category} className="card">
                <button
                  onClick={() => toggleSection(category)}
                  className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  {expandedSections.includes(category) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {expandedSections.includes(category) && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Pricing Plans</h2>
              <p className="text-lg text-gray-600">Choose the plan that fits your business needs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {softwareData.pricing.plans.map((plan, index) => (
                <div key={index} className={`card p-8 relative ${index === 1 ? 'ring-2 ring-primary-600' : ''}`}>
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {plan.price}
                      {plan.price !== 'Custom' && <span className="text-lg font-normal text-gray-600">/month</span>}
                    </div>
                    <p className="text-gray-600 mb-6">per month, billed annually</p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    index === 1 
                      ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}>
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">User Reviews</h2>
              <Link href="/write-review" className="btn-primary">
                Write a Review
              </Link>
            </div>
            
            <div className="space-y-6">
              {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                <div key={review.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {review.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{review.author}</h4>
                        <p className="text-sm text-gray-600">{review.role} at {review.company}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <h5 className="font-semibold text-gray-900 mb-3">{review.title}</h5>
                  <p className="text-gray-600 mb-4">{review.content}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="font-medium text-green-600 mb-2">Pros:</h6>
                      <ul className="space-y-1">
                        {review.pros.map((pro, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <Check className="h-3 w-3 text-green-500" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-red-600 mb-2">Cons:</h6>
                      <ul className="space-y-1">
                        {review.cons.map((con, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <X className="h-3 w-3 text-red-500" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">{review.helpful} people found this helpful</span>
                    <div className="flex gap-2">
                      <button className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                        Helpful
                      </button>
                      <button className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {reviews.length > 3 && (
              <div className="text-center mt-8">
                <button 
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="btn-secondary"
                >
                  {showAllReviews ? 'Show Less' : `View All ${reviews.length} Reviews`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Alternatives Tab */}
        {activeTab === 'alternatives' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{softwareData.name} Alternatives</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {softwareData.alternatives.map((alternative, index) => (
                <div key={index} className="card p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-600 font-bold text-lg">
                      {alternative.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{alternative.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < alternative.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-1">{alternative.rating}</span>
                  </div>
                  <p className="text-primary-600 font-semibold mb-4">Starting from {alternative.startingPrice}/month</p>
                  <div className="space-y-2">
                    <Link href={`/software/${index + 2}`} className="btn-secondary w-full text-sm">
                      Learn More
                    </Link>
                    <button className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Add to Compare
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SoftwareDetailPage