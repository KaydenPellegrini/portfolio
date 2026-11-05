// Self-propelled artillery. SPAs aim with barrel elevation (yellow) plus the
// vehicle's terrain elevation (red), so the static MIL tables do not apply.
//
// Elevation model adapted from an MIT licensed community SPA calculator (see
// REFERENCE-LICENSE.txt), built from game ballistics and in-game measurements
// for Update 21. It is a community model, not official data. Each vehicle has
// measured rows of [world MIL, metres]; past the last row a fitted "tail law"
// carries the curve to the vehicle's maximum range.

const SPA_MIL_DEG = 0.05625

const SPA_VEHICLES = [
  {
    id: 'sherman105',
    name: 'Sherman M4A3 105',
    faction: 'United States',
    rows: [[-89, 23], [-50, 35], [-16, 55], [5, 75], [25, 101], [40, 122], [55, 145], [70, 168], [85, 194],
      [100, 221], [116, 241], [166, 311], [233, 406], [300, 507], [366, 598],
      [400, 644], [424, 676], [448, 702], [466, 719]],
    tail: { maxM: 600, capDeg: 20.6 },
    turretMil: [-89, 466],
    minDistance: 23,
  },
  {
    id: 'brummbar',
    name: 'Sturmpanzer IV Brummbär',
    faction: 'Germany',
    rows: [[-89, 18], [-50, 29], [-16, 48], [5, 67], [25, 92], [40, 115], [55, 139], [70, 164], [85, 190],
      [100, 218], [117, 237], [188, 311], [260, 387], [331, 466], [364, 500], [366, 508],
      [398, 535], [422, 557], [446, 585], [464, 600]],
    tail: { maxM: 500, capDeg: 20.6 },
    turretMil: [-89, 466],
    minDistance: 18,
  },
  {
    id: 'panzer3n',
    name: 'Panzer III Ausf. N',
    faction: 'Afrika Korps',
    rows: [[-87, 18], [-49, 28], [-14, 48], [7, 68], [25, 92], [41, 114], [51, 131], [58, 142], [66, 153],
      [74, 168], [82, 181], [90, 196], [98, 211], [106, 222], [113, 228], [120, 237], [129, 242],
      [137, 251], [146, 264], [153, 272], [163, 282], [170, 289], [203, 324], [252, 377],
      [302, 430], [353, 486], [403, 539], [453, 591], [469, 605]],
    tail: { maxM: 500, capDeg: 20.6 },
    turretMil: [-89, 466],
    minDistance: 18,
  },
  {
    id: 'kv2',
    name: 'KV-2',
    faction: 'Soviet Union',
    rows: [[-89, 22], [-50, 35], [-16, 55], [5, 75], [25, 99], [40, 122], [55, 143], [70, 168], [85, 191],
      [99, 217], [116, 241], [166, 311], [233, 406], [300, 507], [367, 601],
      [403, 648], [426, 676], [451, 703], [466, 720]],
    tail: { maxM: 600, capDeg: 20.6 },
    turretMil: [-89, 466],
    minDistance: 22,
  },
  {
    id: 'avre',
    name: 'Churchill A.V.R.E.',
    faction: 'Great Britain',
    rows: [[-89, 17], [-20, 35], [10, 48], [82, 98], [100, 114], [110, 124], [120, 132], [131, 142],
      [141, 150], [152, 161], [162, 171], [173, 179], [183, 189], [194, 197], [204, 206], [215, 217],
      [225, 225], [235, 234], [246, 245], [256, 255], [281, 274], [301, 293], [330, 315], [345, 326], [356, 334]],
    tail: { maxM: 250, capDeg: 14.42 },
    turretMil: [-89, 356],
    minDistance: 17,
  },
  {
    id: 'bishop',
    name: 'Bishop',
    faction: 'British 8th Army',
    rows: [[-89, 19], [-50, 32], [-16, 61], [5, 100], [25, 148], [40, 194], [50, 232], [58, 278], [65, 304],
      [73, 338], [81, 381], [89, 424], [97, 459], [105, 500], [112, 535], [120, 573], [128, 611],
      [136, 655], [144, 695], [151, 730], [159, 769], [167, 810], [200, 955], [267, 1238]],
    tail: { maxM: 800, capDeg: 9.4 },
    turretMil: [-89, 267],
    minDistance: 19,
  },
]

