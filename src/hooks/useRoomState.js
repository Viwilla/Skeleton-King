import { useState, useEffect, useCallback } from 'react'
import { supabase, getDeviceId, generateRoomCode } from '../lib/supabase'
import { calculateRoundScore } from '../engine/scoring'

export function useRoomState() {
  const [phase, setPhase] = useState('home') // home | lobby | playing | gameover
  const [room, setRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [myPlayer, setMyPlayer] = useState(null)
  const [roundEntries, setRoundEntries] = useState([]) // all entries for current game
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const deviceId = getDeviceId()

  // Re-hydrate from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('skull_room')
    if (saved) {
      try {
        const { roomId, playerId } = JSON.parse(saved)
        rejoinRoom(roomId, playerId)
      } catch {
        localStorage.removeItem('skull_room')
      }
    }
  }, [])

  async function rejoinRoom(roomId, playerId) {
    const { data: roomData } = await supabase.from('rooms').select('*').eq('id', roomId).single()
    if (!roomData || roomData.status === 'finished') {
      localStorage.removeItem('skull_room')
      return
    }
    const { data: playerData } = await supabase.from('players').select('*').eq('id', playerId).single()
    if (!playerData) { localStorage.removeItem('skull_room'); return }

    setRoom(roomData)
    setMyPlayer(playerData)
    setPhase(roomData.status === 'waiting' ? 'lobby' : roomData.status === 'playing' ? 'playing' : 'gameover')
    await refreshPlayers(roomId)
    await refreshEntries(roomId)
  }

  async function refreshPlayers(roomId) {
    const { data } = await supabase.from('players').select('*').eq('room_id', roomId).order('created_at')
    if (data) setPlayers(data)
  }

  async function refreshEntries(roomId) {
    const { data } = await supabase.from('round_entries').select('*').eq('room_id', roomId)
    if (data) setRoundEntries(data)
  }

  // Subscribe to realtime changes
  useEffect(() => {
    if (!room) return

    const channel = supabase.channel(`room:${room.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${room.id}` },
        (payload) => {
          const updated = payload.new
          setRoom(updated)
          if (updated.status === 'playing') setPhase('playing')
          if (updated.status === 'finished') setPhase('gameover')
        }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${room.id}` },
        () => refreshPlayers(room.id)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'round_entries', filter: `room_id=eq.${room.id}` },
        () => refreshEntries(room.id)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [room?.id])

  const createRoom = useCallback(async (hostName) => {
    setLoading(true)
    setError('')
    try {
      const code = generateRoomCode()
      const { data: roomData, error: roomErr } = await supabase
        .from('rooms').insert({ code, status: 'waiting' }).select().single()
      if (roomErr) throw roomErr

      const { data: playerData, error: playerErr } = await supabase
        .from('players').insert({ room_id: roomData.id, name: hostName.trim(), device_id: deviceId }).select().single()
      if (playerErr) throw playerErr

      localStorage.setItem('skull_room', JSON.stringify({ roomId: roomData.id, playerId: playerData.id }))
      setRoom(roomData)
      setMyPlayer(playerData)
      setPlayers([playerData])
      setPhase('lobby')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  const joinRoom = useCallback(async (code, playerName) => {
    setLoading(true)
    setError('')
    try {
      const { data: roomData, error: roomErr } = await supabase
        .from('rooms').select('*').eq('code', code.trim().toUpperCase()).single()
      if (roomErr || !roomData) throw new Error('找不到该房间')
      if (roomData.status !== 'waiting') throw new Error('游戏已经开始')

      const { data: playerData, error: playerErr } = await supabase
        .from('players').insert({ room_id: roomData.id, name: playerName.trim(), device_id: deviceId }).select().single()
      if (playerErr) throw playerErr

      localStorage.setItem('skull_room', JSON.stringify({ roomId: roomData.id, playerId: playerData.id }))
      setRoom(roomData)
      setMyPlayer(playerData)
      setPhase('lobby')
      await refreshPlayers(roomData.id)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [deviceId])

  const startGame = useCallback(async () => {
    if (!room) return
    const { error } = await supabase.from('rooms').update({ status: 'playing', current_round: 1 }).eq('id', room.id)
    if (!error) {
      setRoom(r => ({ ...r, status: 'playing', current_round: 1 }))
      setPhase('playing')
    }
  }, [room])

  const submitRound = useCallback(async (entries, roundNumber) => {
    if (!room) return
    setLoading(true)
    try {
      const rows = entries.map(entry => ({
        room_id: room.id,
        player_id: entry.playerId,
        round_number: roundNumber,
        bid: entry.bid,
        tricks: entry.tricks,
        bonus_pirates: entry.bonusPirates || 0,
        bonus_mermaids: entry.bonusMermaids || 0,
        score: calculateRoundScore(entry, roundNumber).total,
      }))

      const { error: insertErr } = await supabase.from('round_entries').upsert(rows, {
        onConflict: 'room_id,player_id,round_number'
      })
      if (insertErr) throw insertErr

      await refreshEntries(room.id)

      const isLastRound = roundNumber >= 10
      if (isLastRound) {
        await supabase.from('rooms').update({ status: 'finished' }).eq('id', room.id)
        setRoom(r => ({ ...r, status: 'finished' }))
        setPhase('gameover')
      } else {
        const nextRound = roundNumber + 1
        await supabase.from('rooms').update({ current_round: nextRound }).eq('id', room.id)
        setRoom(r => ({ ...r, current_round: nextRound }))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [room])

  const newGame = useCallback(() => {
    localStorage.removeItem('skull_room')
    setRoom(null)
    setMyPlayer(null)
    setPlayers([])
    setRoundEntries([])
    setPhase('home')
  }, [])

  // Compute cumulative scores from roundEntries
  const cumulativeScores = {}
  const prevCumulativeScores = {}
  const currentRound = room?.current_round ?? 1

  players.forEach(p => {
    cumulativeScores[p.id] = 0
    prevCumulativeScores[p.id] = 0
  })
  roundEntries.forEach(e => {
    if (cumulativeScores[e.player_id] !== undefined) {
      if (e.round_number < currentRound) {
        prevCumulativeScores[e.player_id] = (prevCumulativeScores[e.player_id] || 0) + e.score
      }
      cumulativeScores[e.player_id] = (cumulativeScores[e.player_id] || 0) + e.score
    }
  })

  return {
    phase, room, players, myPlayer, roundEntries,
    currentRound, cumulativeScores, prevCumulativeScores,
    loading, error,
    createRoom, joinRoom, startGame, submitRound, newGame,
  }
}
