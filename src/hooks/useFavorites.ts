import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService } from '@/services/favorites.service';

export const useFavoriteIds = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['favorites', userId],
    enabled: !!userId,
    queryFn: () => favoritesService.getFavoriteIds(userId!),
  });
};

export const useFavoriteListings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['favorite-listings', userId],
    enabled: !!userId,
    queryFn: () => favoritesService.getFavoriteListings(userId!),
  });
};

export const useIsFavorite = (userId: string | undefined, listingId: string | undefined) => {
  return useQuery({
    queryKey: ['favorite', listingId, userId],
    enabled: !!userId && !!listingId,
    queryFn: () => favoritesService.checkIsFavorite(userId!, listingId!),
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, listingId, isFavorite }: { userId: string; listingId: string; isFavorite: boolean }) =>
      favoritesService.toggleFavorite(userId, listingId, isFavorite),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-listings'] });
      queryClient.invalidateQueries({ queryKey: ['favorite', variables.listingId] });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, listingId }: { userId: string; listingId: string }) =>
      favoritesService.removeFavorite(userId, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-listings'] });
    },
  });
};
