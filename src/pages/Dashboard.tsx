import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Heart, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Layout } from '@/components/layout/Layout';
import { ListingCard } from '@/components/listings/ListingCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Listing, Profile } from '@/types/database';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: myListings } = useQuery({
    queryKey: ['my-listings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Listing[];
    },
  });

  const { data: favoriteListings } = useQuery({
    queryKey: ['favorite-listings', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id, listings(*)')
        .eq('user_id', user!.id);
      if (error) throw error;
      return data.map((f: any) => f.listings) as Listing[];
    },
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const toggleListingStatus = async (listingId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('listings')
      .update({ is_active: !isActive })
      .eq('id', listingId);

    if (error) {
      toast.error(t('dashboard.failedToUpdate'));
    } else {
      toast.success(isActive ? t('dashboard.listingDeactivated') : t('dashboard.listingActivated'));
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    }
  };

  const deleteListing = async (listingId: string) => {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      toast.error(t('dashboard.failedToDelete'));
    } else {
      toast.success(t('dashboard.listingDeleted'));
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    }
  };

  const removeFavorite = async (listingId: string) => {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId);

    if (error) {
      toast.error(t('dashboard.failedToRemove'));
    } else {
      queryClient.invalidateQueries({ queryKey: ['favorite-listings'] });
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <Card className="lg:col-span-1 h-fit shadow-soft">
            <CardContent className="pt-6">
              <div className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl">{profile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <Link to="/profile">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Settings className="h-4 w-4 mr-2" />
                    {t('dashboard.editProfile')}
                  </Button>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('dashboard.myListings')}</span>
                  <span className="font-medium">{myListings?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('dashboard.saved')}</span>
                  <span className="font-medium">{favoriteListings?.length || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="listings">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="listings">{t('dashboard.myListings')}</TabsTrigger>
                  <TabsTrigger value="favorites">{t('dashboard.saved')}</TabsTrigger>
                </TabsList>
                <Link to="/create-listing">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    {t('dashboard.postRoom')}
                  </Button>
                </Link>
              </div>

              <TabsContent value="listings">
                {myListings && myListings.length > 0 ? (
                  <div className="space-y-4">
                    {myListings.map((listing) => (
                      <Card key={listing.id} className="shadow-card">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={listing.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200&h=150&fit=crop'}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <Link to={`/listing/${listing.id}`} className="hover:text-primary">
                                    <h3 className="font-semibold truncate">{listing.title}</h3>
                                  </Link>
                                  <p className="text-sm text-muted-foreground">{listing.location}</p>
                                  <p className="text-lg font-bold text-primary">${listing.price}/mo</p>
                                </div>
                                <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                                  {listing.is_active ? t('dashboard.active') : t('dashboard.inactive')}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {t('dashboard.posted')} {format(new Date(listing.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Link to={`/edit-listing/${listing.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                {t('dashboard.edit')}
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleListingStatus(listing.id, listing.is_active)}
                            >
                              {listing.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-1" />
                                  {t('dashboard.deactivate')}
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t('dashboard.activate')}
                                </>
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t('dashboard.delete')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('dashboard.deleteListing')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('dashboard.deleteWarning')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('dashboard.cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteListing(listing.id)}>
                                    {t('dashboard.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-card">
                    <CardContent className="py-12 text-center">
                      <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('dashboard.noListingsYet')}</h3>
                      <p className="text-muted-foreground mb-4">{t('dashboard.noListingsDesc')}</p>
                      <Link to="/create-listing">
                        <Button>{t('dashboard.postYourRoom')}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="favorites">
                {favoriteListings && favoriteListings.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {favoriteListings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        listing={listing}
                        isFavorite={true}
                        onToggleFavorite={() => removeFavorite(listing.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="shadow-card">
                    <CardContent className="py-12 text-center">
                      <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('dashboard.noSavedListings')}</h3>
                      <p className="text-muted-foreground mb-4">{t('dashboard.noSavedDesc')}</p>
                      <Link to="/listings">
                        <Button>{t('dashboard.browseListings')}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