// The red terrain number the HUD can show, at most a full slope either way.
const SPA_TERRAIN_LIMIT = 356

function spaVehicle(id) {
  return SPA_VEHICLES.find((v) => v.id === id) || null
}

// World elevation (barrel plus terrain) in MIL to ground distance in metres.
function spaForwardMetres(vehicle, mil) {
  const rows = vehicle.rows
  if (mil <= rows[0][0]) return rows[0][1]
  const last = rows[rows.length - 1]
  if (mil <= last[0]) {
    for (let i = 0; i < rows.length - 1; i++) {
      const [m1, r1] = rows[i]
      const [m2, r2] = rows[i + 1]
      if (mil <= m2) return r1 + ((mil - m1) / (m2 - m1)) * (r2 - r1)
    }
  }
  // Tail law: I(t) = 5 cos t + C sin 2t, with C fitted so the curve peaks at maxM.
  const rad = (deg) => (deg * Math.PI) / 180
  const cap = rad(vehicle.tail.capDeg)
  const C = (vehicle.tail.maxM - 5 * Math.cos(cap)) / (1.005 * Math.sin(2 * cap))
  const I = (t) => 5 * Math.cos(t) + C * Math.sin(2 * t)
  return last[1] + I(rad(mil * SPA_MIL_DEG)) - I(rad(last[0] * SPA_MIL_DEG))
}

// Ground distance to world elevation, by bisection over the model.
function spaWorldMil(vehicle, metres) {
  const f = (mil) => spaForwardMetres(vehicle, mil) - metres
  let lo = -89
  let hi = 800
  if (f(lo) >= 0) return lo
  if (f(hi) <= 0) return hi
  for (let i = 0; i < 60 && hi - lo >= 1e-4; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

// Reach on the current terrain: the shortest and furthest shots the turret allows.
function spaReach(vehicle, terrain) {
  return {
    min: spaForwardMetres(vehicle, vehicle.turretMil[0] + terrain),
    max: spaForwardMetres(vehicle, vehicle.turretMil[1] + terrain),
  }
}

// The barrel (yellow) setting for a distance and the red terrain number.
// Never returns a setting the turret cannot reach.
function spaSolution(vehicle, distance, terrain) {
  if (!vehicle || !Number.isFinite(distance) || !Number.isFinite(terrain)) return { status: 'missing' }
  if (Math.abs(terrain) > SPA_TERRAIN_LIMIT) return { status: 'badTerrain' }
  const reach = spaReach(vehicle, terrain)
  if (distance < vehicle.minDistance) return { status: 'tooClose', reach }
  // 800 MIL is 45 degrees, the top of the model; past it the solve would clamp.
  if (distance > spaForwardMetres(vehicle, 800)) return { status: 'beyond', reach }
  const barrel = Math.round(spaWorldMil(vehicle, distance) - terrain)
  if (barrel > vehicle.turretMil[1] || distance > reach.max + 0.5) return { status: 'beyond', reach }
  if (barrel < vehicle.turretMil[0]) return { status: 'belowTurret', reach }
  return { status: 'ok', barrel, reach }
}

// A sensible first pick for the side's faction. The player chooses the real one.
function defaultSpa(map, side) {
  const team = side === 'allies' ? map.teams.allies : map.teams.axis
  const profile = map.profiles[side]
  if (team === 'Afrika Korps') return 'panzer3n'
  if (team === 'British 8th Army') return 'bishop'
  return { US: 'sherman105', GER: 'brummbar', RUS: 'kv2', GB: 'avre', CAN: 'avre' }[profile]
}
