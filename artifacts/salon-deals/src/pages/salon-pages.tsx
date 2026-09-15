import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import { Archive, ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, CalendarCheck, Check, ChevronUp, Clock3, Copy, DollarSign, Gift, Heart, Info, MapPin, MoreHorizontal, Pause, Pencil, Play, Plus, Search, Scissors, ShieldCheck, SlidersHorizontal, Sparkles, Star, Ticket, TrendingUp, UsersRound, X } from 'lucide-react';
import { FavoriteButton, ModePill, SalonShell, SearchBox } from '@/components/salon-shell';
import { Deal, OfferType, Voucher, VoucherStatus, dealDateInputValue, dealEndAt, dealStartAt, getDealAvailability, loadLocal, saveLocal, seededDeals, seededVouchers } from '@/lib/salon-data';

const categories = ['All finds', 'Hair', 'Skin', 'Nails'];
const money = (n: number) => `$${n}`;
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));
const availabilityLabel: Record<ReturnType<typeof getDealAvailability>, string> = {
  scheduled: 'Starts soon',
  active: 'Live now',
  'sold-out': 'Sold out',
  expired: 'Ended',
  paused: 'Paused',
  archived: 'Archived',
};

function Countdown({ endsAt, compact = false }: { endsAt: string; compact?: boolean }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, new Date(endsAt).getTime() - Date.now()));
  useEffect(() => {
    const update = () => setRemaining(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);
  if (!remaining) return <span className={compact ? 'font-bold' : 'text-destructive'}>Ended</span>;
  const totalSeconds = Math.floor(remaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const value = days > 0
    ? `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`
    : `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return <span className={compact ? 'font-mono font-bold tabular-nums' : 'font-mono font-bold tabular-nums'}>{value}</span>;
}

function DealCard({ deal, favorite, toggle }: { deal: Deal; favorite: boolean; toggle: () => void }) {
  const soldPercent = Math.round((deal.purchasedCount / deal.capacity) * 100);
  const availability = getDealAvailability(deal);
  const soldOut = availability === 'sold-out';
  return <Link href={`/deal/${deal.id}`} className="deal-card group block overflow-hidden rounded-2xl border border-border bg-card" data-testid={`card-deal-${deal.id}`}>
    <div className="relative aspect-[1.28] overflow-hidden bg-muted">
      <img src={deal.image} alt="" className="deal-image h-full w-full object-cover" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-foreground">{deal.discountPercent}% off</span>
        <FavoriteButton id={deal.id} active={favorite} onClick={toggle} />
      </div>
        <div className={`absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-sm ${soldOut ? 'bg-destructive text-destructive-foreground' : 'bg-foreground/85 text-background'}`}><Clock3 size={12} /> {soldOut ? 'Sold out' : availability === 'scheduled' ? `Starts ${dateLabel(deal.startsAt)}` : <><span>Ends in</span> <Countdown endsAt={deal.endsAt} compact /></>}</div>
    </div>
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground"><span>{deal.category}</span><span className="flex items-center gap-1 normal-case tracking-normal text-foreground"><span className="text-accent">★</span> {deal.rating} <span className="font-normal text-muted-foreground">({deal.reviewCount})</span></span></div>
      <h3 className="line-clamp-2 font-serif text-[19px] font-bold leading-[1.1] tracking-[-.03em]">{deal.title}</h3>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={13} /> {deal.salonName} · {deal.city}</p>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div><span className="font-serif text-[22px] font-bold">{money(deal.dealPrice)}</span><span className="ml-2 text-xs text-muted-foreground line-through">{money(deal.originalPrice)}</span></div>
        <span className="text-xs font-bold text-primary">Save {money(deal.savings)}</span>
      </div>
       <div className="mt-3 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${soldOut ? 'bg-destructive' : 'bg-secondary'}`} style={{ width: `${Math.min(100, soldPercent)}%` }} /></div><span className={`text-[10px] font-medium ${soldOut ? 'text-destructive' : 'text-muted-foreground'}`}>{soldOut ? 'Sold out' : `${deal.capacity - deal.purchasedCount} left`}</span></div>
    </div>
  </Link>;
}

function DealSkeleton() {
  return <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="skeleton aspect-[1.28]" /><div className="space-y-3 p-5"><div className="skeleton h-3 w-1/3 rounded" /><div className="skeleton h-12 w-4/5 rounded" /><div className="skeleton h-3 w-1/2 rounded" /><div className="skeleton h-7 w-2/3 rounded" /></div></div>;
}

export function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All finds');
  const [favorites, setFavorites] = useState<string[]>(() => loadLocal('certxa-favorites', loadLocal('goodroom-favorites', ['lumen-facial'])));
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<'recommended' | 'price' | 'ending'>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const deals = loadLocal<Deal[]>('certxa-deals', seededDeals);
  const visibleDeals = deals.filter((deal) => ['active', 'scheduled', 'sold-out'].includes(getDealAvailability(deal)));
  const featuredDeal = visibleDeals.find((deal) => getDealAvailability(deal) === 'active') ?? visibleDeals[0] ?? seededDeals[0];
  const filtered = useMemo(() => {
    const matches = visibleDeals.filter((deal) => (category === 'All finds' || deal.category === category) && (!savedOnly || favorites.includes(deal.id)) && `${deal.title} ${deal.salonName} ${deal.city} ${deal.category}`.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price') return [...matches].sort((a, b) => a.dealPrice - b.dealPrice);
    if (sort === 'ending') return [...matches].sort((a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime());
    return matches;
  }, [category, favorites, savedOnly, search, sort, visibleDeals]);
  const toggle = (id: string) => { const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id]; setFavorites(next); saveLocal('certxa-favorites', next); };
  const chooseCategory = (next: string) => { setLoading(true); setCategory(next); window.setTimeout(() => setLoading(false), 240); };
  return <SalonShell><main>
    <section className="mx-auto max-w-[1240px] px-5 pb-10 pt-12 lg:px-8 lg:pt-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_410px] lg:items-end">
        <div className="rise-in">
          <p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><Sparkles size={14} /> Beauty finds, close to home</p>
          <h1 className="max-w-[720px] font-serif text-[clamp(3.4rem,8vw,6.7rem)] font-bold leading-[.88] tracking-[-.07em]">Good hair days<br /><em className="font-normal text-primary">start here.</em></h1>
          <p className="mt-7 max-w-[500px] text-base leading-relaxed text-muted-foreground">Exceptional salon services, clear prices, and a little nudge to try somewhere new. These neighborhood offers have a shelf life.</p>
        </div>
        <div className="relative hidden min-h-[210px] overflow-hidden rounded-[28px] bg-secondary p-7 lg:block rise-in delay-2">
          <div className="absolute -right-10 -top-14 h-56 w-56 rounded-full border-[26px] border-background/20" /><div className="absolute bottom-[-52px] right-12 h-44 w-44 rounded-full bg-accent/80" />
          <div className="relative z-10 flex h-full flex-col justify-between"><span className="font-mono text-[10px] uppercase tracking-[.2em]">The neighborhood edit / 04</span><p className="max-w-[220px] font-serif text-[30px] font-bold leading-none">Worth leaving the house for.</p><span className="text-xs font-semibold">Fresh offers, updated weekly →</span></div>
        </div>
      </div>
    </section>
    <section className="border-y border-border bg-card/55">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:px-8">
        <SearchBox value={search} onChange={setSearch} />
        <div className="flex gap-2 overflow-x-auto pb-1 lg:ml-2 lg:pb-0">{categories.map((item) => <button key={item} onClick={() => chooseCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-all ${category === item ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:border-foreground'}`} data-testid={`button-category-${item.toLowerCase().replace(' ', '-')}`}>{item}</button>)}<button onClick={() => setSavedOnly((visible) => !visible)} className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-all ${savedOnly ? 'border-secondary bg-secondary' : 'border-border bg-background hover:border-foreground'}`} aria-pressed={savedOnly} data-testid="button-saved-deals"><Heart size={14} fill={savedOnly ? 'currentColor' : 'none'} /> Saved{favorites.length ? ` · ${favorites.length}` : ''}</button><button onClick={() => setFiltersOpen((visible) => !visible)} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border bg-background ${filtersOpen ? 'border-foreground' : 'border-border'}`} aria-label="Filter deals" aria-expanded={filtersOpen} data-testid="button-filter-deals"><SlidersHorizontal size={15} /></button></div>
      </div>
      {filtersOpen && <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 border-t border-border px-5 py-3 lg:px-8" data-testid="deal-filters-panel"><p className="text-xs font-semibold text-muted-foreground">Sort these finds</p><div className="flex gap-2 overflow-x-auto">{([['recommended', 'Recommended'], ['price', 'Lowest price'], ['ending', 'Ending soon']] as const).map(([value, label]) => <button key={value} onClick={() => setSort(value)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${sort === value ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`} data-testid={`button-sort-${value}`}>{label}</button>)}</div></div>}
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pt-10 lg:px-8">
      <div className="relative overflow-hidden rounded-[26px] bg-secondary">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
           <img src={featuredDeal.image} alt="" className="h-56 w-full object-cover sm:h-72 lg:h-full lg:min-h-[290px]" />
          <div className="relative flex flex-col justify-center p-7 sm:p-10">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-foreground/65">Featured this week</span>
             <h2 className="mt-3 max-w-md font-serif text-4xl font-bold leading-[.92] tracking-[-.05em]">{featuredDeal.title}</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70">A little more light for your hair, with the kind of finish that makes plans feel worth making.</p>
             <Link href={`/deal/${featuredDeal.id}`} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-bold text-background transition-transform hover:-translate-y-0.5" data-testid="link-featured-deal">See the featured find <ArrowRight size={14} /></Link>
          </div>
        </div>
        <span className="absolute right-5 top-5 hidden rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] sm:block">40% off</span>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pb-6 pt-12 lg:px-8">
       <div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">{savedOnly ? 'Your shortlist' : 'Curated for you'}</p><h2 className="mt-2 font-serif text-3xl font-bold tracking-[-.04em]">{savedOnly ? 'Saved for later' : 'The good stuff, today'}</h2></div><span className="hidden text-xs text-muted-foreground sm:block">{filtered.length} finds in Brooklyn</span></div>
      {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><DealSkeleton /><DealSkeleton /><DealSkeleton /></div> : filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((deal, index) => <div key={deal.id} className={`rise-in delay-${Math.min(index + 1, 4)}`}><DealCard deal={deal} favorite={favorites.includes(deal.id)} toggle={() => toggle(deal.id)} /></div>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted"><Search size={20} /></div><h3 className="mt-4 font-serif text-2xl font-bold">No finds yet</h3><p className="mt-2 text-sm text-muted-foreground">Try another service, salon, or neighborhood.</p><button onClick={() => { setSearch(''); setCategory('All finds'); }} className="mt-5 text-sm font-bold text-primary underline underline-offset-4" data-testid="button-clear-filters">Clear filters</button></div>}
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pt-12 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] bg-primary px-7 py-10 text-primary-foreground sm:px-12 lg:flex lg:items-center lg:justify-between">
        <div className="absolute -right-8 -top-20 h-72 w-72 rounded-full border-[50px] border-secondary/30" /><div className="relative max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent">Why goodroom?</p><h2 className="mt-3 font-serif text-4xl font-bold leading-[.95] tracking-[-.05em] sm:text-5xl">A better way to say<br /><em className="font-normal">“I deserve this.”</em></h2><p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/75">We partner with the salons you already love—and the ones you’re about to. Every offer is real, local, and easy to use.</p></div>
        <div className="relative mt-8 grid grid-cols-2 gap-x-10 gap-y-6 text-sm lg:mt-0"><div><p className="font-serif text-3xl font-bold text-accent">100%</p><span className="text-primary-foreground/70">local salons</span></div><div><p className="font-serif text-3xl font-bold text-accent">1 tap</p><span className="text-primary-foreground/70">to your voucher</span></div><div><p className="font-serif text-3xl font-bold text-accent">zero</p><span className="text-primary-foreground/70">mystery pricing</span></div><div><p className="font-serif text-3xl font-bold text-accent">good</p><span className="text-primary-foreground/70">energy only</span></div></div>
      </div>
    </section>
  </main><ModePill /></SalonShell>;
}

function VoucherModal({ voucher, onClose }: { voucher: Voucher; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(voucher.code); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-sm" onClick={onClose}><div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between border-b border-border px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-primary">Your goodroom voucher</p><h2 className="mt-1 font-serif text-2xl font-bold">Ready when you are.</h2></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muted" aria-label="Close voucher" data-testid="button-close-voucher"><X size={16} /></button></div><div className="p-6"><div className="rounded-2xl bg-muted p-6 text-center"><div className="mx-auto mb-5 flex w-fit items-center justify-center rounded-xl bg-card p-4" data-testid="voucher-qr"><QRCodeSVG value={voucher.code} size={176} level="M" includeMargin bgColor="#ffffff" fgColor="#172039" title={`QR code for voucher ${voucher.code}`} /></div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-muted-foreground">Voucher number</p><p className="mt-2 font-mono text-xl font-bold tracking-[.18em]">{voucher.code}</p><p className="mt-2 text-xs text-muted-foreground">Show this code or QR at the salon.</p><button onClick={copy} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary" data-testid="button-copy-voucher">{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy code'}</button></div><div className="mt-5"><p className="font-semibold">{voucher.dealTitle}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={13} /> {voucher.salonName}</p><p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary"><CalendarDays size={14} /> Valid through {dateLabel(voucher.expiresAt)}</p></div></div></div></div>;
}

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [deal, setDeal] = useState<Deal>(() => loadLocal<Deal[]>('certxa-deals', seededDeals).find((item) => item.id === id) ?? seededDeals[0]);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(() => loadLocal('goodroom-favorites', []));
  const [purchasing, setPurchasing] = useState(false);
  const [showDealDetails, setShowDealDetails] = useState(true);
  const [showFinePrint, setShowFinePrint] = useState(false);
  const availability = getDealAvailability(deal);
  const remaining = Math.max(0, deal.capacity - deal.purchasedCount);
  const unavailable = availability !== 'active';
  const buy = () => {
    if (unavailable || quantity > remaining) return;
    setPurchasing(true);
    window.setTimeout(() => {
      const vouchers = loadLocal<Voucher[]>('goodroom-vouchers', seededVouchers);
      const voucher: Voucher = { id: `v-${Date.now()}`, dealId: deal.id, dealTitle: deal.title, salonName: deal.salonName, customerName: 'Mara Chen', purchaseDate: new Date().toISOString().slice(0, 10), expiresAt: deal.endsAt.slice(0, 10), code: `${deal.id.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 89 + 10)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`, status: 'active', qrSeed: Date.now().toString() };
      const deals = loadLocal<Deal[]>('certxa-deals', seededDeals);
      const updatedDeal = { ...deal, purchasedCount: Math.min(deal.capacity, deal.purchasedCount + quantity) };
      saveLocal('certxa-deals', deals.map((item) => item.id === deal.id ? updatedDeal : item));
      setDeal(updatedDeal);
      saveLocal('goodroom-vouchers', [voucher, ...vouchers]); setPurchasing(false); setLocation('/wallet');
    }, 600);
  };
  const toggleFavorite = () => {
    const next = favorites.includes(deal.id) ? favorites.filter((item) => item !== deal.id) : [...favorites, deal.id];
    setFavorites(next);
    saveLocal('goodroom-favorites', next);
  };
  return <SalonShell><main className="deal-detail-page mx-auto max-w-[1180px] px-5 pb-32 pt-6 sm:pt-8 lg:px-8 lg:pb-10 lg:pt-10">
    <div className="mb-6 flex items-center justify-between gap-4">
      <Link href="/" className="inline-flex items-center gap-2 rounded-full py-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" data-testid="link-back-discover"><ArrowLeft size={14} /> Back to all finds</Link>
      <span className="hidden items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground sm:flex"><ShieldCheck size={13} className="text-primary" /> Local offer, clear value</span>
    </div>
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.14fr)_minmax(350px,.86fr)] lg:items-start lg:gap-12">
      <div>
        <div className="group relative overflow-hidden rounded-[26px] bg-muted shadow-[var(--shadow-card)]"><img src={deal.image} alt="" className="aspect-[1.16] w-full object-cover transition-transform duration-700 group-hover:scale-[1.025] sm:aspect-[1.45] lg:aspect-[1.24]" /><div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-foreground/55 to-transparent" /><div className="absolute inset-x-4 top-4 flex items-start justify-between gap-3 sm:inset-x-5 sm:top-5"><span className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-accent-foreground">{deal.discountPercent}% off today</span><FavoriteButton id={deal.id} active={favorites.includes(deal.id)} onClick={toggleFavorite} /></div><div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-semibold text-background sm:bottom-5 sm:left-5"><MapPin size={14} /> {deal.salonName} · {deal.city}</div></div>
        <div className="mt-7 flex items-start justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">{deal.category} · {deal.city}</p><h1 className="mt-2 max-w-2xl font-serif text-[clamp(2.5rem,6vw,4.9rem)] font-bold leading-[.91] tracking-[-.06em]" data-testid="text-deal-title">{deal.title}</h1></div><FavoriteButton id={`${deal.id}-summary`} active={favorites.includes(deal.id)} onClick={toggleFavorite} /></div>
        <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span className="inline-flex items-center gap-1.5 font-semibold text-foreground"><Star size={15} className="fill-accent text-accent" /> {deal.rating}</span><span>from {deal.reviewCount} neighbors</span><span aria-hidden="true">·</span><span>{deal.salonName}</span></p>
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{deal.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Trust signals">
          <div className="rounded-xl border border-border bg-card px-3 py-3"><ShieldCheck size={16} className="text-primary" /><p className="mt-2 text-xs font-bold">Secure checkout</p><p className="mt-0.5 text-[11px] text-muted-foreground">No hidden fees</p></div>
          <div className="rounded-xl border border-border bg-card px-3 py-3"><Ticket size={16} className="text-primary" /><p className="mt-2 text-xs font-bold">Instant voucher</p><p className="mt-0.5 text-[11px] text-muted-foreground">Ready in your wallet</p></div>
          <div className="col-span-2 rounded-xl border border-border bg-card px-3 py-3 sm:col-span-1"><BadgeCheck size={16} className="text-primary" /><p className="mt-2 text-xs font-bold">Local favourite</p><p className="mt-0.5 text-[11px] text-muted-foreground">Trusted nearby salon</p></div>
        </div>
        <section className="mt-8 overflow-hidden rounded-2xl border border-primary/45 bg-card shadow-[var(--shadow-card)]" aria-labelledby="deal-details-heading">
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Offer details</p><h2 id="deal-details-heading" className="mt-2 font-serif text-2xl font-bold tracking-[-.03em]">What you’re getting</h2><p className="mt-2 text-sm text-muted-foreground">The service, clearly laid out before you buy.</p></div>
            <button onClick={() => setShowDealDetails((visible) => !visible)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40" aria-expanded={showDealDetails} aria-controls="deal-details-content" aria-label={showDealDetails ? 'Collapse deal details' : 'Expand deal details'} data-testid="button-toggle-deal-details"><ChevronUp size={17} className={`transition-transform duration-300 ${showDealDetails ? '' : 'rotate-180'}`} /></button>
          </div>
          {showDealDetails && <div id="deal-details-content" className="border-t border-border px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-3 pt-5 text-sm sm:grid-cols-3 sm:gap-4">
              <div className="flex items-start gap-3 rounded-xl bg-muted/70 p-3"><UsersRound size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="block font-semibold">For one person</strong><span className="text-xs text-muted-foreground">One voucher, one visit</span></p></div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/70 p-3"><CalendarDays size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="block font-semibold">Valid through {dateLabel(deal.endsAt)}</strong><span className="text-xs text-muted-foreground">Plenty of time to book</span></p></div>
              <div className="flex items-start gap-3 rounded-xl bg-muted/70 p-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="block font-semibold">Refundable for 3 days</strong><span className="text-xs text-muted-foreground">Unless otherwise stated</span></p></div>
            </div>
            <div className="my-5 border-t border-border" />
            <h3 className="text-base font-bold">What’s included</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {deal.highlights.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm text-foreground"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary"><Check size={13} /></span><span>{item}</span></li>)}
            </ul>
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="text-base font-bold">Before you buy</h3>
              <button onClick={() => setShowFinePrint((visible) => !visible)} className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" aria-expanded={showFinePrint} data-testid="button-before-you-buy">{showFinePrint ? 'Hide need-to-know info' : 'Need to know info'} <ArrowRight size={14} className={`transition-transform ${showFinePrint ? 'rotate-90' : ''}`} /></button>
              {showFinePrint && <p className="mt-3 rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">{deal.finePrint}</p>}
            </div>
          </div>}
        </section>
      </div>
       <aside className="lg:pt-20"><div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7"><div className="flex items-end justify-between border-b border-border pb-5"><div><span className="font-serif text-4xl font-bold">{money(deal.dealPrice)}</span><span className="ml-2 text-sm text-muted-foreground line-through">{money(deal.originalPrice)}</span></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">Save {money(deal.savings)}</span></div><div className="mt-5 flex items-center justify-between text-sm"><span className="text-muted-foreground">How many?</span><div className="flex items-center gap-3 rounded-full border border-border px-2 py-1"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={unavailable} className="grid h-6 w-6 place-items-center text-lg disabled:opacity-40" data-testid="button-quantity-minus">−</button><span className="w-5 text-center font-semibold" data-testid="text-quantity">{quantity}</span><button onClick={() => setQuantity(Math.min(4, remaining, quantity + 1))} disabled={unavailable || quantity >= remaining} className="grid h-6 w-6 place-items-center text-lg disabled:opacity-40" data-testid="button-quantity-plus">+</button></div></div><button onClick={buy} disabled={purchasing || unavailable} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60" data-testid="button-buy-deal">{purchasing ? 'Reserving your find…' : availability === 'sold-out' ? 'Sold out' : availability === 'scheduled' ? 'Not live yet' : availability === 'expired' ? 'Offer ended' : `Get this deal · ${money(deal.dealPrice * quantity)}`} {!purchasing && !unavailable && <ArrowRight size={16} />}</button><p className="mt-3 text-center text-[11px] text-muted-foreground">{availability === 'active' ? `${remaining} voucher${remaining === 1 ? '' : 's'} left · instant voucher` : `${availabilityLabel[availability]} · this offer cannot be purchased`}</p><div className="mt-7 rounded-xl bg-muted p-4"><div className="flex items-center gap-2 text-xs font-bold"><Clock3 size={14} className="text-primary" /> {availability === 'sold-out' ? 'All vouchers claimed' : 'This offer has a short shelf life'}</div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{deal.purchasedCount} neighbors already claimed it. Offer closes {dateLabel(deal.endsAt)} at 4:59 PM.</p><div className="mt-3 flex items-center justify-between rounded-lg bg-card px-3 py-2 text-xs"><span className="text-muted-foreground">Time remaining</span><Countdown endsAt={deal.endsAt} compact /></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card"><div className={`h-full rounded-full ${availability === 'sold-out' ? 'bg-destructive' : 'bg-secondary'}`} style={{ width: `${Math.min(100, Math.round(deal.purchasedCount / deal.capacity * 100))}%` }} /></div></div><div className="mt-5 flex items-start gap-3 text-xs text-muted-foreground"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" /><span>Pay securely and show your voucher at {deal.salonName}. Your voucher lives in your wallet.</span></div></div></aside>
    </div>
    <div className="fixed inset-x-3 bottom-[5.5rem] z-30 rounded-2xl border border-border bg-card/95 p-3 shadow-[var(--shadow-float)] backdrop-blur-xl md:hidden" data-testid="mobile-purchase-bar">
      <div className="flex items-center gap-3">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">From</p><p className="font-serif text-2xl font-bold leading-none">{money(deal.dealPrice * quantity)}</p></div>
        <button onClick={buy} disabled={purchasing} className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-wait disabled:opacity-60" data-testid="button-buy-deal-mobile">{purchasing ? 'Reserving…' : 'Get this deal'} {!purchasing && <ArrowRight size={15} />}</button>
      </div>
    </div>
  </main><ModePill /></SalonShell>;
}

function VoucherRow({ voucher, onView }: { voucher: Voucher; onView: () => void }) {
  const statusClass: Record<VoucherStatus, string> = { active: 'bg-secondary text-foreground', used: 'bg-muted text-muted-foreground', expired: 'bg-destructive/10 text-destructive' };
  return <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-primary"><Ticket size={19} /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{voucher.dealTitle}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${statusClass[voucher.status]}`}>{voucher.status}</span></div><p className="mt-1 text-xs text-muted-foreground">{voucher.salonName} · {voucher.status === 'active' ? `Valid through ${dateLabel(voucher.expiresAt)}` : `Purchased ${dateLabel(voucher.purchaseDate)}`}</p></div></div><button onClick={onView} disabled={voucher.status !== 'active'} className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40" data-testid={`button-view-voucher-${voucher.id}`}>{voucher.status === 'active' ? 'View voucher' : 'Unavailable'} <ArrowRight size={14} /></button></div>;
}

export function WalletPage() {
  const [tab, setTab] = useState<VoucherStatus | 'all'>('active');
  const [selected, setSelected] = useState<Voucher | null>(null);
  const vouchers = loadLocal<Voucher[]>('goodroom-vouchers', seededVouchers);
  const visible = vouchers.filter((voucher) => tab === 'all' || voucher.status === tab);
  return <SalonShell><main className="mx-auto max-w-[1000px] px-5 pb-8 pt-12 lg:px-8 lg:pt-20"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Mara’s wallet</p><h1 className="mt-2 font-serif text-5xl font-bold tracking-[-.06em]">Your good finds.</h1><p className="mt-3 text-sm text-muted-foreground">Everything you’ve saved for a better beauty day.</p></div><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary" data-testid="link-find-more">Find another deal <ArrowRight size={15} /></Link></div><div className="mt-10 flex gap-2 overflow-x-auto border-b border-border pb-0">{(['active', 'used', 'expired', 'all'] as const).map((item) => <button key={item} onClick={() => setTab(item)} className={`border-b-2 px-3 pb-3 text-xs font-bold capitalize transition-colors ${tab === item ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`} data-testid={`button-wallet-tab-${item}`}>{item === 'all' ? 'All vouchers' : item}</button>)}</div><div className="mt-6 space-y-3">{visible.length ? visible.map((voucher) => <VoucherRow key={voucher.id} voucher={voucher} onView={() => setSelected(voucher)} />) : <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center"><Ticket className="mx-auto text-muted-foreground" size={26} /><h2 className="mt-4 font-serif text-2xl font-bold">Nothing in this pocket</h2><p className="mt-2 text-sm text-muted-foreground">Your {tab} vouchers will show up here.</p><Link href="/" className="mt-5 inline-flex text-sm font-bold text-primary underline underline-offset-4" data-testid="link-wallet-empty-discover">Browse the edit</Link></div>}</div><div className="mt-8 flex items-start gap-3 rounded-2xl bg-muted p-5 text-xs text-muted-foreground"><ShieldCheck size={17} className="mt-0.5 shrink-0 text-primary" /><p>Keep your voucher handy when you arrive. The salon will scan or enter your code, then you’re good to go.</p></div></main>{selected && <VoucherModal voucher={selected} onClose={() => setSelected(null)} />}<ModePill /></SalonShell>;
}

type Redemption = { code: string; customer: string; service: string; time: string; status: 'Redeemed' | 'Pending' };
const initialRedemptions: Redemption[] = [
  { code: 'MOS-4D9-2QX', customer: 'Elena Ruiz', service: 'Sculpted gel manicure', time: 'Today, 10:42 AM', status: 'Redeemed' },
  { code: 'SAF-7K2-91M', customer: 'Mara Chen', service: 'Cut, gloss + finish', time: 'Yesterday, 4:15 PM', status: 'Pending' },
  { code: 'LUM-8P4-6TA', customer: 'Noah Williams', service: 'Lumen facial', time: 'Mon, 2:08 PM', status: 'Redeemed' },
];

type DealCreationDraft = {
  offerType: OfferType;
  title: string;
  category: string;
  city: string;
  serviceName: string;
  serviceDescription: string;
  regularPrice: string;
  customerPrice: string;
  giftCardValue: string;
  capacity: string;
  startsAt: string;
  endsAt: string;
  description: string;
  finePrint: string;
};

const offerTypeOptions: { type: OfferType; label: string; description: string; icon: ReactNode }[] = [
  { type: 'flat-rate', label: 'Flat-rate deal', description: 'A fixed service at a special price.', icon: <DollarSign size={18} /> },
  { type: 'cash-gift-card', label: 'Salon cash gift card', description: 'A dollar value customers can spend in your salon.', icon: <Gift size={18} /> },
  { type: 'service-gift-card', label: 'Prepaid service gift card', description: 'One specific service, honored no matter its price later.', icon: <Scissors size={18} /> },
  { type: 'bookable', label: 'Bookable deal', description: 'A deal that will connect to online booking.', icon: <CalendarCheck size={18} /> },
];

function dateInThirtyDays() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function emptyDealCreationDraft(): DealCreationDraft {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date();
  end.setDate(end.getDate() + 31);
  return {
    offerType: 'flat-rate',
    title: '',
    category: 'Hair',
    city: 'Brooklyn, NY',
    serviceName: '',
    serviceDescription: '',
    regularPrice: '120',
    customerPrice: '72',
    giftCardValue: '100',
    capacity: '30',
    startsAt: start.toISOString().slice(0, 10),
    endsAt: end.toISOString().slice(0, 10),
    description: '',
    finePrint: '',
  };
}

export function CreateDealPage() {
  const [, setLocation] = useLocation();
  const [draft, setDraft] = useState<DealCreationDraft>(emptyDealCreationDraft);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const update = (key: keyof DealCreationDraft, value: string | OfferType) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  };
  const selectedOffer = offerTypeOptions.find((option) => option.type === draft.offerType) ?? offerTypeOptions[0];
  const isServiceCard = draft.offerType === 'service-gift-card';
  const isCashCard = draft.offerType === 'cash-gift-card';
  const isBookable = draft.offerType === 'bookable';
  const fieldClass = 'h-12 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10';
  const moneyFieldClass = 'flex h-12 items-center rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10';

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const customerPrice = Number(draft.customerPrice);
    const regularPrice = Number(draft.regularPrice);
    const giftCardValue = Number(draft.giftCardValue);
    const capacity = Number(draft.capacity);
    if (!draft.title.trim() || !draft.city.trim()) return setError('Add an offer title and salon location to continue.');
    if (!customerPrice || customerPrice < 1 || !capacity || capacity < 1) return setError('Enter a valid customer price and voucher capacity.');
    if (!isServiceCard && (!regularPrice || regularPrice < 1)) return setError('Enter the regular price for this offer.');
    if (isCashCard && (!giftCardValue || giftCardValue < 1)) return setError('Enter the value customers can spend at your salon.');
    if ((isServiceCard || isBookable) && !draft.serviceName.trim()) return setError('Add the specific service included in this offer.');
    const startsAt = dealStartAt(draft.startsAt);
    const endsAt = dealEndAt(draft.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) return setError('Choose an end date after the start date.');

    const deals = loadLocal<Deal[]>('certxa-deals', seededDeals);
    const originalPrice = isCashCard ? giftCardValue : isServiceCard ? customerPrice : regularPrice;
    const discountPercent = originalPrice > customerPrice ? Math.max(1, Math.round((1 - customerPrice / originalPrice) * 100)) : 0;
    const image = draft.category === 'Skin' ? '/images/editorial-facial.jpg' : draft.category === 'Nails' ? '/images/editorial-nails.jpg' : '/images/editorial-hair.jpg';
    const id = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-deal'}-${Date.now()}`;
    const defaultDescription = isCashCard
      ? `A ${money(giftCardValue)} salon gift card to use toward any eligible service at ${draft.city.trim()}.`
      : isServiceCard
        ? `A prepaid ${draft.serviceName.trim()} gift card${draft.serviceDescription.trim() ? ` — ${draft.serviceDescription.trim()}` : ''}. The service will be honored even if its listed price changes before redemption.`
        : isBookable
          ? `A bookable ${draft.serviceName.trim() || 'salon experience'} from ${draft.city.trim()}. Online booking setup will be connected before launch.`
          : 'A limited-time salon offer made for a little more self-care in the week ahead.';
    const created: Deal = {
      id,
      title: draft.title.trim(),
      salonName: 'Saffron Studio',
      category: draft.category,
      city: draft.city.trim(),
      rating: 5,
      reviewCount: 0,
      image,
      originalPrice,
      dealPrice: customerPrice,
      discountPercent,
      savings: Math.max(0, originalPrice - customerPrice),
      purchasedCount: 0,
      capacity: Math.round(capacity),
       startsAt: startsAt.toISOString(),
       endsAt: endsAt.toISOString(),
      description: draft.description.trim() || defaultDescription,
      highlights: isCashCard
        ? [`${money(giftCardValue)} to spend at the salon`, 'Flexible across eligible services', 'Digital voucher delivered instantly']
        : isServiceCard
          ? [draft.serviceName.trim(), 'Honored regardless of future service pricing', 'Digital voucher delivered instantly']
          : isBookable
            ? [draft.serviceName.trim() || 'Specific salon service', 'Online booking connection coming soon', 'Digital voucher delivered instantly']
            : ['Personalized salon service', 'Thoughtful salon experience', 'Signature finish'],
      finePrint: draft.finePrint.trim() || (isBookable ? 'Online booking setup is coming soon. Customers will receive instructions when booking is enabled.' : 'Valid for one person. Please book directly with the salon after purchasing.'),
      status: 'active',
      offerType: draft.offerType,
      serviceName: draft.serviceName.trim() || undefined,
      giftCardValue: isCashCard ? giftCardValue : undefined,
    };
    saveLocal('certxa-deals', [created, ...deals]);
    setSubmitted(true);
  };

  if (submitted) {
    return <SalonShell><main className="mx-auto max-w-[920px] px-5 pb-20 pt-12 lg:px-8 lg:pt-20">
      <div className="rounded-[28px] border border-border bg-card p-8 text-center shadow-[var(--shadow-card)] sm:p-14">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-primary"><Check size={28} /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-primary">Deal created</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-[-.05em] sm:text-5xl">Your offer is ready.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">It has been saved to your salon console and is now visible in the marketplace preview.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={() => setLocation('/salon')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-view-salon-console">Back to salon console <ArrowRight size={15} /></button>
          <button onClick={() => { setDraft(emptyDealCreationDraft()); setSubmitted(false); }} className="rounded-xl border border-border px-5 py-3 text-xs font-bold transition-colors hover:border-foreground" data-testid="button-create-another-deal">Create another deal</button>
        </div>
      </div>
    </main><ModePill /></SalonShell>;
  }

  return <SalonShell><main className="mx-auto max-w-[1180px] px-5 pb-20 pt-8 lg:px-8 lg:pt-12">
    <Link href="/salon" className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground" data-testid="link-back-salon-console"><ArrowLeft size={14} /> Back to salon console</Link>
    <div className="mt-7 max-w-2xl">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><Sparkles size={14} /> New salon offer</p>
      <h1 className="mt-3 font-serif text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[.92] tracking-[-.065em]">Create a deal<br /><em className="font-normal text-primary">your way.</em></h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">Choose the offer format that fits your salon. You can fine-tune the details before publishing it to the marketplace.</p>
    </div>

    <form onSubmit={publish} className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-start">
      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7" aria-labelledby="offer-type-heading">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Step 1</p><h2 id="offer-type-heading" className="mt-2 font-serif text-2xl font-bold">What kind of offer is this?</h2><p className="mt-2 text-sm text-muted-foreground">Customers will see this framing before they purchase.</p></div>
          <fieldset className="mt-6 grid gap-3 sm:grid-cols-2">
            <legend className="sr-only">Offer type</legend>
            {offerTypeOptions.map((option) => <button type="button" key={option.type} onClick={() => update('offerType', option.type)} className={`relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${draft.offerType === option.type ? 'border-primary bg-primary/5 ring-2 ring-primary/15' : 'border-border bg-background hover:border-foreground'}`} aria-pressed={draft.offerType === option.type} data-testid={`button-offer-type-${option.type}`}>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${draft.offerType === option.type ? 'bg-primary text-primary-foreground' : 'bg-muted text-primary'}`}>{option.icon}</span>
              <span><strong className="block text-sm font-bold">{option.label}</strong><span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.description}</span></span>
              {draft.offerType === option.type && <Check size={15} className="absolute right-3 top-3 text-primary" />}
            </button>)}
          </fieldset>
          {isBookable && <div className="mt-5 flex items-start gap-3 rounded-xl bg-accent/35 p-4 text-xs leading-relaxed"><Info size={16} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-bold">Booking setup is coming next.</strong> This creates the deal placeholder now. Online booking onboarding and login will be connected before customers can schedule.</p></div>}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7" aria-labelledby="offer-details-heading">
          <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Step 2</p><h2 id="offer-details-heading" className="mt-2 font-serif text-2xl font-bold">Offer details</h2><p className="mt-2 text-sm text-muted-foreground">Write the version of this deal that customers should understand at a glance.</p></div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold">Offer title</span><input required value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder={isServiceCard ? 'Signature blowout gift card' : isBookable ? 'Book your next color refresh' : 'The Sunday reset: blowout + treatment'} className={fieldClass} data-testid="input-create-deal-title" /></label>
            <label><span className="mb-1.5 block text-xs font-bold">Category</span><select value={draft.category} onChange={(event) => update('category', event.target.value)} className={fieldClass} data-testid="select-create-deal-category"><option>Hair</option><option>Skin</option><option>Nails</option></select></label>
            <label><span className="mb-1.5 block text-xs font-bold">Neighborhood or city</span><input required value={draft.city} onChange={(event) => update('city', event.target.value)} className={fieldClass} data-testid="input-create-deal-city" /></label>
            {(isServiceCard || isBookable) && <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold">Specific service included</span><input required value={draft.serviceName} onChange={(event) => update('serviceName', event.target.value)} placeholder="60-minute signature facial" className={fieldClass} data-testid="input-create-deal-service" /><span className="mt-1.5 block text-[11px] text-muted-foreground">{isServiceCard ? 'This is the service the salon will honor, regardless of its price later.' : 'This is the service customers will eventually book online.'}</span></label>}
            {isCashCard && <label><span className="mb-1.5 block text-xs font-bold">Gift card value</span><div className={moneyFieldClass}><span className="text-sm text-muted-foreground">$</span><input required min="1" type="number" value={draft.giftCardValue} onChange={(event) => update('giftCardValue', event.target.value)} className="w-full bg-transparent pl-1 text-sm outline-none" data-testid="input-create-deal-gift-value" /></div></label>}
            {!isServiceCard && <label><span className="mb-1.5 block text-xs font-bold">Regular price</span><div className={moneyFieldClass}><span className="text-sm text-muted-foreground">$</span><input required min="1" type="number" value={draft.regularPrice} onChange={(event) => update('regularPrice', event.target.value)} className="w-full bg-transparent pl-1 text-sm outline-none" data-testid="input-create-deal-regular-price" /></div></label>}
            <label><span className="mb-1.5 block text-xs font-bold">{isCashCard ? 'Customer pays' : isServiceCard ? 'Gift card price' : 'Offer price'}</span><div className={moneyFieldClass}><span className="text-sm text-muted-foreground">$</span><input required min="1" type="number" value={draft.customerPrice} onChange={(event) => update('customerPrice', event.target.value)} className="w-full bg-transparent pl-1 text-sm outline-none" data-testid="input-create-deal-customer-price" /></div></label>
            <label><span className="mb-1.5 block text-xs font-bold">Available vouchers</span><input required min="1" type="number" value={draft.capacity} onChange={(event) => update('capacity', event.target.value)} className={fieldClass} data-testid="input-create-deal-capacity" /></label>
             <label><span className="mb-1.5 block text-xs font-bold">Offer starts</span><input required type="date" value={draft.startsAt} onChange={(event) => update('startsAt', event.target.value)} className={fieldClass} data-testid="input-create-deal-start-date" /><span className="mt-1.5 block text-[11px] text-muted-foreground">Goes live at 5:00 PM on this date.</span></label>
             <label><span className="mb-1.5 block text-xs font-bold">Offer ends</span><input required min={draft.startsAt} type="date" value={draft.endsAt} onChange={(event) => update('endsAt', event.target.value)} className={fieldClass} data-testid="input-create-deal-end-date" /><span className="mt-1.5 block text-[11px] text-muted-foreground">Closes at 4:59 PM on this date.</span></label>
            {isServiceCard && <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold">Service description <span className="font-normal text-muted-foreground">(optional)</span></span><textarea value={draft.serviceDescription} onChange={(event) => update('serviceDescription', event.target.value)} placeholder="What should customers know about the service?" rows={3} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="textarea-create-deal-service-description" /></label>}
            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold">Description <span className="font-normal text-muted-foreground">(optional)</span></span><textarea value={draft.description} onChange={(event) => update('description', event.target.value)} placeholder="Tell customers what makes this offer worth a visit." rows={4} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="textarea-create-deal-description" /></label>
            <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold">Fine print <span className="font-normal text-muted-foreground">(optional)</span></span><textarea value={draft.finePrint} onChange={(event) => update('finePrint', event.target.value)} placeholder="Redemption windows, new-client restrictions, or anything else customers should know." rows={3} className="w-full resize-none rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10" data-testid="textarea-create-deal-fine-print" /></label>
          </div>
        </section>
        {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-xs font-semibold text-destructive" role="alert" data-testid="status-create-deal-error">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/salon" className="inline-flex items-center justify-center rounded-xl px-5 py-3 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground" data-testid="button-cancel-create-page">Cancel</Link>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-publish-create-page">Publish deal <ArrowRight size={15} /></button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Your offer type</p>
          <div className="mt-4 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">{selectedOffer.icon}</span><div><h2 className="font-serif text-xl font-bold leading-tight">{selectedOffer.label}</h2><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{selectedOffer.description}</p></div></div>
          <div className="my-5 border-t border-border" />
          <p className="text-xs font-bold">Before you publish</p>
          <ul className="mt-4 space-y-3 text-xs text-muted-foreground">
            <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" /> Be clear about what the voucher includes.</li>
            <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" /> Set a capacity your team can comfortably honor.</li>
            <li className="flex items-start gap-2"><Check size={14} className="mt-0.5 shrink-0 text-primary" /> Keep redemption rules easy to understand.</li>
          </ul>
          {isBookable && <div className="mt-5 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground"><CalendarCheck size={16} className="mb-2 text-primary" /><p>Bookable deals are saved as placeholders for now. Online booking onboarding will be added later.</p></div>}
        </div>
      </aside>
    </form>
  </main><ModePill /></SalonShell>;
}

type DealDraft = { title: string; category: string; originalPrice: string; dealPrice: string; capacity: string; city: string; startsAt: string; endsAt: string };
const emptyDealDraft: DealDraft = { title: '', category: 'Hair', originalPrice: '120', dealPrice: '72', capacity: '30', city: 'Brooklyn, NY', startsAt: new Date().toISOString().slice(0, 10), endsAt: dateInThirtyDays() };

function CreateDealModal({ onClose, onCreate, deal }: { onClose: () => void; onCreate: (draft: DealDraft) => void; deal?: Deal }) {
  const [draft, setDraft] = useState<DealDraft>(() => deal ? { title: deal.title, category: deal.category, originalPrice: String(deal.originalPrice), dealPrice: String(deal.dealPrice), capacity: String(deal.capacity), city: deal.city, startsAt: dealDateInputValue(deal.startsAt), endsAt: dealDateInputValue(deal.endsAt) } : emptyDealDraft);
  const update = (key: keyof DealDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4 backdrop-blur-sm" onClick={onClose}>
    <form onSubmit={(event) => { event.preventDefault(); onCreate(draft); }} onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-8" data-testid="dialog-create-deal">
      <div className="flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-primary">{deal ? 'Edit offer' : 'New offer'}</p><h2 className="mt-1 font-serif text-3xl font-bold tracking-[-.04em]">{deal ? 'Keep it current.' : 'Fill a quiet chair.'}</h2><p className="mt-2 text-sm text-muted-foreground">{deal ? 'Update the details clients see in the marketplace.' : 'Publish a simple offer for nearby clients to discover.'}</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-muted" aria-label="Close create deal dialog" data-testid="button-close-create-deal"><X size={16} /></button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-bold">Offer title</span><input required value={draft.title} onChange={(event) => update('title', event.target.value)} placeholder="The Sunday reset: blowout + treatment" className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="input-new-deal-title" /></label>
        <label><span className="mb-1.5 block text-xs font-bold">Category</span><select value={draft.category} onChange={(event) => update('category', event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="select-new-deal-category"><option>Hair</option><option>Skin</option><option>Nails</option></select></label>
        <label><span className="mb-1.5 block text-xs font-bold">Neighborhood</span><input required value={draft.city} onChange={(event) => update('city', event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="input-new-deal-city" /></label>
        <label><span className="mb-1.5 block text-xs font-bold">Regular price</span><div className="flex h-11 items-center rounded-xl border border-border bg-background px-3"><span className="text-sm text-muted-foreground">$</span><input required min="1" type="number" value={draft.originalPrice} onChange={(event) => update('originalPrice', event.target.value)} className="w-full bg-transparent pl-1 text-sm outline-none" data-testid="input-new-deal-original-price" /></div></label>
        <label><span className="mb-1.5 block text-xs font-bold">Offer price</span><div className="flex h-11 items-center rounded-xl border border-border bg-background px-3"><span className="text-sm text-muted-foreground">$</span><input required min="1" type="number" value={draft.dealPrice} onChange={(event) => update('dealPrice', event.target.value)} className="w-full bg-transparent pl-1 text-sm outline-none" data-testid="input-new-deal-price" /></div></label>
        <label><span className="mb-1.5 block text-xs font-bold">Voucher capacity</span><input required min="1" type="number" value={draft.capacity} onChange={(event) => update('capacity', event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="input-new-deal-capacity" /></label>
         <label><span className="mb-1.5 block text-xs font-bold">Start date</span><input required type="date" value={draft.startsAt} onChange={(event) => update('startsAt', event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="input-new-deal-start-date" /><span className="mt-1 block text-[10px] text-muted-foreground">Starts at 5:00 PM</span></label>
         <label><span className="mb-1.5 block text-xs font-bold">End date</span><input required min={draft.startsAt} type="date" value={draft.endsAt} onChange={(event) => update('endsAt', event.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary" data-testid="input-new-deal-end-date" /><span className="mt-1 block text-[10px] text-muted-foreground">Ends at 4:59 PM</span></label>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-xs font-bold text-muted-foreground hover:text-foreground" data-testid="button-cancel-create-deal">Cancel</button><button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-publish-deal"><Pencil size={15} /> {deal ? 'Save changes' : 'Publish offer'}</button></div>
    </form>
  </div>;
}

export function SalonConsolePage() {
  const [lookup, setLookup] = useState('');
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [notice, setNotice] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deals, setDeals] = useState<Deal[]>(() => loadLocal('certxa-deals', seededDeals));
  const activeDeals = deals.filter((deal) => deal.status === 'active' || deal.status === 'paused');
  const lookupResult = redemptions.find((item) => item.code.toLowerCase() === lookup.trim().toLowerCase());
  const redeem = (code: string) => { setRedemptions((rows) => rows.map((row) => row.code === code ? { ...row, status: 'Redeemed' } : row)); setNotice(`Voucher ${code} marked redeemed.`); window.setTimeout(() => setNotice(''), 2400); };
  const createDeal = (draft: DealDraft) => {
    const originalPrice = Math.max(1, Number(draft.originalPrice));
    const dealPrice = Math.min(originalPrice, Math.max(1, Number(draft.dealPrice)));
    const capacity = Math.max(1, Number(draft.capacity));
    const discountPercent = Math.max(1, Math.round((1 - dealPrice / originalPrice) * 100));
     const image = draft.category === 'Skin' ? '/images/editorial-facial.jpg' : draft.category === 'Nails' ? '/images/editorial-nails.jpg' : '/images/editorial-hair.jpg';
    const id = `${draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'new-deal'}-${Date.now()}`;
     const startsAt = dealStartAt(draft.startsAt);
     const endsAt = dealEndAt(draft.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      setNotice('Choose an end date after the start date.');
      return;
    }
     const created: Deal = { id, title: draft.title.trim(), salonName: 'Saffron Studio', category: draft.category, city: draft.city.trim(), rating: 5, reviewCount: 0, image, originalPrice, dealPrice, discountPercent, savings: originalPrice - dealPrice, purchasedCount: 0, capacity, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), description: 'A limited-time offer from your local salon, made for a little more self-care in the week ahead.', highlights: ['Personalized service', 'Thoughtful salon experience', 'Signature finish'], finePrint: 'Valid for one person. Please book directly with the salon after purchasing.', status: 'active' };
    const next = [created, ...deals];
    setDeals(next);
    saveLocal('certxa-deals', next);
    setShowCreate(false);
    setNotice('Your new offer is live in the marketplace.');
    window.setTimeout(() => setNotice(''), 3000);
  };
  const updateDeal = (draft: DealDraft) => {
    if (!editingDeal) return;
    const originalPrice = Math.max(1, Number(draft.originalPrice));
    const dealPrice = Math.min(originalPrice, Math.max(1, Number(draft.dealPrice)));
    const capacity = Math.max(1, Number(draft.capacity));
    const image = draft.category === 'Skin' ? '/images/editorial-facial.jpg' : draft.category === 'Nails' ? '/images/editorial-nails.jpg' : '/images/editorial-hair.jpg';
     const startsAt = dealStartAt(draft.startsAt);
     const endsAt = dealEndAt(draft.endsAt);
    if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || startsAt >= endsAt) {
      setNotice('Choose an end date after the start date.');
      return;
    }
     const next = deals.map((deal) => deal.id === editingDeal.id ? { ...deal, title: draft.title.trim(), category: draft.category, city: draft.city.trim(), originalPrice, dealPrice, discountPercent: Math.max(1, Math.round((1 - dealPrice / originalPrice) * 100)), savings: originalPrice - dealPrice, capacity, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), image } : deal);
    setDeals(next);
    saveLocal('certxa-deals', next);
    setEditingDeal(null);
    setNotice('Your offer details are updated.');
    window.setTimeout(() => setNotice(''), 3000);
  };
  const changeDealStatus = (id: string, status: Deal['status']) => {
    const next = deals.map((deal) => deal.id === id ? { ...deal, status } : deal);
    setDeals(next);
    saveLocal('certxa-deals', next);
    setNotice(status === 'paused' ? 'Offer paused. It is hidden from customers.' : status === 'active' ? 'Offer is live again.' : 'Offer archived. Existing vouchers are unchanged.');
    window.setTimeout(() => setNotice(''), 3000);
  };
  return <SalonShell><main className="mx-auto max-w-[1240px] px-5 pb-8 pt-10 lg:px-8 lg:pt-16"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><StoreIcon /> Salon console</p><h1 className="mt-2 font-serif text-5xl font-bold tracking-[-.06em]">Good morning, Saffron.</h1><p className="mt-3 text-sm text-muted-foreground">A clear view of your offers and today’s chair-filling wins.</p></div><Link href="/salon/deals/new" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-create-deal"><Sparkles size={15} /> Create a new deal</Link></div>
    <section className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Deal revenue" value="$2,184" change="+18.4%" icon={<TrendingUp size={17} />} /><Metric label="Vouchers sold" value="149" change="+12 this week" icon={<Ticket size={17} />} /><Metric label="Redemption rate" value="72%" change="+6.2%" icon={<BadgeCheck size={17} />} /><Metric label="Quiet chairs filled" value="34" change="this month" icon={<CalendarDays size={17} />} /></section>
     <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><div><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Your live edit</p><h2 className="mt-1 font-serif text-2xl font-bold">Active deals</h2></div><button className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground" data-testid="button-manage-deals">Manage all <ArrowRight size={13} /></button></div><div className="space-y-3">{activeDeals.slice(0, 3).map((deal) => <div key={deal.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"><img src={deal.image} alt="" className="h-20 w-full rounded-xl object-cover sm:w-28" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><h3 className="truncate font-serif text-lg font-bold">{deal.title}</h3>{deal.status === 'paused' && <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-muted-foreground">Paused</span>}{['scheduled', 'sold-out', 'expired'].includes(getDealAvailability(deal)) && <span className="shrink-0 rounded-full bg-accent px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em]">{availabilityLabel[getDealAvailability(deal)]}</span>}</div><div className="flex shrink-0 items-center gap-1"><button onClick={() => setEditingDeal(deal)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label={`Edit ${deal.title}`} data-testid={`button-edit-deal-${deal.id}`}><Pencil size={14} /></button><button onClick={() => changeDealStatus(deal.id, deal.status === 'active' ? 'paused' : 'active')} className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label={deal.status === 'active' ? `Pause ${deal.title}` : `Resume ${deal.title}`}>{deal.status === 'active' ? <Pause size={14} /> : <Play size={14} />}</button><button onClick={() => changeDealStatus(deal.id, 'archived')} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label={`Archive ${deal.title}`} data-testid={`button-archive-deal-${deal.id}`}><Archive size={14} /></button></div></div><p className="mt-1 text-xs text-muted-foreground">{deal.purchasedCount} sold · {getDealAvailability(deal) === 'sold-out' ? 'Sold out' : `${deal.capacity - deal.purchasedCount} spots left`} · ends {dateLabel(deal.endsAt)} at 4:59 PM</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${deal.status === 'paused' ? 'bg-muted-foreground' : getDealAvailability(deal) === 'sold-out' ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(100, Math.round(deal.purchasedCount / deal.capacity * 100))}%` }} /></div></div><div className="text-right"><p className="font-serif text-xl font-bold">{money(deal.dealPrice)}</p><p className="text-[10px] text-muted-foreground">per voucher</p></div></div>)}</div></div>
      <div className="rounded-2xl bg-foreground p-6 text-background"><p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Fill the quiet hours</p><h2 className="mt-3 font-serif text-3xl font-bold leading-[.95]">Your next great regular is nearby.</h2><p className="mt-4 text-xs leading-relaxed text-background/65">Deals are a low-lift way to turn a quiet Tuesday into a first visit—and a first visit into a regular.</p><button className="mt-7 flex items-center gap-2 text-xs font-bold text-accent" data-testid="button-learn-deals">See how goodroom works <ArrowRight size={14} /></button></div></section>
    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Front desk</p><h2 className="mt-1 font-serif text-2xl font-bold">Redeem a voucher</h2></div></div><div className="grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm font-semibold">Enter the customer’s code</p><div className="mt-4 flex gap-2"><label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary"><Search size={16} className="text-muted-foreground" /><input value={lookup} onChange={(e) => setLookup(e.target.value.toUpperCase())} placeholder="SAF-7K2-91M" className="w-full bg-transparent font-mono text-sm uppercase outline-none placeholder:text-muted-foreground" data-testid="input-voucher-lookup" /></label><button onClick={() => setNotice(lookupResult ? 'Voucher found. Review details before redeeming.' : 'No voucher found. Check the code and try again.')} className="rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground" data-testid="button-lookup-voucher">Look up</button></div>{lookup && <div className={`mt-4 rounded-xl p-4 ${lookupResult ? 'bg-secondary' : 'bg-destructive/10'}`}>{lookupResult ? <><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em]">Voucher found</p><p className="mt-1 font-semibold">{lookupResult.service}</p><p className="mt-1 text-xs text-muted-foreground">{lookupResult.customer} · {lookupResult.code}</p></div><BadgeCheck size={20} /></div><button onClick={() => redeem(lookupResult.code)} disabled={lookupResult.status === 'Redeemed'} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-xs font-bold text-background disabled:opacity-50" data-testid="button-mark-redeemed">{lookupResult.status === 'Redeemed' ? <><Check size={14} /> Already redeemed</> : 'Mark as redeemed'}</button></> : <p className="text-xs font-semibold text-destructive">No voucher matched that code.</p>}</div>} {notice && <p className="mt-3 text-xs font-semibold text-primary" data-testid="status-redemption-notice">{notice}</p>}</div><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Recent redemptions</p><button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label="More redemption options" data-testid="button-more-redemptions"><MoreHorizontal size={16} /></button></div><div className="mt-4 divide-y divide-border">{redemptions.map((item) => <div key={item.code} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-xs font-semibold">{item.customer}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{item.service} · {item.time}</p></div><span className={`shrink-0 text-[10px] font-bold ${item.status === 'Redeemed' ? 'text-primary' : 'text-accent-foreground'}`}>{item.status}</span></div>)}</div></div></div></section>
   </main>{showCreate && <CreateDealModal onClose={() => setShowCreate(false)} onCreate={createDeal} />}{editingDeal && <CreateDealModal deal={editingDeal} onClose={() => setEditingDeal(null)} onCreate={updateDeal} />}<ModePill /></SalonShell>;
}

function StoreIcon() { return <span className="grid h-5 w-5 place-items-center rounded-md bg-primary text-primary-foreground"><StoreMini /></span>; }
function StoreMini() { return <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6.5h12M3 6.5v6h10v-6M4 3h8l1 3.5H3L4 3Z" /></svg>; }
function Metric({ label, value, change, icon }: { label: string; value: string; change: string; icon: ReactNode }) { return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">{icon}</span><span className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{change}</span></div><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-serif text-3xl font-bold tracking-[-.04em]">{value}</p></div>; }