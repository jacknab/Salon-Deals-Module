import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useParams } from 'wouter';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronUp, Clock3, Copy, Info, MapPin, MoreHorizontal, Pencil, Search, ShieldCheck, SlidersHorizontal, Sparkles, Ticket, TrendingUp, UsersRound, X } from 'lucide-react';
import { FavoriteButton, ModePill, SalonShell, SearchBox } from '@/components/salon-shell';
import { Deal, Voucher, VoucherStatus, loadLocal, saveLocal, seededDeals, seededVouchers } from '@/lib/salon-data';

const categories = ['All finds', 'Hair', 'Skin', 'Nails'];
const money = (n: number) => `$${n}`;
const dateLabel = (date: string) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(date));

function DealCard({ deal, favorite, toggle }: { deal: Deal; favorite: boolean; toggle: () => void }) {
  const soldPercent = Math.round((deal.purchasedCount / deal.capacity) * 100);
  return <Link href={`/deal/${deal.id}`} className="deal-card group block overflow-hidden rounded-2xl border border-border bg-card" data-testid={`card-deal-${deal.id}`}>
    <div className="relative aspect-[1.28] overflow-hidden bg-muted">
      <img src={deal.image} alt="" className="deal-image h-full w-full object-cover" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] text-foreground">{deal.discountPercent}% off</span>
        <FavoriteButton id={deal.id} active={favorite} onClick={toggle} />
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-foreground/85 px-2.5 py-1 text-[10px] font-semibold text-background backdrop-blur-sm"><Clock3 size={12} /> Ends soon</div>
    </div>
    <div className="p-4 sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground"><span>{deal.category}</span><span className="flex items-center gap-1 normal-case tracking-normal text-foreground"><span className="text-accent">★</span> {deal.rating} <span className="font-normal text-muted-foreground">({deal.reviewCount})</span></span></div>
      <h3 className="line-clamp-2 font-serif text-[21px] font-bold leading-[1.1] tracking-[-.03em]">{deal.title}</h3>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={13} /> {deal.salonName} · {deal.city}</p>
      <div className="mt-5 flex items-end justify-between gap-2">
        <div><span className="font-serif text-2xl font-bold">{money(deal.dealPrice)}</span><span className="ml-2 text-xs text-muted-foreground line-through">{money(deal.originalPrice)}</span></div>
        <span className="text-xs font-bold text-primary">Save {money(deal.savings)}</span>
      </div>
      <div className="mt-4 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary" style={{ width: `${soldPercent}%` }} /></div><span className="text-[10px] font-medium text-muted-foreground">{deal.capacity - deal.purchasedCount} left</span></div>
    </div>
  </Link>;
}

function DealSkeleton() {
  return <div className="overflow-hidden rounded-2xl border border-border bg-card"><div className="skeleton aspect-[1.28]" /><div className="space-y-3 p-5"><div className="skeleton h-3 w-1/3 rounded" /><div className="skeleton h-12 w-4/5 rounded" /><div className="skeleton h-3 w-1/2 rounded" /><div className="skeleton h-7 w-2/3 rounded" /></div></div>;
}

