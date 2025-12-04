import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Layout } from '@/components/layout/Layout';
import { ListingCard } from '@/components/listings/ListingCard';
import { ROOM_TYPES, AMENITIES } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { useListings } from '@/hooks/useListings';
import { useFavoriteIds, useToggleFavorite } from '@/hooks/useFavorites';
import { toast } from 'sonner';

export default function Listings() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [roomType, setRoomType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const { data: listings, isLoading } = useListings({
    search,
    roomType,
    sortBy,
    priceMin,
    priceMax,
    amenities: selectedAmenities,
  });

  const { data: favorites } = useFavoriteIds(user?.id);
  const toggleFavoriteMutation = useToggleFavorite();

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast.error('Please sign in to save favorites');
      return;
    }
    const isFavorite = favorites?.includes(listingId) || false;
    toggleFavoriteMutation.mutate({ userId: user.id, listingId, isFavorite });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(search ? { search } : {});
  };

  const clearFilters = () => {
    setSearch('');
    setRoomType('all');
    setPriceMin('');
    setPriceMax('');
    setSelectedAmenities([]);
    setSearchParams({});
  };

  const hasActiveFilters = search || roomType !== 'all' || priceMin || priceMax || selectedAmenities.length > 0;

  const getRoomTypeLabel = (value: string) => {
    return t(`roomTypes.${value}`);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">{t('listings.roomType')}</h3>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('listings.allTypes')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('listings.allTypes')}</SelectItem>
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {getRoomTypeLabel(type.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t('listings.priceRange')}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('listings.minPrice')}
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                  <Input
                    placeholder={t('listings.maxPrice')}
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">{t('listings.amenities')}</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAmenities([...selectedAmenities, amenity]);
                          } else {
                            setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                          }
                        }}
                      />
                      <Label htmlFor={amenity} className="text-sm cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  {t('listings.clearFilters')}
                </Button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('listings.searchPlaceholder')}
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button type="submit">{t('listings.search')}</Button>
              </form>

              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'newest' | 'price-low' | 'price-high')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t('listings.sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">{t('listings.newest')}</SelectItem>
                    <SelectItem value="price-low">{t('listings.priceLowHigh')}</SelectItem>
                    <SelectItem value="price-high">{t('listings.priceHighLow')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* Mobile Filters */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>{t('listings.filters')}</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-6 pt-6">
                      <div>
                        <h3 className="font-semibold mb-3">{t('listings.roomType')}</h3>
                        <Select value={roomType} onValueChange={setRoomType}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('listings.allTypes')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('listings.allTypes')}</SelectItem>
                            {ROOM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {getRoomTypeLabel(type.value)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">{t('listings.priceRange')}</h3>
                        <div className="flex gap-2">
                          <Input placeholder={t('listings.minPrice')} type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
                          <Input placeholder={t('listings.maxPrice')} type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
                        </div>
                      </div>
                      {hasActiveFilters && (
                        <Button variant="outline" className="w-full" onClick={clearFilters}>
                          {t('listings.clearFilters')}
                        </Button>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : listings && listings.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">{listings.length} listings found</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      isFavorite={favorites?.includes(listing.id)}
                      onToggleFavorite={() => toggleFavorite(listing.id)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">{t('listings.noListingsFound')}</h3>
                <p className="text-muted-foreground">{t('listings.tryAdjusting')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
