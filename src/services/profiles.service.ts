import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';

export interface UpdateProfileData {
  full_name?: string;
  bio?: string;
  phone?: string;
  whatsapp?: string;
  email_public?: string;
  avatar_url?: string;
}

export const profilesService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },

  async updateProfile(userId: string, data: UpdateProfileData): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);
    if (error) throw error;
  },
};
