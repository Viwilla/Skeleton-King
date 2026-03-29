import { buildLeaderboard } from '../engine/scoring'

const MEDAL = ['🥇', '🥈', '🥉']

function RankDelta({ current, prev }) {
  if (prev === null) return null
  const delta = prev - current
  if (delta > 0) return <span className="text-emerald-400 text-xs">↑{delta}</span>
  if (delta < 0) return <span className="text-red-400 text-xs">↓{Math.abs(delta)}</span>
  return <span className="text-slate-600 text-xs">—</span>
}

export default function Leaderboard({ players, cumulativeScores, prevCumulativeScores, liveScores = null, roundNumber }) {
  const displayScores = liveScores
    ? Object.fromEntries(Object.entries(cumulativeScores).map(([id, s]) => [id, s + (liveScores[id] ?? 0)]))
    : cumulativeScores

  const board = buildLeaderboard(players, displayScores, Object.keys(prevCumulativeScores ?? {}).length ? prevCumulativeScores : null)

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">实时排行榜</h3>
        {roundNumber && <span className="text-slate-500 text-xs">第 {roundNumber} 轮进行中</span>}
      </div>

      <div className="divide-y divide-slate-700/30">
        {board.map((player, i) => {
          const roundDelta = liveScores ? (liveScores[player.id] ?? 0) : null
          return (
            <div key={player.id} className={`flex items-center px-4 py-3 ${i === 0 ? 'bg-amber-900/10' : ''}`}>
              <div className="w-8 text-center">
                {i < 3 ? (
                  <span className="text-lg">{MEDAL[i]}</span>
                ) : (
                  <span className="text-slate-500 text-sm font-mono">{i + 1}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 ml-2">
                <p className="text-white text-sm font-medium truncate">{player.name}</p>
                {player.prevScore !== null && (
                  <RankDelta current={player.rank} prev={getPrevRank(board, player.id, prevCumulativeScores, players)} />
                )}
              </div>

              <div className="text-right">
                <p className="text-white font-bold font-mono">
                  {player.score > 0 ? '+' : ''}{player.score}
                </p>
                {roundDelta !== null && roundDelta !== 0 && (
                  <p className={`text-xs font-mono ${roundDelta > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {roundDelta > 0 ? '+' : ''}{roundDelta}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getPrevRank(currentBoard, playerId, prevScores, players) {
  if (!prevScores || Object.keys(prevScores).length === 0) return null
  const prevBoard = buildLeaderboard(players, prevScores, null)
  const entry = prevBoard.find(p => p.id === playerId)
  return entry?.rank ?? null
}
