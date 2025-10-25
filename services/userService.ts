import { supabase } from '../lib/supabase';
import { authService } from './authService';

export interface UserClass {
  class?: number;
}

export const userService = {
  async getUserClass(): Promise<number | null> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return null;
      }

      // First try to get from user metadata
      let userClass = user.user_metadata?.class;
      
      if (!userClass) {
        // Try to get from profiles table
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('class')
          .eq('id', user.id)
          .single();

        if (profileData && !error) {
          userClass = profileData.class;
        }
      }

      return userClass || null;
    } catch (error) {
      console.error('Error getting user class:', error);
      return null;
    }
  },

  async updateUserClass(classNumber: number): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return false;
      }

      // Update in auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { class: classNumber }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
      }

      // Update in profiles table (ensure required email field is present)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email ?? undefined,
          class: classNumber,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error updating profile:', profileError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user class:', error);
      return false;
    }
  }
}; 