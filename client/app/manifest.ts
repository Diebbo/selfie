import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Selfie Calendar',
    short_name: 'Selfie',
    description: 'An app to improve students life',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
        {
            "src": "/adventurer1.png",
            "sizes": "512x512",
            "type": "image/png", 
            "purpose": "any"
        },
    ],
  }
}