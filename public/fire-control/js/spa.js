// Self-propelled artillery. Only what official patch notes state is recorded
// here. SPAs aim with barrel elevation plus terrain elevation (Update 19), so
// the static MIL tables do not apply and no elevation is calculated for them.
const SPA_VEHICLES = [
  { id: 'sherman105', name: 'Sherman M4A3 105', faction: 'United States' },
  { id: 'brummbar', name: 'Sturmpanzer IV Brummbär', faction: 'Germany' },
  { id: 'panzer3n', name: 'Panzer III Ausf. N', faction: 'Afrika Korps' },
  { id: 'kv2', name: 'KV-2', faction: 'Soviet Union' },
  { id: 'avre', name: 'Churchill A.V.R.E.', faction: 'Great Britain' },
  // Patch 19.1: range raised to 800 m, and facing up a slope can extend it.
  { id: 'bishop', name: 'Bishop', faction: 'British 8th Army', maxRange: 800 },
]

// A sensible first pick for the side's faction. The player chooses the real one.
function defaultSpa(map, side) {
  const team = side === 'allies' ? map.teams.allies : map.teams.axis
  const profile = map.profiles[side]
  if (team === 'Afrika Korps') return 'panzer3n'
  if (team === 'British 8th Army') return 'bishop'
  return { US: 'sherman105', GER: 'brummbar', RUS: 'kv2', GB: 'avre', CAN: 'avre' }[profile]
}
