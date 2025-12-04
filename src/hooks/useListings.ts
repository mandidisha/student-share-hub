import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsService, ListingFilters, CreateListingData, UpdateListingData } from '@/services/listings.service';
import { storageService } from '@/services/storage.service';

export const useListings = (filters: ListingFilters = {}) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsService.getListings(filters),
  });
};

export const useListing = (id: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id],
    enabled: !!id,
    queryFn: () => listingsService.getListingById(id!),
  });
};

export const useUserListings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['my-listings', userId],
    enabled: !!userId,
    queryFn: () => listingsService.getUserListings(userId!),
  });
};

export const useUserOwnedListing = (id: string | undefined, userId: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id, userId],
    enabled: !!id && !!userId,
    queryFn: () => listingsService.getUserOwnedListing(id!, userId!),
  });
};

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, images }: { data: Omit<CreateListingData, 'images'>; images: File[] }) => {
      const imageUrls = await storageService.uploadMultipleListingImages(data.user_id, images);
      return listingsService.createListing({ ...data, images: imageUrls });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data, 
      newImages, 
      existingImages,
      userId 
    }: { 
      id: string; 
      data: UpdateListingData; 
      newImages: File[];
      existingImages: string[];
      userId: string;
    }) => {
      const uploadedUrls = await storageService.uploadMultipleListingImages(userId, newImages);
      const allImages = [...existingImages, ...uploadedUrls];
      return listingsService.updateListing(id, { ...data, images: allImages });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listing', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingsService.deleteListing(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

export const useToggleListingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      listingsService.toggleListingStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
  });
};
