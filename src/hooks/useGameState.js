import { useReducer, useEffect } from 'react'
import { STORAGE_KEY, TOTAL_ROUNDS } from '../constants'
import { calculateRoundScore, computeCumulativeScores } from '../engine/scoring'

const initialState = {
  phase: 'setup',
  players: [],
  currentRound: 1,
  rounds: [],
  cumulativeScores: {},
  prevCumulativeScores: {},
}

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const players = action.players.map((name, i) => ({ id: `p${i}`, name: name.trim() }))
      const cumulativeScores = {}
      players.forEach(p => { cumulativeScores[p.id] = 0 })
      return { ...initialState, phase: 'playing', players, cumulativeScores, prevCumulativeScores: {} }
    }

    case 'SUBMIT_ROUND': {
      const { entries, roundNumber } = action
      const scoredEntries = entries.map(entry => ({
        ...entry,
        score: calculateRoundScore(entry, roundNumber).total,
      }))
      const newRound = { round: roundNumber, entries: scoredEntries }
      const newRounds = [...state.rounds, newRound]
      const newCumulative = computeCumulativeScores(state.players, newRounds)
      const isLastRound = roundNumber >= TOTAL_ROUNDS

      return {
        ...state,
        rounds: newRounds,
        cumulativeScores: newCumulative,
        prevCumulativeScores: { ...state.cumulativeScores },
        currentRound: isLastRound ? state.currentRound : state.currentRound + 1,
        phase: isLastRound ? 'gameover' : 'playing',
      }
    }

    case 'NEW_GAME':
      return initialState

    default:
      return state
  }
}

export function useGameState() {
  const saved = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })()

  const [state, dispatch] = useReducer(reducer, saved ?? initialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const startGame = (players) => dispatch({ type: 'START_GAME', players })
  const submitRound = (entries, roundNumber) => dispatch({ type: 'SUBMIT_ROUND', entries, roundNumber })
  const newGame = () => dispatch({ type: 'NEW_GAME' })

  return { state, startGame, submitRound, newGame }
}
