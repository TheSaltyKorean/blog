export interface SiteConfig {
  title: string;
  tagline: string;
  description: string;
  url: string;
  favicon: string;
  ogImage: string;
  author: {
    name: string;
    bio: string;
    location: string;
    image: string;
    jobTitle: string;
    worksFor: string;
  };
  social: {
    twitter: string;
    github: string;
    instagram: string;
    linkedin: string;
    facebook: string;
  };
  socialUrls: {
    twitter: string;
    github: string;
    instagram: string;
    linkedin: string;
    facebook: string;
  };
  copyright: string;
}

export const siteConfig: SiteConfig = {
  title: 'Randy Walker',
  tagline: 'Technology leadership, career insights, and the business of innovation.',
  description:
    "Randy Walker's thoughts, stories and ideas on technology and building companies. Founder and CTO of SK Meridian LLC, former Microsoft MVP and ASP Insider.",
  url: 'https://thesaltykorean.com',
  favicon: '/favicon.svg',
  ogImage: '/assets/images/og-image.png',
  author: {
    name: 'Randy Walker',
    bio: 'Founder and CTO of SK Meridian LLC, former President of Harvest Data Corp, and former Microsoft MVP.',
    location: 'Austin, Texas',
    /*
     * Emitted as Person.image in the JSON-LD @graph on every page, so it must
     * resolve. /assets/images/authors/randy-walker.jpg was never in the Phase 0
     * migration manifest and public/assets/images/authors/ does not exist, so
     * the schema advertised a hard 404 sitewide — an image property Google
     * cannot fetch is worse than no image property. Pointed at the OG image,
     * which is a real asset, until an actual headshot is added; swap this for
     * a square portrait when one exists (Google prefers >=1200px, and a Person
     * image is what can surface in a knowledge panel).
     */
    image: '/assets/images/og-image.png',
    jobTitle: 'Founder and CTO',
    worksFor: 'SK Meridian LLC',
  },
  social: {
    twitter: 'TheSaltyKorean',
    github: 'TheSaltyKorean',
    instagram: 'thesaltykorean',
    linkedin: 'RandyWalker1',
    facebook: 'TheSaltyKorean',
  },
  socialUrls: {
    twitter: 'https://twitter.com/TheSaltyKorean',
    github: 'https://github.com/TheSaltyKorean',
    instagram: 'https://instagram.com/thesaltykorean',
    linkedin: 'https://www.linkedin.com/in/randywalker1/',
    facebook: 'https://www.facebook.com/TheSaltyKorean/',
  },
  copyright: '© 2026 Randy Walker. All rights reserved.',
};
