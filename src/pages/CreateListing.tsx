import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Layout } from '@/components/layout/Layout';
import { ROOM_TYPES, AMENITIES } from '@/types/database';
import { useCreateListing } from '@/hooks/useListings';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { listingSchema } from '@/lib/validations';

export default function CreateListing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createListingMutation = useCreateListing();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    room_type: 'single' as const,
    available_from: '',
    available_until: '',
    amenities: [] as string[],
    house_rules: '',
    preferred_gender: 'any' as const,
    pets_allowed: false,
    smoking_allowed: false,
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error(t('createListing.maxImagesError'));
      return;
    }

    setImages([...images, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with zod
    const result = listingSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    createListingMutation.mutate(
      {
        data: {
          user_id: user.id,
          title: formData.title,
          description: formData.description || undefined,
          price: parseFloat(formData.price),
          location: formData.location,
          address: formData.address || undefined,
          room_type: formData.room_type,
          available_from: formData.available_from,
          available_until: formData.available_until || undefined,
          amenities: formData.amenities,
          house_rules: formData.house_rules || undefined,
          preferred_gender: formData.preferred_gender,
          pets_allowed: formData.pets_allowed,
          smoking_allowed: formData.smoking_allowed,
        },
        images,
      },
      {
        onSuccess: () => {
          toast.success(t('createListing.listingCreated'));
          navigate('/dashboard');
        },
        onError: (error: any) => {
          toast.error(error.message || t('createListing.failedToCreate'));
        },
      }
    );
  };

  const roomTypeLabels: Record<string, string> = {
    single: t('roomTypes.single'),
    shared: t('roomTypes.shared'),
    studio: t('roomTypes.studio'),
    apartment: t('roomTypes.apartment'),
  };

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-display">{t('createListing.title')}</CardTitle>
            <CardDescription>{t('createListing.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">{t('createListing.titleLabel')} *</Label>
                  <Input
                    id="title"
                    placeholder={t('createListing.titlePlaceholder')}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">{t('createListing.monthlyRent')} *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className={errors.price ? 'border-destructive' : ''}
                    />
                    {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
                  </div>
                  <div>
                    <Label htmlFor="room_type">{t('createListing.roomType')} *</Label>
                    <Select
                      value={formData.room_type}
                      onValueChange={(value: any) => setFormData({ ...formData, room_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {roomTypeLabels[type.value] || type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">{t('createListing.cityArea')} *</Label>
                    <Input
                      id="location"
                      placeholder={t('createListing.cityAreaPlaceholder')}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={errors.location ? 'border-destructive' : ''}
                    />
                    {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
                  </div>
                  <div>
                    <Label htmlFor="address">{t('createListing.address')}</Label>
                    <Input
                      id="address"
                      placeholder={t('createListing.addressPlaceholder')}
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t('createListing.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('createListing.descriptionPlaceholder')}
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t('createListing.availability')}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="available_from">{t('createListing.availableFrom')} *</Label>
                    <Input
                      id="available_from"
                      type="date"
                      value={formData.available_from}
                      onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                      className={errors.available_from ? 'border-destructive' : ''}
                    />
                    {errors.available_from && <p className="text-sm text-destructive mt-1">{errors.available_from}</p>}
                  </div>
                  <div>
                    <Label htmlFor="available_until">{t('createListing.availableUntil')}</Label>
                    <Input
                      id="available_until"
                      type="date"
                      value={formData.available_until}
                      onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t('createListing.amenities')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={`amenity-${amenity}`}
                        checked={formData.amenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
                          } else {
                            setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== amenity) });
                          }
                        }}
                      />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* House Rules */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t('createListing.preferencesRules')}</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>{t('createListing.preferredGender')}</Label>
                    <Select
                      value={formData.preferred_gender}
                      onValueChange={(value: any) => setFormData({ ...formData, preferred_gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">{t('createListing.genderAny')}</SelectItem>
                        <SelectItem value="male">{t('createListing.genderMale')}</SelectItem>
                        <SelectItem value="female">{t('createListing.genderFemale')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Checkbox
                      id="pets_allowed"
                      checked={formData.pets_allowed}
                      onCheckedChange={(checked) => setFormData({ ...formData, pets_allowed: !!checked })}
                    />
                    <Label htmlFor="pets_allowed" className="cursor-pointer">{t('createListing.petsAllowed')}</Label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Checkbox
                      id="smoking_allowed"
                      checked={formData.smoking_allowed}
                      onCheckedChange={(checked) => setFormData({ ...formData, smoking_allowed: !!checked })}
                    />
                    <Label htmlFor="smoking_allowed" className="cursor-pointer">{t('createListing.smokingAllowed')}</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="house_rules">{t('createListing.additionalRules')}</Label>
                  <Textarea
                    id="house_rules"
                    placeholder={t('createListing.rulesPlaceholder')}
                    rows={2}
                    value={formData.house_rules}
                    onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })}
                  />
                </div>
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="font-semibold">{t('createListing.photos')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                      <img src={preview} alt="" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {images.length < 10 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">{t('createListing.addPhoto')}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{t('createListing.photosHint')}</p>
              </div>

              <Button type="submit" className="w-full" disabled={createListingMutation.isPending}>
                {createListingMutation.isPending ? t('createListing.creating') : t('createListing.postListing')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
