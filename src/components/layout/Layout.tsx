import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Home, Heart } from 'lucide-react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Home className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-display">StudentStay</span>
              </Link>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t('footer.description', 'Connecting students with affordable housing near their universities.')}
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-12">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-foreground">{t('footer.platform', 'Platform')}</span>
                <Link to="/listings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('nav.browse')}
                </Link>
                <Link to="/create-listing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('home.postYourRoom')}
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-foreground">{t('footer.legal', 'Legal')}</span>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.privacy')}
                </a>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('footer.terms')}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              {t('footer.madeWith', 'Made with')} <Heart className="h-3.5 w-3.5 text-destructive fill-current" /> {t('footer.forStudents', 'for students')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}