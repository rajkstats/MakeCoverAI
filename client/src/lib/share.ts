import type { ShareConfig } from "@/types/share";

// Function to encode text for URLs
function encodeText(text: string): string {
  return encodeURIComponent(text);
}

// Generate sharing URLs for different platforms
export function generateShareUrl(platform: string, params: {
  url: string;
  title: string;
  description?: string;
  imageUrl?: string;
}): string {
  const { url, title, description, imageUrl } = params;
  
  switch (platform.toLowerCase()) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${encodeText(title)}&url=${encodeText(url)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeText(url)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeText(url)}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Configuration for different social media platforms
export const shareConfig: Record<string, ShareConfig> = {
  twitter: {
    name: 'Twitter',
    width: 550,
    height: 420,
    icon: 'TbBrandTwitter',
  },
  linkedin: {
    name: 'LinkedIn',
    width: 600,
    height: 600,
    icon: 'TbBrandLinkedin',
  },
  facebook: {
    name: 'Facebook',
    width: 670,
    height: 340,
    icon: 'TbBrandFacebook',
  },
};

// Open a popup window for social media sharing
export function openShareWindow(url: string, config: ShareConfig): void {
  const { width, height } = config;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  window.open(
    url,
    'share',
    `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
  );
}
