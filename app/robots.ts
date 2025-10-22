import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/logout',
          '/test',
          '/popup',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://www.carrentallsoftware.com/sitemap.xml',
  }
}