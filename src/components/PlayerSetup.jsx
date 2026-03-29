import { useState, useRef } from 'react'
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants'

export default function PlayerSetup({ onStart }) {
  const [names, setNames] = useState(['', ''])
  const inputRefs = useRef([])

  const updateName = (i, value) => {
    const next = [...names]
    next[i] = value
    setNames(next)
  }

  const addPlayer = () => {
    if (names.length >= MAX_PLAYERS) return
    setNames([...names, ''])
    setTimeout(() => inputRefs.current[names.length]?.focus(), 50)
  }

  const removePlayer = (i) => {
    if (names.length <= MIN_PLAYERS) return
    setNames(names.filter((_, idx) => idx !== i))
  }

  const handleKeyDown = (e, i) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (i === names.length - 1) addPlayer()
      else inputRefs.current[i + 1]?.focus()
    }
  }

  const trimmed = names.map(n => n.trim())
  const hasDuplicates = new Set(trimmed.filter(Boolean)).size < trimmed.filter(Boolean).length
  const isValid = trimmed.every(n => n.length > 0) && !hasDuplicates && trimmed.length >= MIN_PLAYERS

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💀</div>
          <h1 className="text-4xl font-bold text-white mb-1">骷髅王</h1>
          <p className="text-purple-300 text-sm tracking-widest uppercase">Skull King · 计分系统</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/80 backdrop-blur border border-purple-800/40 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-white font-semibold text-lg mb-4">添加玩家 ({names.length}/{MAX_PLAYERS})</h2>

          <div className="space-y-2 mb-4">
            {names.map((name, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-purple-400 w-5 text-center text-sm font-mono">{i + 1}</span>
                <input
                  ref={el => (inputRefs.current[i] = el)}
                  type="text"
                  value={name}
                  onChange={e => updateName(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(e, i)}
                  placeholder={`玩家 ${i + 1}`}
                  maxLength={20}
                  className="flex-1 bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                />
                {names.length > MIN_PLAYERS && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-slate-500 hover:text-red-400 transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-400/10"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {hasDuplicates && (
            <p className="text-red-400 text-xs mb-3">玩家名称不能重复</p>
          )}

          <button
            onClick={addPlayer}
            disabled={names.length >= MAX_PLAYERS}
            className="w-full py-2 text-sm text-purple-300 border border-dashed border-purple-700 rounded-lg hover:bg-purple-800/20 hover:border-purple-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-4"
          >
            + 添加玩家
          </button>

          <button
            onClick={() => onStart(names)}
            disabled={!isValid}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-purple-900/40 active:scale-95"
          >
            开始游戏
          </button>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">{MIN_PLAYERS}–{MAX_PLAYERS} 名玩家 · 共 10 轮</p>
      </div>
    </div>
  )
}
