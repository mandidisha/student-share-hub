import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useUpdateProfile } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { profileSchema } from '@/lib/validations';

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    phone: '',
    whatsapp: '',
    email_public: '',
  });

  const { data: profile } = useProfile(user?.id);
  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        whatsapp: profile.whatsapp || '',
        email_public: profile.email_public || '',
      });
    }
  }, [profile]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with zod
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    updateProfileMutation.mutate(
      {
        userId: user.id,
        data: {
          ...formData,
          avatar_url: profile?.avatar_url,
        },
        avatarFile: avatarFile || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('profile.profileUpdated'));
        },
        onError: (error: any) => {
          toast.error(error.message || t('profile.failedToUpdate'));
        },
      }
    );
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-display">{t('profile.title')}</CardTitle>
            <CardDescription>{t('profile.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || profile?.avatar_url || ''} />
                    <AvatarFallback className="text-2xl">
                      {formData.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">{t('profile.fullName')}</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                  {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <Label htmlFor="bio">{t('profile.bio')}</Label>
                  <Textarea
                    id="bio"
                    placeholder={t('profile.bioPlaceholder')}
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className={errors.bio ? 'border-destructive' : ''}
                  />
                  {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio}</p>}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t('profile.contactInfo')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('profile.contactInfoDesc')}
                </p>

                <div>
                  <Label htmlFor="email_public">{t('profile.publicEmail')}</Label>
                  <Input
                    id="email_public"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email_public}
                    onChange={(e) => setFormData({ ...formData, email_public: e.target.value })}
                    className={errors.email_public ? 'border-destructive' : ''}
                  />
                  {errors.email_public && <p className="text-sm text-destructive mt-1">{errors.email_public}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">{t('profile.phone')}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <Label htmlFor="whatsapp">{t('profile.whatsapp')}</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className={errors.whatsapp ? 'border-destructive' : ''}
                  />
                  {errors.whatsapp && <p className="text-sm text-destructive mt-1">{errors.whatsapp}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={updateProfileMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateProfileMutation.isPending ? t('profile.saving') : t('profile.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
