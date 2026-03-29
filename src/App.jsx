import { useState } from 'react'
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

const TABS = [
  { id: 'entry', label: '记分', icon: '✏️' },
  { id: 'board', label: '排行榜', icon: '🏆' },
  { id: 'history', label: '历史', icon: '📋' },
]

export default function App() {
  const { state, startGame, submitRound, newGame } = useGameState()
  const { phase, players, currentRound, rounds, cumulativeScores, prevCumulativeScores } = state
  const [activeTab, setActiveTab] = useState('entry')

  // Reset to entry tab when round changes
  const handleSubmit = (entries) => {
    submitRound(entries, currentRound)
    setActiveTab('board')
  }

  if (phase === 'setup') return <PlayerSetup onStart={startGame} />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">

      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💀</span>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">骷髅王</h1>
                <p className="text-slate-500 text-xs">第 {currentRound} / {TOTAL_ROUNDS} 轮</p>
              </div>
            </div>
            <button
              onClick={() => { if (confirm('确定要放弃当前游戏并开始新局吗？')) newGame() }}
              className="text-xs text-slate-500 active:text-slate-300 px-3 py-2 rounded-lg active:bg-slate-800 transition-colors"
            >
              新游戏
            </button>
          </div>
          <ProgressBar current={currentRound} total={TOTAL_ROUNDS} />
        </div>
      </div>

      {/* Desktop: side-by-side | Mobile: tab content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 pb-4">

          {/* Desktop layout */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4 mt-4">
            <div className="lg:col-span-3">
              <RoundEntry players={players} roundNumber={currentRound} onSubmit={handleSubmit} />
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Leaderboard
                players={players}
                cumulativeScores={cumulativeScores}
                prevCumulativeScores={prevCumulativeScores}
                roundNumber={currentRound}
              />
              {rounds.length > 0 && <RoundHistory rounds={rounds} players={players} />}
            </div>
          </div>

          {/* Mobile tab content */}
          <div className="lg:hidden mt-3">
            {activeTab === 'entry' && (
              <RoundEntry players={players} roundNumber={currentRound} onSubmit={handleSubmit} />
            )}
            {activeTab === 'board' && (
              <Leaderboard
                players={players}
                cumulativeScores={cumulativeScores}
                prevCumulativeScores={prevCumulativeScores}
                roundNumber={currentRound}
              />
            )}
            {activeTab === 'history' && (
              rounds.length > 0
                ? <RoundHistory rounds={rounds} players={players} />
                : <p className="text-center text-slate-500 mt-16 text-sm">完成第一轮后查看历史记录</p>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <div className="lg:hidden flex-shrink-0 border-t border-slate-700/50 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex safe-area-inset-bottom">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400'
                  : 'text-slate-500 active:text-slate-300'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'entry' && (
                <span className={`w-1 h-1 rounded-full mt-0.5 ${activeTab === tab.id ? 'bg-purple-400' : 'bg-transparent'}`} />
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
