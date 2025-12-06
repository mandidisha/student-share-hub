import { Link } from 'react-router-dom';
import { MapPin, Calendar, Heart, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Listing, ROOM_TYPES } from '@/types/database';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  showFavoriteButton?: boolean;
}

export function ListingCard({ listing, isFavorite, onToggleFavorite, showFavoriteButton = true }: ListingCardProps) {
  const roomTypeLabel = ROOM_TYPES.find(t => t.value === listing.room_type)?.label || listing.room_type;
  const imageUrl = listing.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';

  return (
    <Card className="group overflow-hidden rounded-3xl border-0 shadow-card hover-lift bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-4 left-4">
          <Badge className="bg-card/90 text-foreground backdrop-blur-sm border-0 rounded-full px-3 py-1 font-medium">
            {roomTypeLabel}
          </Badge>
        </div>
        
        {showFavoriteButton && onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-4 right-4 h-10 w-10 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card border-0 transition-all",
              isFavorite && "text-destructive bg-destructive/10"
            )}
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("h-5 w-5 transition-all", isFavorite && "fill-current scale-110")} />
          </Button>
        )}

        {/* Price tag - positioned on image */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="px-4 py-2 rounded-xl bg-card/90 backdrop-blur-sm">
            <span className="text-2xl font-display text-foreground">${listing.price}</span>
            <span className="text-sm text-muted-foreground">/mo</span>
          </div>
          <div className="p-2 rounded-full bg-primary text-primary-foreground">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-5">
        <Link to={`/listing/${listing.id}`}>
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-lg font-display text-primary whitespace-nowrap md:hidden">
                ${listing.price}<span className="text-sm font-sans text-muted-foreground">/mo</span>
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary">
                <MapPin className="h-3.5 w-3.5" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Available {format(new Date(listing.available_from), 'MMM d, yyyy')}</span>
            </div>
            
            {listing.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {listing.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-xs rounded-full font-normal">
                    {amenity}
                  </Badge>
                ))}
                {listing.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs rounded-full font-normal">
                    +{listing.amenities.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}