export function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All finds');
  const [favorites, setFavorites] = useState<string[]>(() => loadLocal('goodroom-favorites', ['lumen-facial']));
  const [loading, setLoading] = useState(false);
  const deals = seededDeals;
  const filtered = useMemo(() => deals.filter((deal) => (category === 'All finds' || deal.category === category) && `${deal.title} ${deal.salonName} ${deal.city} ${deal.category}`.toLowerCase().includes(search.toLowerCase())), [category, search]);
  const toggle = (id: string) => { const next = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id]; setFavorites(next); saveLocal('goodroom-favorites', next); };
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
        <div className="flex gap-2 overflow-x-auto pb-1 lg:ml-2 lg:pb-0">{categories.map((item) => <button key={item} onClick={() => chooseCategory(item)} className={`whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-bold transition-all ${category === item ? 'border-foreground bg-foreground text-background' : 'border-border bg-background hover:border-foreground'}`} data-testid={`button-category-${item.toLowerCase().replace(' ', '-')}`}>{item}</button>)}<button className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-background" aria-label="Filter deals" data-testid="button-filter-deals"><SlidersHorizontal size={15} /></button></div>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pt-10 lg:px-8">
      <div className="relative overflow-hidden rounded-[26px] bg-secondary">
        <div className="grid lg:grid-cols-[1.05fr_.95fr]">
          <img src={deals[0].image} alt="" className="h-56 w-full object-cover sm:h-72 lg:h-full lg:min-h-[290px]" />
          <div className="relative flex flex-col justify-center p-7 sm:p-10">
            <span className="text-[10px] font-bold uppercase tracking-[.2em] text-foreground/65">Featured this week</span>
            <h2 className="mt-3 max-w-md font-serif text-4xl font-bold leading-[.92] tracking-[-.05em]">{deals[0].title}</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70">A little more light for your hair, with the kind of finish that makes plans feel worth making.</p>
            <Link href={`/deal/${deals[0].id}`} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-bold text-background transition-transform hover:-translate-y-0.5" data-testid="link-featured-deal">See the featured find <ArrowRight size={14} /></Link>
          </div>
        </div>
        <span className="absolute right-5 top-5 hidden rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[.12em] sm:block">40% off</span>
      </div>
    </section>
    <section className="mx-auto max-w-[1240px] px-5 pb-6 pt-12 lg:px-8">
      <div className="mb-7 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Curated for you</p><h2 className="mt-2 font-serif text-3xl font-bold tracking-[-.04em]">The good stuff, today</h2></div><span className="hidden text-xs text-muted-foreground sm:block">{filtered.length} finds in Brooklyn</span></div>
      {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><DealSkeleton /><DealSkeleton /><DealSkeleton /></div> : filtered.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((deal, index) => <div key={deal.id} className={`rise-in delay-${Math.min(index + 1, 4)}`}><DealCard deal={deal} favorite={favorites.includes(deal.id)} toggle={() => toggle(deal.id)} /></div>)}</div> : <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-16 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted"><Search size={20} /></div><h3 className="mt-4 font-serif text-2xl font-bold">No finds yet</h3><p className="mt-2 text-sm text-muted-foreground">Try another service, salon, or neighborhood.</p><button onClick={() => { setSearch(''); setCategory('All finds'); }} className="mt-5 text-sm font-bold text-primary underline underline-offset-4" data-testid="button-clear-filters">Clear filters</button></div>}
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
  const deal = seededDeals.find((item) => item.id === id) ?? seededDeals[0];
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<string[]>(() => loadLocal('goodroom-favorites', []));
  const [purchasing, setPurchasing] = useState(false);
  const [showDealDetails, setShowDealDetails] = useState(true);
  const [showFinePrint, setShowFinePrint] = useState(false);
  const buy = () => {
    setPurchasing(true);
    window.setTimeout(() => {
      const vouchers = loadLocal<Voucher[]>('goodroom-vouchers', seededVouchers);
      const voucher: Voucher = { id: `v-${Date.now()}`, dealId: deal.id, dealTitle: deal.title, salonName: deal.salonName, customerName: 'Mara Chen', purchaseDate: new Date().toISOString().slice(0, 10), expiresAt: deal.endsAt.slice(0, 10), code: `${deal.id.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 89 + 10)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`, status: 'active', qrSeed: Date.now().toString() };
      saveLocal('goodroom-vouchers', [voucher, ...vouchers]); setPurchasing(false); setLocation('/wallet');
    }, 600);
  };
  return <SalonShell><main className="mx-auto max-w-[1100px] px-5 pb-8 pt-7 lg:px-8 lg:pt-12">
    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-foreground" data-testid="link-back-discover"><ArrowLeft size={14} /> Back to all finds</Link>
    <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:gap-14">
      <div>
        <div className="relative overflow-hidden rounded-[26px] bg-muted"><img src={deal.image} alt="" className="aspect-[1.18] w-full object-cover" /><span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1.5 text-xs font-bold">{deal.discountPercent}% off today</span></div>
        <div className="mt-8 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-primary">{deal.category} · {deal.city}</p><h1 className="mt-2 max-w-xl font-serif text-4xl font-bold leading-[.95] tracking-[-.05em] sm:text-5xl">{deal.title}</h1></div><FavoriteButton id={deal.id} active={favorites.includes(deal.id)} onClick={() => { const next = favorites.includes(deal.id) ? favorites.filter((x) => x !== deal.id) : [...favorites, deal.id]; setFavorites(next); saveLocal('goodroom-favorites', next); }} /></div>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><span className="text-accent">★</span> <strong className="text-foreground">{deal.rating}</strong> from {deal.reviewCount} neighbors <span>·</span> {deal.salonName}</p>
        <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{deal.description}</p>
        <section className="mt-9 overflow-hidden rounded-2xl border border-primary/45 bg-card shadow-[var(--shadow-card)]" aria-labelledby="deal-details-heading">
          <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-primary">Offer details</p><h2 id="deal-details-heading" className="mt-2 font-serif text-2xl font-bold tracking-[-.03em]">What you’re getting</h2><p className="mt-2 text-sm text-muted-foreground">Everything included with this goodroom find.</p></div>
            <button onClick={() => setShowDealDetails((visible) => !visible)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground" aria-expanded={showDealDetails} aria-controls="deal-details-content" aria-label={showDealDetails ? 'Collapse deal details' : 'Expand deal details'} data-testid="button-toggle-deal-details"><ChevronUp size={17} className={`transition-transform ${showDealDetails ? '' : 'rotate-180'}`} /></button>
          </div>
          {showDealDetails && <div id="deal-details-content" className="border-t border-border px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid gap-4 pt-5 text-sm">
              <div className="flex items-start gap-3"><UsersRound size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-semibold">Number of people:</strong> 1 person</p></div>
              <div className="flex items-start gap-3"><CalendarDays size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-semibold">Expires:</strong> Valid through {dateLabel(deal.endsAt)} <Info size={14} className="ml-1 inline text-muted-foreground" aria-label="Expiration information" /></p></div>
              <div className="flex items-start gap-3"><ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-semibold">Cancellation policy:</strong> Fully refundable within 3 days after purchase unless otherwise stated <button onClick={() => setShowFinePrint((visible) => !visible)} className="underline underline-offset-2 hover:text-primary" data-testid="button-cancellation-policy">here</button></p></div>
            </div>
            <div className="my-5 border-t border-border" />
            <h3 className="text-base font-bold">What’s included</h3>
            <ul className="mt-4 space-y-3">
              {deal.highlights.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm text-foreground"><Check size={17} className="mt-0.5 shrink-0 text-primary" /><span>{item}</span></li>)}
            </ul>
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="text-base font-bold">Before you buy</h3>
              <button onClick={() => setShowFinePrint((visible) => !visible)} className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground" aria-expanded={showFinePrint} data-testid="button-before-you-buy">{showFinePrint ? 'Hide need-to-know info' : 'Need to know info'} <ArrowRight size={14} className={`transition-transform ${showFinePrint ? 'rotate-90' : ''}`} /></button>
              {showFinePrint && <p className="mt-3 rounded-xl bg-muted p-4 text-sm leading-relaxed text-muted-foreground">{deal.finePrint}</p>}
            </div>
          </div>}
        </section>
      </div>
      <aside className="lg:pt-20"><div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7"><div className="flex items-end justify-between border-b border-border pb-5"><div><span className="font-serif text-4xl font-bold">{money(deal.dealPrice)}</span><span className="ml-2 text-sm text-muted-foreground line-through">{money(deal.originalPrice)}</span></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">Save {money(deal.savings)}</span></div><div className="mt-5 flex items-center justify-between text-sm"><span className="text-muted-foreground">How many?</span><div className="flex items-center gap-3 rounded-full border border-border px-2 py-1"><button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-6 w-6 place-items-center text-lg" data-testid="button-quantity-minus">−</button><span className="w-5 text-center font-semibold" data-testid="text-quantity">{quantity}</span><button onClick={() => setQuantity(Math.min(4, quantity + 1))} className="grid h-6 w-6 place-items-center text-lg" data-testid="button-quantity-plus">+</button></div></div><button onClick={buy} disabled={purchasing} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-60" data-testid="button-buy-deal">{purchasing ? 'Reserving your find…' : `Get this deal · ${money(deal.dealPrice * quantity)}`} {!purchasing && <ArrowRight size={16} />}</button><p className="mt-3 text-center text-[11px] text-muted-foreground">Instant voucher · no hidden fees</p><div className="mt-7 rounded-xl bg-muted p-4"><div className="flex items-center gap-2 text-xs font-bold"><Clock3 size={14} className="text-primary" /> This offer has a short shelf life</div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">47 neighbors already claimed it. Offer closes {dateLabel(deal.endsAt)}.</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-card"><div className="h-full w-[78%] rounded-full bg-secondary" /></div></div><div className="mt-5 flex items-start gap-3 text-xs text-muted-foreground"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-primary" /><span>Pay securely and show your voucher at {deal.salonName}. Your voucher lives in your wallet.</span></div></div></aside>
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

export function SalonConsolePage() {
  const [lookup, setLookup] = useState('');
  const [redemptions, setRedemptions] = useState(initialRedemptions);
  const [notice, setNotice] = useState('');
  const activeDeals = seededDeals.filter((deal) => deal.status === 'active');
  const lookupResult = redemptions.find((item) => item.code.toLowerCase() === lookup.trim().toLowerCase());
  const redeem = (code: string) => { setRedemptions((rows) => rows.map((row) => row.code === code ? { ...row, status: 'Redeemed' } : row)); setNotice(`Voucher ${code} marked redeemed.`); window.setTimeout(() => setNotice(''), 2400); };
  return <SalonShell><main className="mx-auto max-w-[1240px] px-5 pb-8 pt-10 lg:px-8 lg:pt-16"><div className="flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-primary"><StoreIcon /> Salon console</p><h1 className="mt-2 font-serif text-5xl font-bold tracking-[-.06em]">Good morning, Saffron.</h1><p className="mt-3 text-sm text-muted-foreground">A clear view of your offers and today’s chair-filling wins.</p></div><button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-create-deal"><Sparkles size={15} /> Create a new deal</button></div>
    <section className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Deal revenue" value="$2,184" change="+18.4%" icon={<TrendingUp size={17} />} /><Metric label="Vouchers sold" value="149" change="+12 this week" icon={<Ticket size={17} />} /><Metric label="Redemption rate" value="72%" change="+6.2%" icon={<BadgeCheck size={17} />} /><Metric label="Quiet chairs filled" value="34" change="this month" icon={<CalendarDays size={17} />} /></section>
    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"><div><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Your live edit</p><h2 className="mt-1 font-serif text-2xl font-bold">Active deals</h2></div><button className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground" data-testid="button-manage-deals">Manage all <ArrowRight size={13} /></button></div><div className="space-y-3">{activeDeals.slice(0, 3).map((deal) => <div key={deal.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"><img src={deal.image} alt="" className="h-20 w-full rounded-xl object-cover sm:w-28" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><h3 className="truncate font-serif text-lg font-bold">{deal.title}</h3><button className="grid h-8 w-8 shrink-0 place-items-center rounded-full hover:bg-muted" aria-label={`Edit ${deal.title}`} data-testid={`button-edit-deal-${deal.id}`}><Pencil size={14} /></button></div><p className="mt-1 text-xs text-muted-foreground">{deal.purchasedCount} sold · {deal.capacity - deal.purchasedCount} spots left · ends {dateLabel(deal.endsAt)}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(deal.purchasedCount / deal.capacity * 100)}%` }} /></div></div><div className="text-right"><p className="font-serif text-xl font-bold">{money(deal.dealPrice)}</p><p className="text-[10px] text-muted-foreground">per voucher</p></div></div>)}</div></div>
      <div className="rounded-2xl bg-foreground p-6 text-background"><p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Fill the quiet hours</p><h2 className="mt-3 font-serif text-3xl font-bold leading-[.95]">Your next great regular is nearby.</h2><p className="mt-4 text-xs leading-relaxed text-background/65">Deals are a low-lift way to turn a quiet Tuesday into a first visit—and a first visit into a regular.</p><button className="mt-7 flex items-center gap-2 text-xs font-bold text-accent" data-testid="button-learn-deals">See how goodroom works <ArrowRight size={14} /></button></div></section>
    <section className="mt-10"><div className="mb-4 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Front desk</p><h2 className="mt-1 font-serif text-2xl font-bold">Redeem a voucher</h2></div></div><div className="grid gap-5 lg:grid-cols-[1fr_1fr]"><div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm font-semibold">Enter the customer’s code</p><div className="mt-4 flex gap-2"><label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:border-primary"><Search size={16} className="text-muted-foreground" /><input value={lookup} onChange={(e) => setLookup(e.target.value.toUpperCase())} placeholder="SAF-7K2-91M" className="w-full bg-transparent font-mono text-sm uppercase outline-none placeholder:text-muted-foreground" data-testid="input-voucher-lookup" /></label><button onClick={() => setNotice(lookupResult ? 'Voucher found. Review details before redeeming.' : 'No voucher found. Check the code and try again.')} className="rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground" data-testid="button-lookup-voucher">Look up</button></div>{lookup && <div className={`mt-4 rounded-xl p-4 ${lookupResult ? 'bg-secondary' : 'bg-destructive/10'}`}>{lookupResult ? <><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em]">Voucher found</p><p className="mt-1 font-semibold">{lookupResult.service}</p><p className="mt-1 text-xs text-muted-foreground">{lookupResult.customer} · {lookupResult.code}</p></div><BadgeCheck size={20} /></div><button onClick={() => redeem(lookupResult.code)} disabled={lookupResult.status === 'Redeemed'} className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-xs font-bold text-background disabled:opacity-50" data-testid="button-mark-redeemed">{lookupResult.status === 'Redeemed' ? <><Check size={14} /> Already redeemed</> : 'Mark as redeemed'}</button></> : <p className="text-xs font-semibold text-destructive">No voucher matched that code.</p>}</div>} {notice && <p className="mt-3 text-xs font-semibold text-primary" data-testid="status-redemption-notice">{notice}</p>}</div><div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Recent redemptions</p><button className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted" aria-label="More redemption options" data-testid="button-more-redemptions"><MoreHorizontal size={16} /></button></div><div className="mt-4 divide-y divide-border">{redemptions.map((item) => <div key={item.code} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="min-w-0"><p className="truncate text-xs font-semibold">{item.customer}</p><p className="mt-1 truncate text-[11px] text-muted-foreground">{item.service} · {item.time}</p></div><span className={`shrink-0 text-[10px] font-bold ${item.status === 'Redeemed' ? 'text-primary' : 'text-accent-foreground'}`}>{item.status}</span></div>)}</div></div></div></section>
  </main><ModePill /></SalonShell>;
}

function StoreIcon() { return <span className="grid h-5 w-5 place-items-center rounded-md bg-primary text-primary-foreground"><StoreMini /></span>; }
function StoreMini() { return <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6.5h12M3 6.5v6h10v-6M4 3h8l1 3.5H3L4 3Z" /></svg>; }
function Metric({ label, value, change, icon }: { label: string; value: string; change: string; icon: ReactNode }) { return <div className="rounded-2xl border border-border bg-card p-5"><div className="flex items-center justify-between"><span className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-primary">{icon}</span><span className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{change}</span></div><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-serif text-3xl font-bold tracking-[-.04em]">{value}</p></div>; }