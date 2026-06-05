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
    "Randy Walker's thoughts, stories and ideas. President of Harvest Data Corp, Microsoft MVP award winner, ASP Insider and tech enthusiast.",
  url: 'https://thesaltykorean.com',
  favicon: '/favicon.svg',
  ogImage: '/assets/images/og-image.png',
  author: {
    name: 'Randy Walker',
    bio: 'Owner of SK Meridian LLC, former President of Harvest Data Corp, and former Microsoft MVP.',
    location: 'Bentonville, Arkansas',
    // TODO: /assets/images/authors/randy-walker.jpg was not in Phase 0 manifest — not migrated yet
    image: '/assets/images/authors/randy-walker.jpg',
    jobTitle: 'Owner',
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
