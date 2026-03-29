import { useState } from 'react'
import { useRoomState } from './hooks/useRoomState'
import Home from './components/Home'
import Lobby from './components/Lobby'
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
            i < current - 1 ? 'bg-purple-500' : i === current - 1 ? 'bg-purple-300' : 'bg-slate-700'
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
  const {
    phase, room, players, myPlayer, roundEntries,
    currentRound, cumulativeScores, prevCumulativeScores,
    loading, error,
    createRoom, joinRoom, startGame, submitRound, newGame,
  } = useRoomState()

  const [activeTab, setActiveTab] = useState('entry')

  const handleSubmit = (entries) => {
    submitRound(entries, currentRound)
    setActiveTab('board')
  }

  if (phase === 'home') {
    return <Home onCreate={createRoom} onJoin={joinRoom} loading={loading} error={error} />
  }

  if (phase === 'lobby') {
    return <Lobby room={room} players={players} myPlayer={myPlayer} onStart={startGame} onLeave={newGame} />
  }

  if (phase === 'gameover') {
    return (
      <GameOver
        players={players}
        cumulativeScores={cumulativeScores}
        rounds={getRoundsFromEntries(roundEntries, players)}
        onNewGame={newGame}
      />
    )
  }

  const rounds = getRoundsFromEntries(roundEntries, players)
  const myEntry = roundEntries.find(e => e.player_id === myPlayer?.id && e.round_number === currentRound)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col">
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💀</span>
              <div>
                <h1 className="text-white font-bold text-lg leading-none">骷髅王</h1>
                <p className="text-slate-500 text-xs">第 {currentRound} / {TOTAL_ROUNDS} 轮 · 房间 {room?.code}</p>
              </div>
            </div>
            <button
              onClick={() => { if (confirm('确定要离开当前游戏吗？')) newGame() }}
              className="text-xs text-slate-500 active:text-slate-300 px-3 py-2 rounded-lg active:bg-slate-800 transition-colors"
            >
              离开
            </button>
          </div>
          <ProgressBar current={currentRound} total={TOTAL_ROUNDS} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-4 mt-4">
            <div className="lg:col-span-3">
              {myEntry
                ? <SubmittedCard myEntry={myEntry} roundEntries={roundEntries} players={players} currentRound={currentRound} />
                : <RoundEntry players={players} roundNumber={currentRound} onSubmit={handleSubmit} myPlayerId={myPlayer?.id} />
              }
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Leaderboard players={players} cumulativeScores={cumulativeScores} prevCumulativeScores={prevCumulativeScores} roundNumber={currentRound} />
              {rounds.length > 0 && <RoundHistory rounds={rounds} players={players} />}
            </div>
          </div>

          <div className="lg:hidden mt-3">
            {activeTab === 'entry' && (
              myEntry
                ? <SubmittedCard myEntry={myEntry} roundEntries={roundEntries} players={players} currentRound={currentRound} />
                : <RoundEntry players={players} roundNumber={currentRound} onSubmit={handleSubmit} myPlayerId={myPlayer?.id} />
            )}
            {activeTab === 'board' && (
              <Leaderboard players={players} cumulativeScores={cumulativeScores} prevCumulativeScores={prevCumulativeScores} roundNumber={currentRound} />
            )}
            {activeTab === 'history' && (
              rounds.length > 0
                ? <RoundHistory rounds={rounds} players={players} />
                : <p className="text-center text-slate-500 mt-16 text-sm">完成第一轮后查看历史记录</p>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden flex-shrink-0 border-t border-slate-700/50 bg-slate-900/90 backdrop-blur-sm">
        <div className="flex safe-area-inset-bottom">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                activeTab === tab.id ? 'text-purple-400' : 'text-slate-500 active:text-slate-300'
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

function SubmittedCard({ myEntry, roundEntries, players, currentRound }) {
  const submitted = roundEntries.filter(e => e.round_number === currentRound)
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 text-center">
      <div className="text-4xl mb-3">✅</div>
      <h2 className="text-white font-bold text-lg mb-1">本轮已提交</h2>
      <p className="text-slate-400 text-sm mb-4">
        叫墩 {myEntry.bid} · 取墩 {myEntry.tricks} · 得分{' '}
        <span className={myEntry.score >= 0 ? 'text-emerald-400' : 'text-red-400'}>
          {myEntry.score > 0 ? '+' : ''}{myEntry.score}
        </span>
      </p>
      <div className="bg-slate-700/40 rounded-xl p-3">
        <p className="text-slate-500 text-xs mb-2">等待其他玩家提交 ({submitted.length}/{players.length})</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {players.map(p => {
            const done = submitted.some(e => e.player_id === p.id)
            return (
              <span key={p.id} className={`text-xs px-2 py-1 rounded-full ${done ? 'bg-emerald-900/40 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                {done ? '✓' : '…'} {p.name}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getRoundsFromEntries(roundEntries, players) {
  const byRound = {}
  roundEntries.forEach(e => {
    if (!byRound[e.round_number]) byRound[e.round_number] = []
    byRound[e.round_number].push({
      playerId: e.player_id,
      bid: e.bid,
      tricks: e.tricks,
      bonusPirates: e.bonus_pirates,
      bonusMermaids: e.bonus_mermaids,
      score: e.score,
    })
  })
  return Object.entries(byRound)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([round, entries]) => ({ round: Number(round), entries }))
}
