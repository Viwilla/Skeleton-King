export default function Lobby({ room, players, myPlayer, onStart, onLeave }) {
  const isHost = players[0]?.id === myPlayer?.id
  const canStart = players.length >= 2

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💀</div>
          <h1 className="text-2xl font-bold text-white">等待玩家加入</h1>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-slate-400 text-sm">房间码</span>
            <span className="font-mono text-2xl font-bold text-purple-400 tracking-widest">{room?.code}</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">将房间码分享给其他玩家</p>
        </div>

        <div className="bg-slate-800/80 backdrop-blur border border-purple-800/40 rounded-2xl p-5 shadow-2xl mb-4">
          <h2 className="text-slate-400 text-xs uppercase tracking-wider mb-3">
            玩家 ({players.length}/8)
          </h2>
          <div className="space-y-2">
            {players.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-purple-400 text-sm w-5">{i + 1}</span>
                <span className="text-white flex-1">{p.name}</span>
                {p.id === myPlayer?.id && (
                  <span className="text-xs text-purple-400 bg-purple-900/40 px-2 py-0.5 rounded-full">你</span>
                )}
                {i === 0 && (
                  <span className="text-xs text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full">房主</span>
                )}
              </div>
            ))}
          </div>

          {players.length < 2 && (
            <p className="text-slate-500 text-xs mt-3 text-center">至少需要2名玩家才能开始</p>
          )}
        </div>

        {isHost ? (
          <button
            onClick={onStart}
            disabled={!canStart}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold rounded-2xl text-lg shadow-lg shadow-purple-900/40 transition-all disabled:opacity-40"
          >
            开始游戏
          </button>
        ) : (
          <div className="text-center text-slate-500 text-sm py-4">
            等待房主开始游戏...
          </div>
        )}

        <button
          onClick={onLeave}
          className="w-full mt-3 py-2 text-slate-500 text-sm active:text-slate-300"
        >
          离开房间
        </button>
      </div>
    </div>
  )
}
