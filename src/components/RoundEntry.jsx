import { useState, useEffect } from 'react'
import { calculateRoundScore } from '../engine/scoring'

function clamp(val, min, max) {
  const n = parseInt(val, 10)
  if (isNaN(n)) return 0
  return Math.max(min, Math.min(max, n))
}

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
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm flex items-center justify-center"
        >−</button>
        <span className="w-6 text-center text-white font-mono text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-6 h-6 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm flex items-center justify-center"
        >+</button>
      </div>
    </div>
  )
}

export default function RoundEntry({ players, roundNumber, onSubmit }) {
  const initEntry = () =>
    players.map(p => ({ playerId: p.id, bid: 0, tricks: 0, bonusPirates: 0, bonusMermaids: 0 }))

  const [entries, setEntries] = useState(initEntry)
  const [showBonus, setShowBonus] = useState({})
  const [warning, setWarning] = useState('')

  useEffect(() => {
    setEntries(initEntry())
    setShowBonus({})
    setWarning('')
  }, [roundNumber])

  const update = (i, field, value) => {
    const next = [...entries]
    next[i] = { ...next[i], [field]: value }
    setEntries(next)
  }

  const previews = entries.map(e => calculateRoundScore(e, roundNumber))
  const totalTricks = entries.reduce((s, e) => s + e.tricks, 0)

  const handleSubmit = () => {
    if (totalTricks !== roundNumber) {
      setWarning(`各玩家已取墩数之和为 ${totalTricks}，本轮共 ${roundNumber} 墩。确认继续？`)
      return
    }
    setWarning('')
    onSubmit(entries)
  }

  const forceSubmit = () => {
    setWarning('')
    onSubmit(entries)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-xl">第 {roundNumber} 轮</h2>
          <p className="text-slate-400 text-xs">本轮共 {roundNumber} 墩</p>
        </div>
        <div className="text-slate-500 text-sm">取墩数合计：
          <span className={totalTricks === roundNumber ? 'text-emerald-400' : 'text-amber-400'}>
            {totalTricks}/{roundNumber}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {players.map((player, i) => {
          const entry = entries[i]
          const preview = previews[i]
          const hasBonus = showBonus[player.id]

          return (
            <div key={player.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{player.name}</span>
                <ScoreBadge {...preview} />
              </div>

              <div className="flex gap-4 flex-wrap">
                <NumberInput
                  label="叫墩"
                  value={entry.bid}
                  onChange={v => update(i, 'bid', v)}
                  min={0}
                  max={roundNumber}
                />
                <NumberInput
                  label="取墩"
                  value={entry.tricks}
                  onChange={v => update(i, 'tricks', v)}
                  min={0}
                  max={roundNumber}
                />

                {hasBonus ? (
                  <>
                    <NumberInput
                      label="🏴‍☠️×30"
                      value={entry.bonusPirates}
                      onChange={v => update(i, 'bonusPirates', v)}
                      min={0}
                      max={5}
                    />
                    <NumberInput
                      label="🧜×20"
                      value={entry.bonusMermaids}
                      onChange={v => update(i, 'bonusMermaids', v)}
                      min={0}
                      max={5}
                    />
                    <button
                      onClick={() => setShowBonus(s => ({ ...s, [player.id]: false }))}
                      className="self-end text-xs text-slate-500 hover:text-slate-400 pb-1"
                    >隐藏</button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowBonus(s => ({ ...s, [player.id]: true }))}
                    className="self-end text-xs text-purple-400 hover:text-purple-300 pb-1"
                  >+ 骷髅王奖励</button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {warning && (
        <div className="bg-amber-900/30 border border-amber-700/50 rounded-xl p-3 text-amber-300 text-sm">
          <p className="mb-2">{warning}</p>
          <div className="flex gap-2">
            <button
              onClick={forceSubmit}
              className="px-3 py-1 bg-amber-700/50 hover:bg-amber-600/50 rounded-lg text-white text-xs"
            >确认提交</button>
            <button
              onClick={() => setWarning('')}
              className="px-3 py-1 text-xs text-slate-400 hover:text-slate-300"
            >返回修改</button>
          </div>
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
