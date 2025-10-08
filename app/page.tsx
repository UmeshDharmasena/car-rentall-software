'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Star, ArrowRight, ChevronDown, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { blogPosts } from '@/lib/blogData' // Import blog data

// Type definitions
interface SoftwareProduct {
  software_id: string;
  name: string;
  description: string;
}

interface SoftwareListItem {
  name: string;
  rating: number;
  reviews: number;
  logo: string;
}

interface FAQ {
  question: string;
  answer: string;
}

// Sample data for static content
const softwareList: SoftwareListItem[] = [
  { name: 'AiRentoSoft', rating: 5.0, reviews: 245, logo: '/AiRentoSoft_Logo.webp' },
  { name: 'Rentall', rating: 4.6, reviews: 189, logo: '/rentAll_logo.webp' },
  { name: 'HQ Rental', rating: 4.7, reviews: 156, logo: '/HQ_Logo.svg' },
  { name: 'Thermeon', rating: 4.5, reviews: 203, logo: '/thermeon_logo.png' },
  { name: 'RentHub', rating: 4.6, reviews: 189, logo: '/renthub_logo.webp' },
  { name: 'Rent Centric', rating: 4.4, reviews: 178, logo: '/rentcentric_logo.png' },
  { name: 'RentBee', rating: 4.3, reviews: 134, logo: '/rentbee_logo.png' },
  { name: 'RentSyst', rating: 4.7, reviews: 156, logo: '/RentSyst_logo.webp' }
]

