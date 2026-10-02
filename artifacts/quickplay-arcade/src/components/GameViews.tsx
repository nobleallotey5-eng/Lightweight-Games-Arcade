import { useRef } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw, Zap } from 'lucide-react';

export type ReactionPhase = 'idle' | 'waiting' | 'ready' | 'result' | 'early';
export type ReactionGameActions = {
  onStart?: () => void;
  onPress?: () => void;
  onReset?: () => void;
};
export type ReactionGameViewProps = {
  phase: ReactionPhase;
  result: number | null;
  best: number | null;
  round?: number;
  sessionAverage?: number | null;
  actions?: ReactionGameActions;
};

export function ReactionGameView({ phase, result, best, round = 0, sessionAverage, actions }: ReactionGameViewProps) {
  const messages: Record<ReactionPhase, { title: string; detail: string }> = {
    idle: { title: 'Ready, when you are.', detail: 'A quick test of your reflexes. No pressure.' },
    waiting: { title: 'Not yet…', detail: 'Keep your eyes on the screen.' },
    ready: { title: 'NOW!', detail: 'Tap anywhere to stop the clock.' },
    result: {
      title: round >= 5 && sessionAverage !== null && sessionAverage !== undefined
        ? `${sessionAverage} ms avg`
        : result === null ? 'Nice one.' : `${result} ms`,
      detail: round >= 5
        ? 'Five rounds complete. That was your average.'
        : `Round ${round} of 5. Ready for the next?`,
    },
    early: { title: 'Too quick!', detail: 'Jumped the start. Give it another go.' },
  };
  const message = messages[phase];
  const responseActive = (phase === 'waiting' || phase === 'ready') && Boolean(actions?.onPress);
  const startAction = actions?.onStart;

  return (
    <>
      <div className="game-heading">
        <div><div className="eyebrow">01 / Quick reflex</div><h1>Quick draw</h1><p>Wait for the green. Then tap like a lightning bolt.</p></div>
        <div className="score-box">PERSONAL BEST<strong>{best === null ? '—' : `${best} ms`}</strong></div>
      </div>
      <div className="play-panel">
        <div
          className={`reaction-zone ${phase}`}
          role={responseActive ? 'button' : undefined}
          tabIndex={responseActive ? 0 : undefined}
          onClick={responseActive ? actions?.onPress : undefined}
          onKeyDown={responseActive ? (event) => { if (event.key === 'Enter' || event.key === ' ') actions?.onPress?.(); } : undefined}
          data-testid="status-reaction-game"
        >
          <Zap className="reaction-icon" size={30} />
          <h2>{message.title}</h2>
          <p>{message.detail}</p>
        </div>
        {(startAction || actions?.onReset) && (
          <div className="game-actions">
            {startAction && <button className="arcade-button" onClick={startAction} data-testid="button-start-reaction"><Zap size={15} />{phase === 'idle' ? 'Start a round' : phase === 'result' && round < 5 ? 'Next round' : 'Try again'}</button>}
            {actions?.onReset && <button className="arcade-button secondary" onClick={actions.onReset} data-testid="button-reset-reaction"><RotateCcw size={15} />Reset</button>}
          </div>
        )}
        <div className="game-instructions"><span>ROUND {Math.min(round + (phase === 'result' ? 0 : 1), 5)} OF 5</span><span>·</span><span>PERSONAL BEST IS YOUR AVERAGE</span></div>
      </div>
    </>
  );
}

export type MemoryCard = { id: string | number; value: string | number };
export type MemoryGameActions = {
  onFlip?: (id: MemoryCard['id']) => void;
  onRestart?: () => void;
};
export type MemoryGameViewProps = {
  board: MemoryCard[];
  matched: MemoryCard['id'][];
  flipped: MemoryCard['id'][];
  moves: number;
  time: number;
  bestMoves?: number | null;
  complete?: boolean;
  actions?: MemoryGameActions;
};

export function MemoryGameView({ board, matched, flipped, moves, time, bestMoves, complete, actions }: MemoryGameViewProps) {
  const matchedSet = new Set(matched);
  const flippedSet = new Set(flipped);
  const clock = `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
  return (
    <>
      <div className="game-heading">
        <div><div className="eyebrow">02 / Brain tickle</div><h1>Pair parade</h1><p>Flip the tiles. Find the twins. Keep your cool.</p></div>
        <div className="score-box">MOVES<strong>{moves}</strong><span className="score-subline">BEST {bestMoves ?? '—'}</span></div>
      </div>
      <div className="play-panel">
        <div className="memory-board" role="group" aria-label="Memory card board" data-testid="board-memory">
          {board.map((card, index) => {
            const isMatched = matchedSet.has(card.id);
            const isFlipped = flippedSet.has(card.id) || isMatched;
            const className = `memory-card${isFlipped ? ' revealed' : ''}${isMatched ? ' matched' : ''}`;
            const content = isFlipped ? <span>{card.value}</span> : <span className="card-back">QP</span>;
            return actions?.onFlip ? (
              <button
                type="button"
                key={card.id}
                className={className}
                onClick={() => actions.onFlip?.(card.id)}
                disabled={isMatched || isFlipped}
                aria-label={isFlipped ? `Card ${index + 1}: ${card.value}` : `Reveal card ${index + 1}`}
                data-testid={`button-memory-card-${card.id}`}
              >{content}</button>
            ) : <div key={card.id} className={className} aria-label={isFlipped ? `Card ${index + 1}: ${card.value}` : `Hidden card ${index + 1}`} data-testid={`card-memory-${card.id}`}>{content}</div>;
          })}
        </div>
        <div className="game-instructions"><span>{clock} ELAPSED</span><span>·</span><span>12 TILES · 6 PAIRS</span></div>
        {complete && <p className="notice" role="status" data-testid="status-memory-complete">All pairs found in {moves} moves and {clock}. Nice work.</p>}
        {actions?.onRestart && <div className="game-actions"><button className="arcade-button secondary" onClick={actions.onRestart} data-testid="button-restart-memory"><RotateCcw size={15} />New shuffle</button></div>}
      </div>
    </>
  );
}

export type MergeDirection = 'up' | 'down' | 'left' | 'right';
export type MergeStatus = 'ready' | 'playing' | 'won' | 'over';
export type MergeGameActions = {
  onMove?: (direction: MergeDirection) => void;
  onRestart?: () => void;
  onUndo?: () => void;
};
export type MergeGameViewProps = {
  board: number[][];
  score: number;
  bestScore?: number | null;
  status: MergeStatus;
  actions?: MergeGameActions;
};

const directionButtons: { direction: MergeDirection; label: string; Icon: typeof ArrowUp }[] = [
  { direction: 'up', label: 'Move up', Icon: ArrowUp },
  { direction: 'left', label: 'Move left', Icon: ArrowLeft },
  { direction: 'down', label: 'Move down', Icon: ArrowDown },
  { direction: 'right', label: 'Move right', Icon: ArrowRight },
];

export function MergeGameView({ board, score, bestScore, status, actions }: MergeGameViewProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const statusCopy: Record<MergeStatus, string> = {
    ready: 'Slide tiles together to make bigger numbers.',
    playing: 'Keep merging. How high can you climb?',
    won: 'A lovely big merge. Keep going?',
    over: 'Board full. Fancy another go?',
  };
  return (
    <>
      <div className="game-heading">
        <div><div className="eyebrow">03 / Slow & satisfying</div><h1>Number nook</h1><p>Slide matching numbers together. One more turn?</p></div>
        <div className="score-box">SCORE<strong>{score.toLocaleString()}</strong></div>
      </div>
      <div className="play-panel">
        <div className="merge-wrap">
          <div
            className="merge-board"
            role="grid"
            aria-label="Number merge board. Use arrow keys, direction buttons, or swipe to move."
            data-testid="board-merge"
            onTouchStart={(event) => {
              const touch = event.touches[0];
              touchStart.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={(event) => {
              if (!touchStart.current || !actions?.onMove) return;
              const touch = event.changedTouches[0];
              const deltaX = touch.clientX - touchStart.current.x;
              const deltaY = touch.clientY - touchStart.current.y;
              touchStart.current = null;
              if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 24) return;
              if (Math.abs(deltaX) > Math.abs(deltaY)) {
                actions.onMove(deltaX > 0 ? 'right' : 'left');
              } else {
                actions.onMove(deltaY > 0 ? 'down' : 'up');
              }
            }}
          >
            {board.flatMap((row, rowIndex) => row.map((value, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`merge-cell${value ? ` filled v${Math.min(value, 64)}` : ''}`}
                role="gridcell"
                aria-label={value ? `${value}` : 'Empty'}
                data-testid={`cell-merge-${rowIndex}-${colIndex}`}
              >{value || ''}</div>
            )))}
          </div>
          <aside className="merge-side">
            <div className="merge-score">BEST TILE<strong>{Math.max(0, ...board.flat()) || '—'}</strong></div>
            <div className="merge-score">BEST SCORE<strong>{bestScore?.toLocaleString() ?? '—'}</strong></div>
            <div className="merge-score">GAME<strong>{status === 'over' ? 'Over' : status === 'won' ? 'Nice!' : 'On'}</strong></div>
          </aside>
        </div>
        <p className="notice" role="status" data-testid="status-merge-game">{statusCopy[status]}</p>
        {actions?.onMove && (
          <div className="game-actions" aria-label="Move tiles">
            {directionButtons.map(({ direction, label, Icon }) => (
              <button className="arcade-button secondary" key={direction} aria-label={label} onClick={() => actions.onMove?.(direction)} data-testid={`button-merge-${direction}`}><Icon size={16} /></button>
            ))}
          </div>
        )}
        {(actions?.onRestart || actions?.onUndo) && (
          <div className="game-actions">
            {actions.onUndo && <button className="arcade-button secondary" onClick={actions.onUndo} data-testid="button-undo-merge"><RotateCcw size={15} />Undo</button>}
            {actions.onRestart && <button className="arcade-button" onClick={actions.onRestart} data-testid="button-restart-merge"><RotateCcw size={15} />New game</button>}
          </div>
        )}
        <div className="game-instructions"><span>USE ARROW KEYS</span><span>·</span><span>MERGE THE SAME NUMBER</span></div>
      </div>
    </>
  );
}