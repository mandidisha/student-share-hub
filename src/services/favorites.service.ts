import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/database';

export const favoritesService = {
  async getFavoriteIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map(f => f.listing_id);
  },

  async getFavoriteListings(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('listing_id, listings(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data.map((f: any) => f.listings) as Listing[];
  },

  async addFavorite(userId: string, listingId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, listing_id: listingId });
    if (error) throw error;
  },

  async removeFavorite(userId: string, listingId: string): Promise<void> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('listing_id', listingId);
    if (error) throw error;
  },

  async toggleFavorite(userId: string, listingId: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await this.removeFavorite(userId, listingId);
    } else {
      await this.addFavorite(userId, listingId);
    }
  },

  async checkIsFavorite(userId: string, listingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .maybeSingle();
    return !!data;
  },
};
