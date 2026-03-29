import { buildLeaderboard } from '../engine/scoring'
import RoundHistory from './RoundHistory'

const PODIUM_COLOR = ['from-amber-500 to-yellow-400', 'from-slate-400 to-slate-300', 'from-amber-700 to-amber-600']
const PODIUM_HEIGHT = ['h-24', 'h-16', 'h-12']
const CROWN = ['👑', '🥈', '🥉']

export default function GameOver({ players, cumulativeScores, rounds, onNewGame }) {
  const board = buildLeaderboard(players, cumulativeScores, null)
  const podium = [board[1], board[0], board[2]].filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center pt-8 mb-8">
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-1">游戏结束！</h1>
          <p className="text-purple-300 text-sm">骷髅王之战落幕</p>
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 mb-8 px-4">
          {podium.map((player, i) => {
            const origRank = board.indexOf(player)
            return (
              <div key={player.id} className="flex flex-col items-center flex-1 max-w-32">
                <div className="text-2xl mb-1">{CROWN[origRank]}</div>
                <div className="text-white text-xs font-medium text-center mb-2 truncate w-full text-center">
                  {player.name}
                </div>
                <div className="text-white font-bold font-mono text-sm mb-1">{player.score}</div>
                <div className={`w-full rounded-t-lg bg-gradient-to-t ${PODIUM_COLOR[origRank]} ${PODIUM_HEIGHT[origRank === 0 ? 0 : origRank === 1 ? 1 : 2]}`} />
              </div>
            )
          })}
        </div>

        {/* Full standings */}
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden mb-4">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h3 className="text-white font-semibold text-sm">最终排名</h3>
          </div>
          <div className="divide-y divide-slate-700/30">
            {board.map((player, i) => (
              <div key={player.id} className={`flex items-center px-4 py-3 ${i === 0 ? 'bg-amber-900/10' : ''}`}>
                <span className="w-8 text-center text-slate-400 font-mono text-sm">{i + 1}</span>
                <span className="flex-1 text-white text-sm ml-2">{player.name}</span>
                <span className="text-white font-bold font-mono">{player.score > 0 ? '+' : ''}{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Round history */}
        <div className="mb-6">
          <RoundHistory rounds={rounds} players={players} />
        </div>

        <button
          onClick={onNewGame}
          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/40 active:scale-95"
        >
          再来一局
        </button>
      </div>
    </div>
  )
}
