import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
      <footer className="border-t border-border bg-card py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('footer.copyright')}
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('footer.terms')}</a>
              <a href="#" className="hover:text-foreground transition-colors">{t('footer.contact')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
