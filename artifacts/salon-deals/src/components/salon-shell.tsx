import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { Heart, Menu, Search, Sparkles, Store, Ticket, X } from 'lucide-react';

export function SalonShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const salonMode = location.startsWith('/salon');
  return (
    <div className="grain min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" data-testid="link-brand">
            <span className="grid h-9 w-9 place-items-center rounded-[13px] bg-primary text-primary-foreground shadow-sm"><Sparkles size={17} /></span>
            <span className="font-serif text-[21px] font-bold tracking-[-.04em]">goodroom</span>
          </Link>
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
        {menuOpen && <div className="border-t border-border bg-card px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            <Link href="/" onClick={() => setMenuOpen(false)} data-testid="mobile-link-discover">Discover deals</Link>
            <Link href="/wallet" onClick={() => setMenuOpen(false)} data-testid="mobile-link-wallet">My vouchers</Link>
            <Link href="/salon" onClick={() => setMenuOpen(false)} data-testid="mobile-link-salon">Salon console</Link>
          </div>
        </div>}
      </header>
      {children}
      <footer className="mx-auto mt-24 max-w-[1240px] border-t border-border px-5 py-10 lg:px-8">
        <div className="flex flex-col justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <span className="font-serif text-lg font-bold text-foreground">goodroom</span>
          <span>Good finds. Clear value. Local beauty.</span>
        </div>
      </footer>
    </div>
  );
}

export function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="flex h-12 flex-1 items-center gap-3 rounded-xl border border-border bg-card px-4 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
    <Search size={18} className="text-muted-foreground" />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Try “balayage”, “facial”..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" data-testid="input-search-deals" />
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