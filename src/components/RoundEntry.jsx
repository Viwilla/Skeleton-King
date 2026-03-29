import { useState, useEffect } from 'react'
import { calculateRoundScore } from '../engine/scoring'

function ScoreBadge({ base, bonus, total }) {
  const color = total > 0 ? 'text-emerald-400' : total < 0 ? 'text-red-400' : 'text-slate-400'
  return (
    <span className={`font-mono font-bold text-sm ${color}`}>
      {total > 0 ? '+' : ''}{total}
      {bonus > 0 && <span className="text-amber-400 text-xs ml-1">(+{bonus})</span>}
    </span>
  )
}

function NumberInput({ value, onChange, min = 0, max, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-slate-500 text-xs">{label}</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-300 text-lg flex items-center justify-center select-none">−</button>
        <span className="w-8 text-center text-white font-mono text-base">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-lg bg-slate-700 active:bg-slate-600 text-slate-300 text-lg flex items-center justify-center select-none">+</button>
      </div>
    </div>
  )
}

export default function RoundEntry({ players, roundNumber, onSubmit, myPlayerId }) {
  const myPlayer = players.find(p => p.id === myPlayerId) || players[0]

  const [entry, setEntry] = useState({ playerId: myPlayer?.id, bid: 0, tricks: 0, bonusPirates: 0, bonusMermaids: 0 })
  const [showBonus, setShowBonus] = useState(false)
  const [warning, setWarning] = useState('')

  useEffect(() => {
    if (myPlayer) setEntry({ playerId: myPlayer.id, bid: 0, tricks: 0, bonusPirates: 0, bonusMermaids: 0 })
    setShowBonus(false)
    setWarning('')
  }, [roundNumber, myPlayer?.id])

  const update = (field, value) => setEntry(prev => ({ ...prev, [field]: value }))
  const preview = calculateRoundScore(entry, roundNumber)

  const handleSubmit = () => {
    // Submit only my own entry; host submits for all via the single entry
    onSubmit([entry])
  }

  if (!myPlayer) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">第 {roundNumber} 轮</h2>
          <p className="text-slate-400 text-xs">本轮共 {roundNumber} 墩 · 录入你的得分</p>
        </div>
      </div>

      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold">{myPlayer.name}</span>
          <ScoreBadge {...preview} />
        </div>

        <div className="flex gap-4 flex-wrap">
          <NumberInput label="叫墩" value={entry.bid} onChange={v => update('bid', v)} min={0} max={roundNumber} />
          <NumberInput label="取墩" value={entry.tricks} onChange={v => update('tricks', v)} min={0} max={roundNumber} />
          {showBonus ? (
            <>
              <NumberInput label="🏴‍☠️×30" value={entry.bonusPirates} onChange={v => update('bonusPirates', v)} min={0} max={5} />
              <NumberInput label="🧜×20" value={entry.bonusMermaids} onChange={v => update('bonusMermaids', v)} min={0} max={5} />
              <button onClick={() => setShowBonus(false)} className="self-end text-xs text-slate-500 hover:text-slate-400 pb-1">隐藏</button>
            </>
          ) : (
            <button onClick={() => setShowBonus(true)} className="self-end text-xs text-purple-400 hover:text-purple-300 pb-1">+ 骷髅王奖励</button>
          )}
        </div>
      </div>

      {warning && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-amber-300 text-sm">
          <p>{warning}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/40 active:scale-95"
      >
        提交本轮得分
      </button>
    </div>
  )
}
