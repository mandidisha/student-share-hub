import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/database';

export interface ListingFilters {
  search?: string;
  roomType?: string;
  priceMin?: string;
  priceMax?: string;
  amenities?: string[];
  sortBy?: 'newest' | 'price-low' | 'price-high';
}

export interface CreateListingData {
  user_id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  address?: string;
  room_type: string;
  available_from: string;
  available_until?: string;
  amenities: string[];
  house_rules?: string;
  preferred_gender?: string;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  images: string[];
}

export interface UpdateListingData extends Partial<Omit<CreateListingData, 'user_id'>> {}

export const listingsService = {
  async getListings(filters: ListingFilters = {}): Promise<Listing[]> {
    let query = supabase
      .from('listings')
      .select('*')
      .eq('is_active', true);

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters.roomType && filters.roomType !== 'all') {
      query = query.eq('room_type', filters.roomType);
    }
    if (filters.priceMin) {
      query = query.gte('price', parseFloat(filters.priceMin));
    }
    if (filters.priceMax) {
      query = query.lte('price', parseFloat(filters.priceMax));
    }
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    if (filters.sortBy === 'newest' || !filters.sortBy) {
      query = query.order('created_at', { ascending: false });
    } else if (filters.sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (filters.sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Listing[];
  },

  async getListingById(id: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Listing | null;
  },

  async getUserListings(userId: string): Promise<Listing[]> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Listing[];
  },

  async getUserOwnedListing(id: string, userId: string): Promise<Listing | null> {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data as Listing | null;
  },

  async createListing(data: CreateListingData): Promise<Listing> {
    const { data: listing, error } = await supabase
      .from('listings')
      .insert({
        user_id: data.user_id,
        title: data.title,
        description: data.description || null,
        price: data.price,
        location: data.location,
        address: data.address || null,
        room_type: data.room_type,
        available_from: data.available_from,
        available_until: data.available_until || null,
        amenities: data.amenities,
        house_rules: data.house_rules || null,
        preferred_gender: data.preferred_gender,
        pets_allowed: data.pets_allowed,
        smoking_allowed: data.smoking_allowed,
        images: data.images,
      })
      .select()
      .single();
    if (error) throw error;
    return listing as Listing;
  },

  async updateListing(id: string, data: UpdateListingData): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({
        title: data.title,
        description: data.description,
        price: data.price,
        location: data.location,
        address: data.address,
        room_type: data.room_type,
        available_from: data.available_from,
        available_until: data.available_until,
        amenities: data.amenities,
        house_rules: data.house_rules,
        preferred_gender: data.preferred_gender,
        pets_allowed: data.pets_allowed,
        smoking_allowed: data.smoking_allowed,
        images: data.images,
      })
      .eq('id', id);
    if (error) throw error;
  },

  async deleteListing(id: string): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async toggleListingStatus(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('listings')
      .update({ is_active: !isActive })
      .eq('id', id);
    if (error) throw error;
  },
};
