'use client'

import { motion, useMotionValue, animate } from 'framer-motion'
import { Twitter, Facebook, Linkedin, Instagram } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Company names for the carousel
const companies = ['RENTALL', 'AiRentoSoft', 'HQRental', 'RentCentric', 'Navotar']

const CarouselSection = () => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const [carouselWidth, setCarouselWidth] = useState(0)
  const x = useMotionValue(0)
  const controlsRef = useRef<any>(null)
  
  useEffect(() => {
    if (carouselRef.current) {
      const totalWidth = carouselRef.current.scrollWidth
      setCarouselWidth(totalWidth)
    }
  }, [])

  // Animate the carousel
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.stop()
    }
    
    controlsRef.current = animate(x, [0, -carouselWidth/2], {
      repeat: Infinity,
      duration: 40,
      ease: "linear",
    });
    
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop()
      }
    }
  }, [carouselWidth, x])

  return (
    <section className="w-full py-0" style={{ backgroundColor: '#c0c0c0' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="w-full overflow-hidden relative rounded-lg">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#c0c0c0] to-transparent z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#c0c0c0] to-transparent z-10"></div>
          
          <div className="overflow-hidden py-0">
            <motion.div 
              ref={carouselRef}
              className="flex"
              style={{ x }}
            >
              {[...companies, ...companies].map((company, index) => (
                <div 
                  className="carousel-item px-10 py-2 flex-shrink-0"
                  key={index}
                >
                  <div className="px-6 py-3 rounded-lg">
                    <span className="font-bold text-black text-xl">
                      {company}
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

const Footer = () => {
  return (
    <footer className="text-white" style={{ backgroundColor: '#0a1628' }}>
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Top section with CTA and Contact Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
          {/* Left side - CTA */}
          <div className="flex-1 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Looking For the Best Car Rental Software to grow your business?
            </h2>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-lg text-gray-300">
                Sign up now to get latest insights.
              </p>
              <a href="/about" className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors flex-shrink-0">
                <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right side - Contact columns */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-16">
            {/* Car Rental Software column */}
            <div className="min-w-[180px]">
              <h4 className="font-bold mb-4 text-sm tracking-wide">Car Rentall Software</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>34 Hillcroft Ave,</li>
                <li>Pinner HA5 5AR,</li>
                <li>United Kingdom.</li>
                <li className="mt-4">
                  Email Us at <a href="mailto:admin@carrentallsoftware.com" className="hover:text-white transition-colors underline">admin@carrentallsoftware.com</a>
                </li>
                <li className="mt-4">
                  Call Us at <a href="tel:+447939274998" className="hover:text-white transition-colors underline">+44 7939 274998</a>
                </li>
              </ul>
            </div>

            {/* FOR YOU column */}
            <div className="min-w-[180px]">
              <h4 className="font-bold mb-4 text-sm tracking-wide">FOR YOU</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/write-review" className="hover:text-white transition-colors">Write a Review</a>
                </li>
                <li>
                  <a href="/analyse" className="hover:text-white transition-colors">Analyse</a>
                </li>
                <li>
                  <a href="/blogs" className="hover:text-white transition-colors">Blog & research</a>
                </li>
              </ul>
            </div>

            {/* For vendors column */}
            <div className="min-w-[180px]">
              <h4 className="font-bold mb-4 text-sm tracking-wide">For vendors</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <a href="/login?redirect=/list-software" className="hover:text-white transition-colors">List Your Software</a>
                </li>
                <li>
                  <a href="/about" className="hover:text-white transition-colors">About Us</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Logo section */}
        <div className="mb-8">
          <a href="/" className="inline-block max-w-[200px]">
            <img
              src="/Car Rental Software Logo BGR.png"
              alt="logo"
              className="w-full h-auto object-contain rounded"
            />
          </a>
        </div>

        {/* Social icons section */}
        <div className="flex space-x-6 mb-12">
          <Twitter className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
          <Facebook className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
          <Linkedin className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
          <Instagram className="h-5 w-5 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
        </div>

        
        {/* Bottom copyright section */}
        <div className="pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-400 text-center">
            © 2025 Car Rentall Software. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main component that combines both sections
const PageWithCarouselAndFooter = () => {
  return (
    <>
      <CarouselSection />
      <Footer />
    </>
  )
}

export default PageWithCarouselAndFooter