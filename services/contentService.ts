import { userService } from './userService';

export interface ContentData {
  words: string[];
  sentences?: string[];
}

export const contentService = {
  async getClassContent(): Promise<ContentData | null> {
    try {
      const userClass = await userService.getUserClass();
      
      if (!userClass || userClass < 1 || userClass > 5) {
        console.log('No valid class found, using default content');
        return null;
      }

      // Return the class number so components can load their own data
      return {
        classNumber: userClass,
        words: [],
        sentences: []
      };
    } catch (error) {
      console.error('Error loading class content:', error);
      return null;
    }
  },

  async getUserClass(): Promise<number | null> {
    try {
      return await userService.getUserClass();
    } catch (error) {
      console.error('Error getting user class:', error);
      return null;
    }
  },

  getRandomItem(items: string[]): string {
    if (!items || items.length === 0) {
      return '';
    }
    return items[Math.floor(Math.random() * items.length)];
  },

  getRandomItems(items: string[], count: number): string[] {
    if (!items || items.length === 0) {
      return [];
    }
    
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }
}; 