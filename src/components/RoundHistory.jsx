import { useState } from 'react'
import { calculateRoundScore } from '../engine/scoring'

function RoundScoreCell({ entry, roundNumber }) {
  const { base, bonus, total } = calculateRoundScore(entry, roundNumber)
  const color = total > 0 ? 'text-emerald-400' : total < 0 ? 'text-red-400' : 'text-slate-400'
  return (
    <span className={`font-mono text-sm ${color}`}>
      {total >= 0 ? '+' : ''}{total}
    </span>
  )
}

export default function RoundHistory({ rounds, players }) {
  const [open, setOpen] = useState(null)

  if (rounds.length === 0) return null

  const cumulativeByRound = []
  const running = {}
  players.forEach(p => { running[p.id] = 0 })
  rounds.forEach(r => {
    r.entries.forEach(e => { running[e.playerId] = (running[e.playerId] || 0) + e.score })
    cumulativeByRound.push({ ...running })
  })

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-white font-semibold text-sm">历史记录</h3>
      </div>

      <div className="divide-y divide-slate-700/30">
        {rounds.map((round, ri) => (
          <div key={round.round}>
            <button
              className="w-full flex items-center px-4 py-3 hover:bg-slate-700/20 transition-colors text-left"
              onClick={() => setOpen(open === ri ? null : ri)}
            >
              <span className="text-purple-400 font-mono text-sm w-12">R{round.round}</span>
              <div className="flex-1 flex gap-3 flex-wrap">
                {round.entries.map(entry => {
                  const player = players.find(p => p.id === entry.playerId)
                  const color = entry.score > 0 ? 'text-emerald-400' : entry.score < 0 ? 'text-red-400' : 'text-slate-400'
                  return (
                    <span key={entry.playerId} className="text-xs">
                      <span className="text-slate-400">{player?.name}：</span>
                      <span className={`font-mono ${color}`}>{entry.score >= 0 ? '+' : ''}{entry.score}</span>
                    </span>
                  )
                })}
              </div>
              <span className="text-slate-600 text-xs">{open === ri ? '▲' : '▼'}</span>
            </button>

            {open === ri && (
              <div className="px-4 pb-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-700/50">
                      <th className="text-left py-1 font-normal">玩家</th>
                      <th className="text-center py-1 font-normal">叫墩</th>
                      <th className="text-center py-1 font-normal">取墩</th>
                      <th className="text-center py-1 font-normal">奖励</th>
                      <th className="text-right py-1 font-normal">得分</th>
                      <th className="text-right py-1 font-normal">累计</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {round.entries.map(entry => {
                      const player = players.find(p => p.id === entry.playerId)
                      const bonus = 30 * (entry.bonusPirates || 0) + 20 * (entry.bonusMermaids || 0)
                      const cumulative = cumulativeByRound[ri][entry.playerId] ?? 0
                      const scoreColor = entry.score > 0 ? 'text-emerald-400' : entry.score < 0 ? 'text-red-400' : 'text-slate-400'
                      return (
                        <tr key={entry.playerId} className="text-slate-300">
                          <td className="py-1.5 text-white">{player?.name}</td>
                          <td className="text-center py-1.5 font-mono">{entry.bid}</td>
                          <td className="text-center py-1.5 font-mono">{entry.tricks}</td>
                          <td className="text-center py-1.5 font-mono text-amber-400">{bonus > 0 ? `+${bonus}` : '—'}</td>
                          <td className={`text-right py-1.5 font-mono font-bold ${scoreColor}`}>{entry.score >= 0 ? '+' : ''}{entry.score}</td>
                          <td className="text-right py-1.5 font-mono text-white">{cumulative}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
