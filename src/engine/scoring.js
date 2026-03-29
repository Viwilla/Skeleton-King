/**
 * Pure scoring engine for Skull King
 *
 * Scoring rules:
 * - Bid 0, win 0 tricks: +10 × round
 * - Bid 0, win any tricks: -10 × round
 * - Bid N>0, win exactly N: +20 × N
 * - Bid N>0, win ≠ N: -10 × |won - bid|
 * - Bonus: Skull King captured by pirate: +30 per pirate
 * - Bonus: Mermaid escapes Skull King: +20 per mermaid
 */

export function calculateRoundScore({ bid, tricks, bonusPirates = 0, bonusMermaids = 0 }, roundNumber) {
  let base = 0

  if (bid === 0) {
    base = tricks === 0 ? 10 * roundNumber : -10 * roundNumber
  } else {
    base = tricks === bid ? 20 * bid : -10 * Math.abs(tricks - bid)
  }

  const bonus = 30 * bonusPirates + 20 * bonusMermaids

  return { base, bonus, total: base + bonus }
}

export function computeCumulativeScores(players, rounds) {
  const totals = {}
  players.forEach(p => { totals[p.id] = 0 })

  rounds.forEach(round => {
    round.entries.forEach(entry => {
      totals[entry.playerId] = (totals[entry.playerId] || 0) + entry.score
    })
  })

  return totals
}

export function buildLeaderboard(players, cumulativeScores, prevCumulativeScores = null) {
  const ranked = [...players]
    .map(p => ({
      ...p,
      score: cumulativeScores[p.id] ?? 0,
      prevScore: prevCumulativeScores ? (prevCumulativeScores[p.id] ?? 0) : null,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (prevCumulativeScores && b.prevScore !== a.prevScore) return b.prevScore - a.prevScore
      return a.name.localeCompare(b.name)
    })

  return ranked.map((p, i) => ({ ...p, rank: i + 1 }))
}
