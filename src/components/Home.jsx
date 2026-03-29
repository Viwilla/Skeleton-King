import { useState } from 'react'

export default function Home({ onCreate, onJoin, loading, error }) {
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    if (mode === 'create') onCreate(name)
    else if (mode === 'join' && code.trim()) onJoin(code, name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">💀</div>
          <h1 className="text-4xl font-bold text-white mb-1">骷髅王</h1>
          <p className="text-purple-300 text-sm tracking-widest uppercase">Skull King · 联机计分</p>
        </div>

        {!mode ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setMode('create')}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold rounded-2xl text-lg shadow-lg shadow-purple-900/40 transition-all"
            >
              🎲 创建房间
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-4 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-bold rounded-2xl text-lg transition-all"
            >
              🚪 加入房间
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800/80 backdrop-blur border border-purple-800/40 rounded-2xl p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-slate-500 text-sm mb-4 flex items-center gap-1"
            >
              ← 返回
            </button>

            <h2 className="text-white font-bold text-lg mb-4">
              {mode === 'create' ? '创建新房间' : '加入房间'}
            </h2>

            {mode === 'join' && (
              <div className="mb-3">
                <label className="text-slate-400 text-xs mb-1 block">房间码</label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="输入5位房间码"
                  maxLength={5}
                  className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-lg font-mono tracking-widest text-center uppercase"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="text-slate-400 text-xs mb-1 block">你的名字</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="输入你的名字"
                maxLength={20}
                autoFocus
                className="w-full bg-slate-700/60 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

            <button
              type="submit"
              disabled={loading || !name.trim() || (mode === 'join' && !code.trim())}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-40 active:scale-95"
            >
              {loading ? '请稍候...' : mode === 'create' ? '创建' : '加入'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
