'use client'

import { Users, Target, Award, Mail, Phone, MapPin, CheckCircle } from 'lucide-react'
import Image from 'next/image'

const AboutPage = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      bio: 'Former car rental industry executive with 15+ years of experience in fleet management and software solutions.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Software architect specializing in SaaS platforms and rental management systems with expertise in scalable solutions.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Research',
      bio: 'Industry analyst with deep knowledge of car rental software trends and market dynamics across global markets.',
      image: '/api/placeholder/300/300'
    },
    {
      name: 'David Kim',
      role: 'Lead Developer',
      bio: 'Full-stack developer with expertise in modern web technologies and database optimization for large-scale applications.',
      image: '/api/placeholder/300/300'
    }
  ]

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Transparency',
      description: 'We provide honest, unbiased reviews and comparisons to help businesses make informed decisions.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Community-Driven',
      description: 'Our platform thrives on real user experiences and feedback from actual car rental businesses.'
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Excellence',
      description: 'We maintain the highest standards in our research, analysis, and platform functionality.'
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Reliability',
      description: 'Businesses trust us to provide accurate, up-to-date information about software solutions.'
    }
  ]

  const stats = [
    { number: '500+', label: 'Software Solutions Reviewed' },
    { number: '10,000+', label: 'Happy Users' },
    { number: '50+', label: 'Countries Served' },
    { number: '155+', label: 'Years Combined Experience' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Car Rentall Software
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-4xl mx-auto">
              We're dedicated to helping car rental businesses find the perfect software solutions 
              through comprehensive reviews, comparisons, and industry insights.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                At Car Rentall Software, we believe that choosing the right car rental software shouldn't be overwhelming. 
                Our mission is to simplify this process by providing comprehensive, unbiased reviews and 
                comparisons of car rental and fleet management software solutions.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                We understand that every business has unique needs, whether you're a small startup or a 
                large enterprise. That's why we've created a platform where real users share their experiences, 
                helping you make informed decisions that drive your business forward.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
                  Unbiased Reviews
                </div>
                <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
                  Expert Analysis
                </div>
                <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full">
                  Community Driven
                </div>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg shadow-lg p-6">
                            <Image
                              src="/sys.png"
                              alt="Software comparison dashboard"
                              width={500}
                              height={350}
                              className="w-full h-auto rounded-lg"
                            />
                          </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Car Rentall Software by the Numbers
            </h2>
            <p className="text-lg text-gray-600">
              Our platform's growth reflects the trust businesses place in our services
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do at Car Rentall Software
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/*<section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600">
              Industry experts passionate about helping businesses succeed
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card p-6 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Photo</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {member.name}
                </h3>
                <div className="text-primary-600 font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>*/}

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-200 rounded-lg shadow-lg p-6">
                            <Image
                              src="/RentalSoftwareCollection.png"
                              alt="Software comparison dashboard"
                              width={500}
                              height={350}
                              className="w-full h-auto rounded-lg"
                            />
                          </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Car Rentall Software was born out of frustration. Our founder, Sarah Johnson, spent months trying to find 
                the right software solution for her car rental business, only to discover that reliable, 
                unbiased information was scattered across the internet.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                After experiencing the challenges firsthand, she realized that thousands of other business 
                owners were facing the same problem. That's when the idea for Car Rentall Software was born - a 
                centralized platform where real users could share honest experiences and help each other 
                make better decisions.
              </p>
              <p className="text-lg text-gray-600">
                Today, Car Rentall Software has grown into the leading resource for car rental software information, 
                serving businesses of all sizes across the globe. But our core mission remains the same: 
                to help you find the perfect software solution for your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-gray-600">
              Have questions or want to learn more about Car Rentall Software? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-gray-600">admin@carrentallsoftware.com</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-gray-600">+44 7939 274998</p>
            </div>
            
            <div className="card p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">34 Hillcroft Ave, Pinner HA5 5AR, United Kingdom</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  rows={5}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="text-center">
                <button type="submit" className="btn-primary px-8 py-3">
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Software?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join thousands of businesses who trust Car Rentall Software for their software decisions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/analyse" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              Start Comparing
            </a>
            <a href="/write-review" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200">
              Write a Review
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage