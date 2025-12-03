import { Link } from 'react-router-dom';
import { MapPin, Calendar, Heart } from 'lucide-react';
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
    <Card className="group overflow-hidden shadow-card hover:shadow-soft transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 text-primary-foreground">
            {roomTypeLabel}
          </Badge>
        </div>
        {showFavoriteButton && onToggleFavorite && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-3 right-3 h-9 w-9 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card",
              isFavorite && "text-destructive"
            )}
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite();
            }}
          >
            <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
          </Button>
        )}
      </div>
      <CardContent className="p-4">
        <Link to={`/listing/${listing.id}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <p className="text-lg font-bold text-primary whitespace-nowrap">
                ${listing.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{listing.location}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span>Available {format(new Date(listing.available_from), 'MMM d, yyyy')}</span>
            </div>
            {listing.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {listing.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {listing.amenities.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
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
