import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, PlusCircle, MessageCircle, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { LanguageToggle } from '@/components/LanguageToggle';

export function Header() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/listings', icon: Search, label: t('nav.browse') },
    ...(user ? [
      { to: '/create-listing', icon: PlusCircle, label: t('nav.postRoom') },
      { to: '/messages', icon: MessageCircle, label: t('nav.messages') },
      { to: '/dashboard', icon: User, label: t('nav.dashboard') },
    ] : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-display">{t('brand')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button variant="ghost" className="gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LanguageToggle />
          {user ? (
            <Button variant="ghost" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              {t('nav.signOut')}
            </Button>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost">{t('nav.signIn')}</Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button>{t('nav.getStarted')}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden border-t border-border bg-card overflow-hidden transition-all duration-200",
        mobileMenuOpen ? "max-h-96" : "max-h-0"
      )}>
        <nav className="container py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" onClick={() => { signOut(); setMobileMenuOpen(false); }} className="justify-start gap-2">
              <LogOut className="h-4 w-4" />
              {t('nav.signOut')}
            </Button>
          ) : (
            <>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">{t('nav.signIn')}</Button>
              </Link>
              <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">{t('nav.getStarted')}</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
