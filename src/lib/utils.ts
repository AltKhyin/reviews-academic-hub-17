
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSocialUrl(platform: string, username: string): string {
  if (!username) return '';
  
  switch (platform) {
    case 'linkedin':
      return `https://linkedin.com/in/${username}`;
    case 'youtube':
      return `https://youtube.com/@${username}`;
    case 'instagram':
      return `https://instagram.com/${username}`;
    case 'twitter':
      return `https://x.com/${username}`;
    default:
      return username;
  }
}
