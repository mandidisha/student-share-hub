import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useUserOwnedListing, useUpdateListing } from '@/hooks/useListings';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

export default function EditListing() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    address: '',
    room_type: 'single' as 'single' | 'shared' | 'studio' | 'apartment',
    available_from: '',
    available_until: '',
    amenities: [] as string[],
    house_rules: '',
    preferred_gender: 'any' as 'any' | 'male' | 'female',
    pets_allowed: false,
    smoking_allowed: false,
  });

  const { data: listing, isLoading } = useUserOwnedListing(id, user?.id);
  const updateListingMutation = useUpdateListing();

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description || '',
        price: listing.price.toString(),
        location: listing.location,
        address: listing.address || '',
        room_type: listing.room_type,
        available_from: listing.available_from,
        available_until: listing.available_until || '',
        amenities: listing.amenities,
        house_rules: listing.house_rules || '',
        preferred_gender: listing.preferred_gender || 'any',
        pets_allowed: listing.pets_allowed,
        smoking_allowed: listing.smoking_allowed,
      });
      setExistingImages(listing.images);
    }
  }, [listing]);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
          <p className="text-muted-foreground mb-6">You don't have access to this listing.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + newImages.length + existingImages.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }
    setNewImages([...newImages, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...previews]);
  };

  const removeExistingImage = (index: number) => {
    const newExisting = [...existingImages];
    newExisting.splice(index, 1);
    setExistingImages(newExisting);
  };

  const removeNewImage = (index: number) => {
    const newImgs = [...newImages];
    const newPreviews = [...newImagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newImgs.splice(index, 1);
    newPreviews.splice(index, 1);
    setNewImages(newImgs);
    setNewImagePreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateListingMutation.mutate(
      {
        id: id!,
        data: {
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
        newImages,
        existingImages,
        userId: user.id,
      },
      {
        onSuccess: () => {
          toast.success('Listing updated successfully!');
          navigate('/dashboard');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update listing');
        },
      }
    );
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <Layout>
      <div className="container max-w-3xl py-8">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Edit Listing</CardTitle>
            <CardDescription>Update your room listing details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Monthly Rent ($) *</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="room_type">Room Type *</Label>
                    <Select value={formData.room_type} onValueChange={(value: 'single' | 'shared' | 'studio' | 'apartment') => setFormData({ ...formData, room_type: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ROOM_TYPES.map((type) => (<SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="location">City/Area *</Label><Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required /></div>
                  <div><Label htmlFor="address">Address (optional)</Label><Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                </div>
                <div><Label htmlFor="description">Description</Label><Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Availability</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><Label htmlFor="available_from">Available From *</Label><Input id="available_from" type="date" value={formData.available_from} onChange={(e) => setFormData({ ...formData, available_from: e.target.value })} required /></div>
                  <div><Label htmlFor="available_until">Available Until (optional)</Label><Input id="available_until" type="date" value={formData.available_until} onChange={(e) => setFormData({ ...formData, available_until: e.target.value })} /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox id={`amenity-${amenity}`} checked={formData.amenities.includes(amenity)} onCheckedChange={(checked) => { if (checked) { setFormData({ ...formData, amenities: [...formData.amenities, amenity] }); } else { setFormData({ ...formData, amenities: formData.amenities.filter((a) => a !== amenity) }); } }} />
                      <Label htmlFor={`amenity-${amenity}`} className="text-sm cursor-pointer">{amenity}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Preferences & Rules</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Preferred Gender</Label>
                    <Select value={formData.preferred_gender} onValueChange={(value: 'any' | 'male' | 'female') => setFormData({ ...formData, preferred_gender: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 pt-6"><Checkbox id="pets_allowed" checked={formData.pets_allowed} onCheckedChange={(checked) => setFormData({ ...formData, pets_allowed: !!checked })} /><Label htmlFor="pets_allowed" className="cursor-pointer">Pets Allowed</Label></div>
                  <div className="flex items-center gap-2 pt-6"><Checkbox id="smoking_allowed" checked={formData.smoking_allowed} onCheckedChange={(checked) => setFormData({ ...formData, smoking_allowed: !!checked })} /><Label htmlFor="smoking_allowed" className="cursor-pointer">Smoking Allowed</Label></div>
                </div>
                <div><Label htmlFor="house_rules">Additional House Rules</Label><Textarea id="house_rules" rows={2} value={formData.house_rules} onChange={(e) => setFormData({ ...formData, house_rules: e.target.value })} /></div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Photos</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {existingImages.map((url, index) => (<div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden"><img src={url} alt="" className="w-full h-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeExistingImage(index)}><X className="h-4 w-4" /></Button></div>))}
                  {newImagePreviews.map((preview, index) => (<div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden"><img src={preview} alt="" className="w-full h-full object-cover" /><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeNewImage(index)}><X className="h-4 w-4" /></Button></div>))}
                  {totalImages < 10 && (<label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"><Upload className="h-6 w-6 text-muted-foreground" /><span className="text-xs text-muted-foreground mt-1">Add Photo</span><input type="file" accept="image/*" multiple className="hidden" onChange={handleNewImageChange} /></label>)}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1" disabled={updateListingMutation.isPending}>{updateListingMutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
