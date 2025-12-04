import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { MapPin, Calendar, Check, X, MessageCircle, Mail, Phone, ExternalLink, ChevronLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useListing } from '@/hooks/useListings';
import { useProfile } from '@/hooks/useProfiles';
import { useIsFavorite, useToggleFavorite } from '@/hooks/useFavorites';
import { useHasConversation, useStartConversation } from '@/hooks/useConversations';
import { toast } from 'sonner';

export default function ListingDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const roomTypeLabels: Record<string, string> = {
    single: t('roomTypes.single'),
    shared: t('roomTypes.shared'),
    studio: t('roomTypes.studio'),
    apartment: t('roomTypes.apartment'),
  };

  const { data: listing, isLoading } = useListing(id);
  const { data: posterProfile } = useProfile(listing?.user_id);
  const { data: hasConversation } = useHasConversation(user?.id, listing?.user_id);
  const { data: isFavorite } = useIsFavorite(user?.id, id);
  
  const toggleFavoriteMutation = useToggleFavorite();
  const startConversationMutation = useStartConversation();

  const toggleFavorite = async () => {
    if (!user) { toast.error(t('listingDetail.signInToSave')); return; }
    toggleFavoriteMutation.mutate(
      { userId: user.id, listingId: id!, isFavorite: isFavorite || false },
      {
        onSuccess: () => {
          toast.success(isFavorite ? t('listingDetail.removedFromFavorites') : t('listingDetail.addedToFavorites'));
        },
      }
    );
  };

  const startConversation = async () => {
    if (!user) { toast.error(t('listingDetail.signInToMessage')); navigate('/auth'); return; }
    if (!listing) return;

    startConversationMutation.mutate(
      { userId: user.id, otherUserId: listing.user_id, listingId: listing.id },
      {
        onSuccess: (result) => {
          navigate(`/messages?conversation=${result.id}`);
        },
        onError: () => {
          toast.error(t('listingDetail.failedToStart'));
        },
      }
    );
  };

  if (isLoading) {
    return <Layout><div className="container py-8"><div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-1/4" /><div className="h-96 bg-muted rounded" /></div></div></Layout>;
  }

  if (!listing) {
    return <Layout><div className="container py-16 text-center"><h1 className="text-2xl font-bold mb-4">{t('listingDetail.listingNotFound')}</h1><p className="text-muted-foreground mb-6">{t('listingDetail.listingNotFoundDesc')}</p><Link to="/listings"><Button>{t('listingDetail.browseListings')}</Button></Link></div></Layout>;
  }

  const roomTypeLabel = roomTypeLabels[listing.room_type] || listing.room_type;
  const images = listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop'];

  return (
    <Layout>
      <div className="container py-8">
        <Link to="/listings" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"><ChevronLeft className="h-4 w-4 mr-1" />{t('listingDetail.backToListings')}</Link>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-2">
              <div className="aspect-video rounded-lg overflow-hidden"><img src={images[0]} alt={listing.title} className="w-full h-full object-cover" /></div>
              {images.length > 1 && (<div className="grid grid-cols-4 gap-2">{images.slice(1, 5).map((img, i) => (<div key={i} className="aspect-square rounded-lg overflow-hidden"><img src={img} alt={`${listing.title} ${i + 2}`} className="w-full h-full object-cover" /></div>))}</div>)}
            </div>
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <Badge className="mb-2">{roomTypeLabel}</Badge>
                  <h1 className="text-3xl font-bold font-display">{listing.title}</h1>
                  <div className="flex items-center gap-1 text-muted-foreground mt-2"><MapPin className="h-4 w-4" /><span>{listing.location}</span>{listing.address && <span className="text-sm">• {listing.address}</span>}</div>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleFavorite}><Heart className={`h-5 w-5 ${isFavorite ? 'fill-destructive text-destructive' : ''}`} /></Button>
              </div>
              <div className="flex items-baseline gap-2 mb-6"><span className="text-4xl font-bold text-primary">${listing.price}</span><span className="text-muted-foreground">{t('listingDetail.month')}</span></div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6"><div className="flex items-center gap-1"><Calendar className="h-4 w-4" /><span>{t('listingDetail.availableFrom')} {format(new Date(listing.available_from), 'MMM d, yyyy')}</span></div>{listing.available_until && (<span>{t('listingDetail.until')} {format(new Date(listing.available_until), 'MMM d, yyyy')}</span>)}</div>
              {listing.description && (<div className="prose prose-sm max-w-none mb-6"><h3 className="text-lg font-semibold mb-2">{t('listingDetail.description')}</h3><p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p></div>)}
              {listing.amenities.length > 0 && (<div className="mb-6"><h3 className="text-lg font-semibold mb-3">{t('listingDetail.amenities')}</h3><div className="flex flex-wrap gap-2">{listing.amenities.map((amenity) => (<Badge key={amenity} variant="secondary"><Check className="h-3 w-3 mr-1" />{amenity}</Badge>))}</div></div>)}
              <div className="mb-6"><h3 className="text-lg font-semibold mb-3">{t('listingDetail.houseRules')}</h3><div className="flex flex-wrap gap-4 text-sm"><div className="flex items-center gap-2">{listing.pets_allowed ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />}<span>{listing.pets_allowed ? t('listingDetail.petsAllowed') : t('listingDetail.petsNotAllowed')}</span></div><div className="flex items-center gap-2">{listing.smoking_allowed ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-destructive" />}<span>{listing.smoking_allowed ? t('listingDetail.smokingAllowed') : t('listingDetail.smokingNotAllowed')}</span></div>{listing.preferred_gender && listing.preferred_gender !== 'any' && (<div className="flex items-center gap-2"><span>{t('listingDetail.preferred')}: {listing.preferred_gender}</span></div>)}</div>{listing.house_rules && (<p className="text-sm text-muted-foreground mt-3">{listing.house_rules}</p>)}</div>
            </div>
          </div>
          <div className="space-y-6">
            <Card className="sticky top-24 shadow-soft">
              <CardHeader><CardTitle className="text-lg">{t('listingDetail.contact')}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {posterProfile && (<div className="flex items-center gap-3"><Avatar className="h-12 w-12"><AvatarImage src={posterProfile.avatar_url || ''} /><AvatarFallback>{posterProfile.full_name?.charAt(0) || 'U'}</AvatarFallback></Avatar><div><p className="font-medium">{posterProfile.full_name || 'User'}</p><p className="text-sm text-muted-foreground">{t('listingDetail.postedBy')}</p></div></div>)}
                <Separator />
                {user?.id !== listing.user_id && (<Button className="w-full" onClick={startConversation} disabled={startConversationMutation.isPending}><MessageCircle className="h-4 w-4 mr-2" />{t('listingDetail.sendMessage')}</Button>)}
                {/* Contact info only visible after starting conversation */}
                {(hasConversation || user?.id === listing.user_id) && posterProfile?.email_public && (<Button variant="outline" className="w-full" asChild><a href={`mailto:${posterProfile.email_public}`}><Mail className="h-4 w-4 mr-2" />{t('listingDetail.email')}</a></Button>)}
                {(hasConversation || user?.id === listing.user_id) && posterProfile?.phone && (<Button variant="outline" className="w-full" asChild><a href={`tel:${posterProfile.phone}`}><Phone className="h-4 w-4 mr-2" />{t('listingDetail.call')}</a></Button>)}
                {(hasConversation || user?.id === listing.user_id) && posterProfile?.whatsapp && (<Button variant="outline" className="w-full" asChild><a href={`https://wa.me/${posterProfile.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" />{t('listingDetail.whatsapp')}</a></Button>)}
                {!hasConversation && user?.id !== listing.user_id && (posterProfile?.email_public || posterProfile?.phone || posterProfile?.whatsapp) && (
                  <p className="text-xs text-muted-foreground text-center">{t('listingDetail.contactAfterMessage', 'Start a conversation to see contact details')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
