import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, MessageCircle, Home, ArrowRight, Sparkles, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ListingCard } from '@/components/listings/ListingCard';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/database';

const Index = () => {
  const { t } = useTranslation();

  const { data: featuredListings, isLoading } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data as Listing[];
    },
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 md:py-36 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 pattern-dots opacity-50" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-[10%] w-24 h-24 rounded-full bg-primary/10 blur-2xl animate-float" />
        <div className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full bg-accent/10 blur-2xl animate-float-delayed" />
        <div className="absolute top-1/2 right-[5%] w-16 h-16 rounded-full bg-warning/10 blur-xl animate-pulse-soft" />
        
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-slide-up">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{t('home.tagline', 'Student housing made simple')}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-normal tracking-tight mb-6 animate-slide-up">
              {t('home.heroTitle').split(' ').slice(0, -1).join(' ')}{' '}
              <span className="text-gradient-warm">{t('home.heroTitle').split(' ').slice(-1)}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up-delayed">
              {t('home.heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delayed">
              <Link to="/listings">
                <Button size="lg" className="w-full sm:w-auto gap-2 px-8 h-14 text-base rounded-2xl shadow-glow hover:shadow-elevated transition-all">
                  <Search className="h-5 w-5" />
                  {t('home.browseListings')}
                </Button>
              </Link>
              <Link to="/create-listing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-8 h-14 text-base rounded-2xl border-2 hover:bg-secondary transition-all">
                  {t('home.postYourRoom')}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl font-display text-foreground">100+</div>
                <div className="text-sm text-muted-foreground">{t('home.statsListings', 'Listings')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-foreground">50+</div>
                <div className="text-sm text-muted-foreground">{t('home.statsCities', 'Cities')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-display text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">{t('home.statsStudents', 'Students')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display mb-4">{t('home.howItWorks')}</h2>
            <p className="text-muted-foreground max-w-md mx-auto">{t('home.howItWorksDesc', 'Three simple steps to find your perfect room')}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Search, title: t('home.step1Title'), desc: t('home.step1Desc'), color: 'primary' },
              { icon: MessageCircle, title: t('home.step2Title'), desc: t('home.step2Desc'), color: 'accent' },
              { icon: Home, title: t('home.step3Title'), desc: t('home.step3Desc'), color: 'warning' }
            ].map((step, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-3xl bg-card border border-border hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className={`w-16 h-16 rounded-2xl bg-${step.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className={`h-8 w-8 text-${step.color}`} />
                </div>
                <h3 className="text-xl font-display mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm mb-4">
                <MapPin className="h-3.5 w-3.5" />
                {t('home.nearYou', 'Near you')}
              </div>
              <h2 className="text-3xl md:text-4xl font-display">{t('home.featuredListings')}</h2>
            </div>
            <Link to="/listings">
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                {t('home.viewAllListings')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-3xl shimmer" />
              ))}
            </div>
          ) : featuredListings && featuredListings.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredListings.map((listing, index) => (
                <div key={listing.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <ListingCard listing={listing} showFavoriteButton={false} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-3xl bg-card border border-border">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t('home.noListingsYet')}</p>
              <Link to="/create-listing" className="inline-block mt-4">
                <Button variant="outline">{t('home.postFirstListing', 'Post the first listing')}</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-[2rem] bg-card border border-border shadow-elevated">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">{t('home.ctaSubtitle')}</p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="px-10 h-14 text-base rounded-2xl shadow-glow hover:shadow-elevated transition-all">
                {t('nav.getStarted')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;