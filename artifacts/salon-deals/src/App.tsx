import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignIn, SignUp } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  DealDetailPage,
  CreateDealPage,
  MarketplacePage,
  SalonConsolePage,
  WalletPage,
} from '@/pages/salon-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#6b4e9b',
    colorForeground: '#2b2340',
    colorMutedForeground: '#756d82',
    colorDanger: '#b84c5b',
    colorBackground: '#fffdf8',
    colorInput: '#fffdf8',
    colorInputForeground: '#2b2340',
    colorNeutral: '#ded8ce',
    fontFamily: 'DM Sans, sans-serif',
    borderRadius: '0.85rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fffdf8] rounded-2xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-serif text-[#2b2340]',
    headerSubtitle: 'text-[#756d82]',
    socialButtonsBlockButtonText: 'text-[#2b2340]',
    formFieldLabel: 'text-[#2b2340]',
    footerActionLink: 'text-[#6b4e9b]',
    footerActionText: 'text-[#756d82]',
    dividerText: 'text-[#756d82]',
    identityPreviewEditButton: 'text-[#6b4e9b]',
    formFieldSuccessText: 'text-[#39735a]',
    alertText: 'text-[#b84c5b]',
    logoBox: 'h-12',
    logoImage: 'max-h-12',
    socialButtonsBlockButton: 'border-[#ded8ce] bg-[#fffdf8] hover:bg-[#f4efe7]',
    formButtonPrimary: 'bg-[#6b4e9b] hover:bg-[#594080] text-white',
    formFieldInput: 'border-[#ded8ce] bg-[#fffdf8] text-[#2b2340]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#ded8ce]',
    alert: 'border-[#f1c7cc] bg-[#fff0f1]',
    otpCodeFieldInput: 'border-[#ded8ce] bg-[#fffdf8] text-[#2b2340]',
    formFieldRow: 'text-[#2b2340]',
    main: 'bg-transparent',
  },
};

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/" component={MarketplacePage} />
        <Route path="/deal/:id" component={DealDetailPage} />
        <Route path="/wallet" component={WalletPage} />
        <Route path="/salon/deals/new" component={CreateDealPage} />
        <Route path="/salon" component={SalonConsolePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      routerPush={(to) => window.history.pushState(null, '', stripBase(to))}
      routerReplace={(to) => window.history.replaceState(null, '', stripBase(to))}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