const faqs: FAQ[] = [
  {
    question: "What are the key features to look for in a Car Rentall Software?",
    answer: "Key features include fleet management, online booking system, payment processing, customer management, maintenance tracking, reporting and analytics, mobile accessibility, and integration capabilities."
  },
  {
    question: "How does the price vary from software to software?",
    answer: "Pricing varies based on features, number of vehicles, users, and deployment type. Basic plans start around $50/month while enterprise solutions can cost $500+ monthly."
  },
  {
    question: "Is my data safe in cloud-based Car Rentall Software?",
    answer: "Reputable cloud-based solutions use enterprise-grade security including encryption, regular backups, compliance certifications, and secure data centers to protect your information."
  }
]

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SoftwareProduct[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Get first 3 blog posts for display
  const displayedBlogs = blogPosts.slice(0, 3)

  // Search for products as user types
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([])
        setShowDropdown(false)
        return
      }

      setIsSearching(true)
      try {
        const { data, error } = await supabase
          .from('Software')
          .select('software_id, name, description')
          .ilike('name', `%${searchQuery}%`)
          .limit(5)

        if (error) {
          console.error('Search error:', error)
          return
        }

        if (data && data.length > 0) {
          setSearchResults(data as SoftwareProduct[])
          setShowDropdown(true)
        } else {
          setSearchResults([])
          setShowDropdown(false)
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchProducts, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, supabase])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectProduct = (product: SoftwareProduct) => {
    router.push(`/product/${encodeURIComponent(product.name)}`)
    setSearchQuery('')
    setShowDropdown(false)
    setSearchResults([])
  }

  const handleSearch = () => {
    if (searchResults.length === 1) {
      handleSelectProduct(searchResults[0])
    } else if (searchResults.length > 1) {
      handleSelectProduct(searchResults[0])
    } else if (searchQuery.trim()) {
      router.push(`/analyse?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part: string, i: number) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-semibold text-blue-600">{part}</span>
      ) : (
        part
      )
    )
  }

  return (
    <div className="min-h-screen font-sans relative bg-white">
      {/* Hero Section */}
      <section 
        className="relative py-16 lg:py-24 min-h-[60vh] flex items-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/FleetHero.png')" }}
      >
        <div className="absolute inset-0 bg-white/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900">
              BUILT AROUND YOUR CAR RENTAL BUSINESS
            </h1>
            
            <p className="text-gray-700 text-base md:text-lg leading-relaxed max-w-3xl mx-auto mb-12">
              We're on a mission to help rental operators grow with the most powerful and reliable car rental management solutions. Whether you run a small local rental or a large fleet, these top software platforms offer the tools you need for success.
            </p>

            <p className="text-cyan-500 text-sm md:text-base font-semibold tracking-wider mb-4 uppercase">
              TOP 5 CAR RENTAL SOFTWARE
            </p>

            {/* software Cards */}
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              <a 
                href="/analyse" 
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-95 flex flex-col items-center text-center min-w-[140px]"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  <img 
                      src={"/rentAll_logo.webp"} 
                      alt="rentAll_logo"
                      className="w-full h-full object-contain"
                    />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Rentall
                </h3>
              </a>

              <a 
                href="/analyse" 
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-95 flex flex-col items-center text-center min-w-[140px]"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  <img 
                      src={"/AiRentoSoft_Logo.webp"} 
                      alt="AiRentoSoft_Logo"
                      className="w-full h-full object-contain"
                    />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  AiRentoSoft
                </h3>
              </a>

              <a 
                href="/analyse" 
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-95 flex flex-col items-center text-center min-w-[140px]"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  <img 
                      src={"/rentcentric_logo.png"} 
                      alt="rentcentric_logo"
                      className="w-full h-full object-contain"
                    />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  Rent Centric
                </h3>
              </a>

              <a 
                href="/analyse" 
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-95 flex flex-col items-center text-center min-w-[140px]"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  <img 
                      src={"/HQ_Logo.svg"} 
                      alt="HQ_Logo"
                      className="w-full h-full object-contain"
                    />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  HQ Rental
                </h3>
              </a>

              <a 
                href="/analyse" 
                className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:scale-95 flex flex-col items-center text-center min-w-[140px]"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                  <img 
                      src={"/RentSyst_logo.webp"} 
                      alt="RentSyst_logo"
                      className="w-full h-full object-contain"
                    />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  RentSyst
                </h3>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Find Your Car Rental Software Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Find Your Car Rental Software
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Compare</h3>
                  <p className="text-gray-600">
                    Instantly evaluate features, pricing, and support with our 
                    side-by-side comparison tool.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Review</h3>
                  <p className="text-gray-600">
                    Get honest insights from verified professionals with our 
                    community-driven ratings and reviews.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyse</h3>
                  <p className="text-gray-600">
                    Understand the pros, cons, and performance of each 
                    software with our in-depth analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <Image
                  src="/RentalSoftwareCollection.png"
                  alt="Software comparison dashboard"
                  width={500}
                  height={350}
                  className="w-full h-auto rounded-lg"
                />
                <div className="mt-4 text-center">
                  <a href="/product/AiRentoSoft">
                    <button className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-2 rounded-full font-medium transition-colors border-2 border-gray-900 shadow-sm">
                      View Our Highest Rated Product
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Software Grid */}
          <div className="mt-16">
            <div className="flex items-center justify-center gap-4 mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Top Rated Car Rental Software
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {softwareList.map((software: SoftwareListItem, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                  <div className="w-24 h-24 mb-4 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                    <Image
                      src={software.logo}
                      alt={`${software.name} logo`}
                      width={80}
                      height={80}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-3">{software.name}</h3>
                  
                  {software.reviews > 0 ? (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{software.rating}</span>
                      <span className="text-gray-500">({software.reviews} Reviews)</span>
                    </div>
                  ) : (
                    <a href="#" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Write a Review
                    </a>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <a href="/analyse">
                <button className="bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 px-8 py-3 rounded-full font-medium transition-colors">
                  View All Rental Software
                </button>
              </a>
            </div>
          </div>

          {/* Blog Section - Updated to use blogData */}
          <div className="mt-16 pt-16 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Latest from Our Blog
              </h2>
              <a href="/blogs">
                <button className="text-blue-500 hover:text-blue-600 font-medium flex items-center gap-2">
                  View All Articles
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayedBlogs.map((blog) => (
                <article key={blog.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow group">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                        {blog.category}
                      </span>
                      <span>•</span>
                      <span>{blog.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      <a href={`/blogs/${blog.id}`}>
                        {blog.title}
                      </a>
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>
                    <a href={`/blogs/${blog.id}`} className="text-blue-500 hover:text-blue-600 font-medium text-sm flex items-center gap-1">
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Frequently asked questions
          </h2>
          <p className="text-gray-600 mb-8">
            Here are some common questions about Car Rentall Software.
          </p>

          <div className="space-y-4">
            {faqs.map((faq: FAQ, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 border-t border-gray-100">
                    <div className="pt-4">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Boost Your Rental Business 
                With The Right Software 
                Solution
              </h2>
              <p className="text-gray-300 mb-6 text-lg">
                Compare rental car software and find the perfect fit for your fleet.
              </p>
              <a href="/analyse">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-colors inline-flex items-center gap-2">
                  Start Your Search
                  <ArrowRight className="w-5 h-5" />
                </button>
              </a>
            </div>
            <div className="relative">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <Image
                  src="/sys.png"
                  alt="Software dashboard preview"
                  width={200}
                  height={100}
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage