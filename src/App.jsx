import { useGameState } from './hooks/useGameState'
import PlayerSetup from './components/PlayerSetup'
import RoundEntry from './components/RoundEntry'
import Leaderboard from './components/Leaderboard'
import RoundHistory from './components/RoundHistory'
import GameOver from './components/GameOver'
import { TOTAL_ROUNDS } from './constants'

function ProgressBar({ current, total }) {
  return (
    <div className="flex gap-1 w-full">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`flex-1 h-1 rounded-full ${
            i < current - 1
              ? 'bg-purple-500'
              : i === current - 1
              ? 'bg-purple-300'
              : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  )
}

export default function App() {
  const { state, startGame, submitRound, newGame } = useGameState()
  const { phase, players, currentRound, rounds, cumulativeScores, prevCumulativeScores } = state

  if (phase === 'setup') {
    return <PlayerSetup onStart={startGame} />
  }

  if (phase === 'gameover') {
    return (
      <GameOver
        players={players}
        cumulativeScores={cumulativeScores}
        rounds={rounds}
        onNewGame={newGame}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💀</span>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">骷髅王</h1>
              <p className="text-slate-500 text-xs">第 {currentRound} / {TOTAL_ROUNDS} 轮</p>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('确定要放弃当前游戏并开始新局吗？')) newGame() }}
            className="text-xs text-slate-500 hover:text-slate-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            新游戏
          </button>
        </div>

        <div className="mb-6">
          <ProgressBar current={currentRound} total={TOTAL_ROUNDS} />
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Round entry */}
          <div className="lg:col-span-3">
            <RoundEntry
              players={players}
              roundNumber={currentRound}
              onSubmit={(entries) => submitRound(entries, currentRound)}
            />
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Leaderboard
              players={players}
              cumulativeScores={cumulativeScores}
              prevCumulativeScores={prevCumulativeScores}
              roundNumber={currentRound}
            />
            {rounds.length > 0 && (
              <RoundHistory rounds={rounds} players={players} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
