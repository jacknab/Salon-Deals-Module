import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Menu, Search, Store, Ticket, X } from 'lucide-react';

export function SalonShell({ children, search, onSearch }: { children: ReactNode; search?: string; onSearch?: (value: string) => void }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const salonMode = location.startsWith('/salon');
  return (
    <div className="grain min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center gap-4 px-5 lg:gap-7 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand">
            <span className="font-serif text-[24px] font-normal tracking-[-.045em] text-[#2b2340]">Certxa.</span>
          </Link>
          {search !== undefined && onSearch && <div className="hidden min-w-0 flex-1 md:flex md:max-w-[280px]"><SearchBox value={search} onChange={onSearch} compact /></div>}
          <nav className="hidden items-center gap-7 text-[13px] font-semibold text-muted-foreground md:flex">
            <Link href="/" className={location === '/' ? 'text-foreground' : 'transition-colors hover:text-foreground'} data-testid="link-discover">Discover</Link>
            <Link href="/wallet" className={location === '/wallet' ? 'text-foreground' : 'transition-colors hover:text-foreground'} data-testid="link-wallet">My vouchers</Link>
            <Link href="/salon" className={salonMode ? 'text-foreground' : 'transition-colors hover:text-foreground'} data-testid="link-salon-mode">For salons</Link>
          </nav>
          <div className="flex items-center gap-2.5">
            <Link href="/wallet" className="hidden h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-semibold transition-transform hover:-translate-y-0.5 sm:flex" data-testid="link-header-wallet"><Ticket size={15} /> Wallet</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card md:hidden" aria-label="Open navigation" data-testid="button-menu">
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="hidden h-10 w-10 place-items-center rounded-full bg-secondary font-semibold text-foreground sm:grid" data-testid="avatar-mara">MC</span>
          </div>
        </div>
        {search !== undefined && onSearch && <div className="border-t border-border/70 px-5 py-3 md:hidden"><SearchBox value={search} onChange={onSearch} compact /></div>}
        {menuOpen && <div className="border-t border-border bg-card px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            <Link href="/" onClick={() => setMenuOpen(false)} data-testid="mobile-link-discover">Discover deals</Link>
            <Link href="/wallet" onClick={() => setMenuOpen(false)} data-testid="mobile-link-wallet">My vouchers</Link>
            <Link href="/salon" onClick={() => setMenuOpen(false)} data-testid="mobile-link-salon">Salon console</Link>
          </div>
        </div>}
      </header>
      {children}
      <footer className="mt-24 border-t border-border bg-card" data-testid="site-footer">
        <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-8 lg:py-14">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
            <div className="max-w-xs">
              <Link href="/" className="font-serif text-2xl font-normal tracking-[-.045em] text-[#2b2340]" data-testid="footer-brand">Certxa.</Link>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Good finds, clear value, and local beauty experiences worth making time for.</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-foreground">Discover</p>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <Link href="/" className="transition-colors hover:text-foreground" data-testid="footer-link-deals">Browse deals</Link>
                <Link href="/wallet" className="transition-colors hover:text-foreground" data-testid="footer-link-wallet">My vouchers</Link>
                <Link href="/?category=Nails" className="transition-colors hover:text-foreground" data-testid="footer-link-nails">Nail services</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-foreground">For salons</p>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <Link href="/salon" className="transition-colors hover:text-foreground" data-testid="footer-link-salon">Salon console</Link>
                <Link href="/salon/deals/new" className="transition-colors hover:text-foreground" data-testid="footer-link-create-deal">Create a deal</Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.16em] text-foreground">Need help?</p>
              <div className="mt-4 flex flex-col items-start gap-3 text-sm text-muted-foreground">
                <a href="mailto:hello@certxa.example" className="transition-colors hover:text-foreground" data-testid="footer-link-contact">Contact us</a>
                <span>Real offers from local salons</span>
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 Certxa. All rights reserved.</span>
            <span>Made for better beauty days.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function SearchBox({ value, onChange, compact = false }: { value: string; onChange: (value: string) => void; compact?: boolean }) {
  return <label className={`flex ${compact ? 'h-10 rounded-xl px-3' : 'min-h-14 rounded-2xl px-5'} flex-1 items-center gap-3 border border-border bg-card shadow-sm transition-shadow focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 focus-within:shadow-[var(--shadow-card)]`}>
    <Search size={compact ? 17 : 21} className="shrink-0 text-muted-foreground" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search services, salons, or neighborhoods" className={`${compact ? 'text-sm' : 'text-base'} w-full bg-transparent outline-none placeholder:text-muted-foreground`} data-testid="input-search-deals" />
  </label>;
}

export function FavoriteButton({ active, onClick, id }: { active: boolean; onClick: () => void; id: string }) {
  return <button onClick={(e) => { e.preventDefault(); onClick(); }} className={`grid h-9 w-9 place-items-center rounded-full border transition-all hover:scale-105 ${active ? 'border-secondary bg-secondary text-foreground' : 'border-border/70 bg-card/90 text-foreground'}`} aria-label={active ? 'Remove from favorites' : 'Add to favorites'} data-testid={`button-favorite-${id}`}><Heart size={16} fill={active ? 'currentColor' : 'none'} /></button>;
}

export function ModePill() {
  const [location] = useLocation();
  const salon = location.startsWith('/salon');
  return <Link href={salon ? '/' : '/salon'} className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-xs font-bold text-background shadow-xl transition-transform hover:-translate-y-1" data-testid="link-mode-switch">
    {salon ? <><Heart size={14} /> Switch to customer</> : <><Store size={14} /> Salon mode</>}
  </Link>;
}