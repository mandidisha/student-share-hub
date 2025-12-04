import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesService, UpdateProfileData } from '@/services/profiles.service';
import { storageService } from '@/services/storage.service';

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: () => profilesService.getProfile(userId!),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      data, 
      avatarFile 
    }: { 
      userId: string; 
      data: UpdateProfileData; 
      avatarFile?: File;
    }) => {
      let avatar_url = data.avatar_url;
      
      if (avatarFile) {
        avatar_url = await storageService.uploadAvatar(userId, avatarFile);
      }

      return profilesService.updateProfile(userId, { ...data, avatar_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
