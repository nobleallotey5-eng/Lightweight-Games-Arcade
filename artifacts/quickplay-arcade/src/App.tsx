import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { ArrowDownRight, ArrowRight, Clock3, Sparkles } from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { MemoryGame } from '@/games/MemoryGame';
import { MergeGame } from '@/games/MergeGame';
import { ReactionGame } from '@/games/ReactionGame';

const queryClient = new QueryClient();

function Brand() {
  return (
    <Link href="/" className="brand" data-testid="link-quickplay-home">
      <span className="brand-mark"><Sparkles size={18} strokeWidth={2.5} /></span>
      <span>quickplay<span style={{ color: '#e36349' }}>.</span></span>
    </Link>
  );
}

function PageFrame({ children }: { children: ReactNode }) {
  return (
    <main className="arcade-page">
      <div className="shell">
        <header className="topbar">
          <Brand />
          <div className="top-note"><span>●</span> the tiny break arcade</div>
        </header>
        {children}
      </div>
    </main>
  );
}

const games = [
  {
    path: '/play/reaction',
    id: 'reaction',
    number: '01',
    tag: 'QUICK REFLEX',
    name: 'Quick draw',
    description: 'Wait for the green. Then tap like a lightning bolt.',
    tone: '',
    art: 'reaction',
  },
  {
    path: '/play/memory',
    id: 'memory',
    number: '02',
    tag: 'BRAIN TICKLE',
    name: 'Pair parade',
    description: 'Flip the tiles. Find the twins. Keep your cool.',
    tone: 'mint',
    art: 'memory',
  },
  {
    path: '/play/merge',
    id: 'merge',
    number: '03',
    tag: 'SLOW & SATISFYING',
    name: 'Number nook',
    description: 'Slide matching numbers together. One more turn?',
    tone: 'butter',
    art: 'merge',
  },
];

function CardArt({ kind }: { kind: string }) {
  if (kind === 'reaction') {
    return <div className="reaction-art" aria-hidden="true"><Clock3 size={37} strokeWidth={1.8} /></div>;
  }
  if (kind === 'memory') {
    return <div className="memory-art" aria-hidden="true"><i>A</i><i>?</i><i>B</i><i>?</i><i>C</i><i>D</i></div>;
  }
  return <div className="merge-art" aria-hidden="true"><i>2</i><i>4</i><i></i><i></i><i>8</i><i></i><i>2</i><i></i><i>4</i></div>;
}

function Home() {
  return (
    <PageFrame>
      <section className="hero">
        <div>
          <div className="eyebrow">A little play goes a long way</div>
          <h1>Take five.<br />Play <em>one.</em></h1>
          <p className="hero-copy">Three tiny games. No sign-up, no setup, no high stakes. Just a pocket-sized reset for your brain.</p>
        </div>
        <div className="hero-right" aria-hidden="true">
          <div className="arcade-art">
            <div className="art-sun" />
            <div className="art-cabinet">
              <div className="art-screen">PLAY</div>
              <div className="art-controls"><div className="art-stick" /><div className="art-button" /></div>
            </div>
            <div className="art-spark"><Sparkles size={36} strokeWidth={1.8} /></div>
          </div>
        </div>
      </section>
      <section aria-labelledby="library-title">
        <div className="section-head">
          <h2 id="library-title">Pick your pause</h2>
          <p>ALL GAMES · UNDER 2 MIN</p>
        </div>
        <div className="game-grid">
          {games.map((game) => (
            <Link href={game.path} className={`game-card ${game.tone}`} key={game.id} data-testid={`link-game-${game.id}`}>
              <div className="card-top">
                <span className="card-index">QP / {game.number}</span>
                <span className="card-tag">{game.tag}</span>
              </div>
              <div className="game-art"><CardArt kind={game.art} /></div>
              <h3 className="game-name">{game.name}</h3>
              <p className="game-desc">{game.description}</p>
              <span className="card-play"><ArrowRight size={17} /></span>
            </Link>
          ))}
        </div>
      </section>
      <footer className="library-footer">
        <span>MADE FOR THE IN-BETWEEN</span>
        <span>NO SCOREBOARD. JUST YOU.</span>
      </footer>
    </PageFrame>
  );
}

function GameFrame({ children }: { children: ReactNode }) {
  return (
    <PageFrame>
      <section className="game-main">
        <Link href="/" className="back-link" data-testid="link-back-library"><ArrowDownRight size={15} /> Back to the arcade</Link>
        {children}
      </section>
    </PageFrame>
  );
}

function ReactionPage() {
  return <GameFrame><ReactionGame /></GameFrame>;
}
function MemoryPage() {
  return <GameFrame><MemoryGame /></GameFrame>;
}
function MergePage() {
  return <GameFrame><MergeGame /></GameFrame>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/play/reaction" component={ReactionPage} />
        <Route path="/play/memory" component={MemoryPage} />
        <Route path="/play/merge" component={MergePage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;