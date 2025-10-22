import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/client'
import { blogPosts } from '@/lib/blogData'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.carrentallsoftware.com'
  
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/analyse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/write-review`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/list-software`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic blog routes
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blogs/${post.id}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.8 : 0.6,
  }))

  // Dynamic software routes - fetch from Supabase
  let softwareRoutes: MetadataRoute.Sitemap = []
  
  try {
    const supabase = createClient()
    
    // Fetch all software from the database
    const { data: softwareData, error } = await supabase
      .from('Software')
      .select('name, updated_at')
    
    if (softwareData && !error) {
      // Type the software data
      const typedSoftwareData = softwareData as Array<{
        name: string
        updated_at?: string
      }>

      softwareRoutes = typedSoftwareData.map((software) => ({
        url: `${baseUrl}/software/${encodeURIComponent(software.name)}`,
        lastModified: software.updated_at ? new Date(software.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      // Also add product routes (seems to be an alternative route structure)
      const productRoutes: MetadataRoute.Sitemap = typedSoftwareData.map((software) => ({
        url: `${baseUrl}/product/${encodeURIComponent(software.name)}`,
        lastModified: software.updated_at ? new Date(software.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))

      // Add review routes for each software
      const reviewRoutes: MetadataRoute.Sitemap = typedSoftwareData.map((software) => ({
        url: `${baseUrl}/review/${encodeURIComponent(software.name)}`,
        lastModified: software.updated_at ? new Date(software.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))

      softwareRoutes = [...softwareRoutes, ...productRoutes, ...reviewRoutes]
    }
  } catch (error) {
    console.error('Error fetching software data for sitemap:', error)
    // If database is unavailable, add some common software names as fallback
    const fallbackSoftware = ['AiRentoSoft', 'RENTALL', 'FleetWave', 'RentWorks']
    
    softwareRoutes = fallbackSoftware.flatMap((name) => [
      {
        url: `${baseUrl}/software/${encodeURIComponent(name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/product/${encodeURIComponent(name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      },
      {
        url: `${baseUrl}/review/${encodeURIComponent(name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
    ])
  }

  return [...staticRoutes, ...blogRoutes, ...softwareRoutes]
}