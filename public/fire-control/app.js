// Fire Control: pick a gun, mark a target, read off distance, azimuth and MIL.
// Depends on MAPS (js/maps.js), GARRISONS (js/garrisons.js), milFor,
// metresPerMil and FLIGHT_ESTIMATE (js/ballistics.js) and SPA_VEHICLES (js/spa.js).

const SVG_SIZE = 1000

const PROFILE_NAMES = {
  US: 'United States',
  GER: 'Germany',
  RUS: 'Soviet Union',
  GB: 'Great Britain',
  CAN: 'Canada',
}

// ---- Geometry ---------------------------------------------------------------
// Game units are centimetres with the origin at the map centre, x east, y north.
// The overlay is a 1000 by 1000 SVG with y down.

function extent(map) {
  const width = map.size[0] * 100
  const height = map.size[1] * 100
  return { left: -width / 2, top: height / 2, width, height }
}

function toSvg(map, point) {
  const e = extent(map)
  return {
    x: ((point.x - e.left) / e.width) * SVG_SIZE,
    y: ((e.top - point.y) / e.height) * SVG_SIZE,
  }
}

function toGame(map, svg) {
  const e = extent(map)
  return {
    x: e.left + (svg.x / SVG_SIZE) * e.width,
    y: e.top - (svg.y / SVG_SIZE) * e.height,
  }
}

// SVG units per metre along each axis.
function svgPerMetre(map) {
  return { x: SVG_SIZE / map.size[0], y: SVG_SIZE / map.size[1] }
}

// An SVG path for the ring between two radii (metres) around a game point.
// Drawn as two ellipses so a map with unequal sides still gives a true circle.
function ringPath(map, centre, innerMetres, outerMetres) {
  const c = toSvg(map, centre)
  const k = svgPerMetre(map)
  const ellipse = (r) => {
    const rx = r * k.x
    const ry = r * k.y
    return `M ${c.x - rx} ${c.y} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`
  }
  return ellipse(outerMetres) + (innerMetres > 0 ? ' ' + ellipse(innerMetres) : '')
}

function solve(gun, target, profile) {
  const dx = target.x - gun.x
  const dy = target.y - gun.y
  const distance = Math.round(Math.hypot(dx, dy) / 100)
  const bearing = Math.floor(((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360)
  return { distance, bearing, mil: profile ? milFor(distance, profile) : null }
}

// ---- Grid callouts ------------------------------------------------------------
// The tactical map is a 10 by 10 grid over the whole image: columns A to J run
// west to east, rows 1 to 10 north to south. Each square splits into a 3 by 3
// keypad. How the game numbers those keypad cells is a crew setting until it is
// confirmed in game: 'phone' puts 1 top left, 'numpad' puts 7 top left.

const GRID = 10
const GRID_LETTERS = 'ABCDEFGHIJ'

function gridRef(map, point) {
  const e = extent(map)
  const fx = (point.x - e.left) / e.width
  const fy = (e.top - point.y) / e.height
  if (!(fx >= 0 && fx <= 1 && fy >= 0 && fy <= 1)) return null
  // A point exactly on the far edge belongs to the last square.
  const col = Math.min(GRID - 1, Math.floor(fx * GRID))
  const row = Math.min(GRID - 1, Math.floor(fy * GRID))
  const kpCol = Math.min(2, Math.floor((fx * GRID - col) * 3))
  const kpRow = Math.min(2, Math.floor((fy * GRID - row) * 3))
  return { square: `${GRID_LETTERS[col]}${row + 1}`, kpRow, kpCol }
}

function keypadNumber(ref, style) {
  if (style === 'phone') return ref.kpRow * 3 + ref.kpCol + 1
  if (style === 'numpad') return (2 - ref.kpRow) * 3 + ref.kpCol + 1
  return null
}

function callout(ref, style) {
  if (!ref) return 'Off map'
  const kp = keypadNumber(ref, style)
  return kp ? `${ref.square} kp ${kp}` : ref.square
}

function gunLabel(map, index) {
  const label = map.hqLabels?.[index]
  return label ? label.replace('HQ Gun', 'HQ gun') : `HQ gun ${index + 1}`
}

// ---- Shared fire missions ---------------------------------------------------
// A mission travels in the link's #fragment, so it never reaches the server.
// Example: #m=CAR&s=a&w=g&p=US&g=0&t=1520,-3410&f=knight

const CREW_NAMES = { knight: 'DarkKnight', pickle: 'PicklePoes', pansy: 'Pansy' }

function encodeMission(m) {
  const point = (p) => `${Math.round(p.x)},${Math.round(p.y)}`
  const params = new URLSearchParams({
    m: m.map,
    s: m.side === 'axis' ? 'x' : 'a',
    w: m.weapon === 'spa' ? 's' : 'g',
  })
  if (m.weapon === 'spa') {
    params.set('v', m.spa)
    params.set('r', String(Math.round(m.terrain || 0)))
  }
  else params.set('p', m.profile)
  params.set('g', m.gun === 'built' || m.weapon === 'spa' ? 'b' : String(m.gun))
  if (m.built) params.set('b', point(m.built))
  params.set('t', point(m.target))
  if (CREW_NAMES[m.from]) params.set('f', m.from)
  return params.toString()
}

// Returns the mission, or null if anything in the link is missing or wrong.
function decodeMission(fragment) {
  const params = new URLSearchParams(String(fragment).replace(/^#/, ''))
  const map = MAPS[params.get('m')]
  if (!map || !Object.hasOwn(MAPS, params.get('m'))) return null
  const side = { a: 'allies', x: 'axis' }[params.get('s')]
  const weapon = { g: 'static', s: 'spa' }[params.get('w')]
  if (!side || !weapon) return null

  const e = extent(map)
  const point = (raw) => {
    const parts = String(raw ?? '').split(',')
    if (parts.length !== 2) return null
    const [x, y] = parts.map(Number)
    const inside = x >= e.left && x <= e.left + e.width && y <= e.top && y >= e.top - e.height
    return Number.isFinite(x) && Number.isFinite(y) && inside ? { x, y } : null
  }
  const target = point(params.get('t'))
  const built = params.has('b') ? point(params.get('b')) : null
  if (!target || (params.has('b') && !built)) return null

  const mission = { map: params.get('m'), side, weapon, target, built, from: null }
  const from = params.get('f')
  if (Object.hasOwn(CREW_NAMES, from ?? '')) mission.from = from

  if (weapon === 'spa') {
    const spa = params.get('v')
    if (!SPA_VEHICLES.some((v) => v.id === spa) || !built) return null
    const rawTerrain = params.has('r') ? params.get('r') : '0'
    if (!/^-?\d+$/.test(rawTerrain)) return null
    const terrain = Number(rawTerrain)
    if (Math.abs(terrain) > SPA_TERRAIN_LIMIT) return null
    mission.spa = spa
    mission.terrain = terrain
    mission.gun = 'built'
    return mission
  }
  const profile = params.get('p')
  if (!Object.hasOwn(MIL_TABLES, profile ?? '')) return null
  mission.profile = profile
  const gun = params.get('g')
  if (gun === 'b') {
    if (!built) return null
    mission.gun = 'built'
  } else {
    const index = Number(gun)
    if (!Number.isInteger(index) || index < 0 || index >= map.guns[side].length || gun !== String(index)) return null
    mission.gun = index
  }
  return mission
}

// ---- Page -------------------------------------------------------------------

function init() {
  const el = (id) => document.getElementById(id)
  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(`fire-control:${key}`)
        return value === null ? fallback : JSON.parse(value)
      } catch {
        return fallback
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(`fire-control:${key}`, JSON.stringify(value))
      } catch {
        // Storage can be unavailable in private windows; the tool works without it.
      }
    },
  }

  const state = {
    map: store.get('map', 'CAR'),
    side: store.get('side', 'allies'),
    weapon: 'static', // 'static' or 'spa'
    profile: 'US',
    spa: null,
    spaTerrain: 0, // red MIL from the HUD
    spaDistance: null, // typed distance in metres; null uses the map
    gun: 0, // an HQ candidate index, or 'built'
    built: null,
    target: null,
    placing: false,
    zones: true,
    grid: store.get('grid', true),
    keypad: store.get('keypad', ''),
    crosshair: false,
    flight: store.get('flight', FLIGHT_ESTIMATE.default),
    shot: null, // { at, flight } for the countdown
    shownMil: null, // the elevation on screen now
    milFrom: null, // the elevation for the previous target, to call this one higher or lower
    view: { scale: 1, x: 0, y: 0, base: 0 },
  }
  if (!MAPS[state.map]) state.map = 'CAR'

  const current = () => MAPS[state.map]
  const hqGuns = () => current().guns[state.side]
  const isSpa = () => state.weapon === 'spa'
  const spa = () => spaVehicle(state.spa)

  // The distance the SPA solves for: typed, or measured on the map.
  function spaDistance() {
    if (state.spaDistance !== null) return state.spaDistance
    const gun = state.built
    return gun && state.target ? solve(gun, state.target, null).distance : null
  }
  const spaResult = () => spaSolution(spa(), spaDistance(), state.spaTerrain)
  const activeGun = () => {
    if (isSpa() || state.gun === 'built') return state.built
    return hqGuns()[state.gun]
  }

  for (const [key, map] of Object.entries(MAPS)) el('mapSelect').add(new Option(map.name, key))
  for (const [key, name] of Object.entries(PROFILE_NAMES)) el('profileSelect').add(new Option(name, key))
  for (const v of SPA_VEHICLES) el('spaSelect').add(new Option(`${v.name} (${v.faction})`, v.id))
  el('flight').value = state.flight
  el('gridToggle').checked = state.grid
  if (!['', 'phone', 'numpad'].includes(state.keypad)) state.keypad = ''
  el('keypadStyle').value = state.keypad
  el('flight').min = FLIGHT_ESTIMATE.min
  el('flight').max = FLIGHT_ESTIMATE.max

  function resetGuns() {
    state.gun = 0
    state.built = null
    state.placing = false
    state.shot = null
  }

  function chooseSide(side) {
    state.side = side
    state.profile = current().profiles[side]
    state.spa = defaultSpa(current(), side)
    resetGuns()
    store.set('side', side)
    render()
  }

  // ---- Rendering --------------------------------------------------------------

  function renderSetup() {
    const map = current()
    const spaMode = isSpa()
    el('mapSelect').value = state.map
    el('alliesTeam').textContent = map.teams.allies
    el('axisTeam').textContent = map.teams.axis
    for (const [id, on] of [
      ['allies', state.side === 'allies'],
      ['axis', state.side === 'axis'],
      ['weaponStatic', !spaMode],
      ['weaponSpa', spaMode],
    ]) {
      el(id).classList.toggle('selected', on)
      el(id).setAttribute('aria-pressed', String(on))
    }

    el('staticSetup').hidden = spaMode
    el('manual').hidden = spaMode
    el('spaSetup').hidden = !spaMode
    el('profileSelect').value = state.profile
    el('spaSelect').value = state.spa
    const vehicle = spa()
    if (vehicle) {
      const reach = spaReach(vehicle, Number.isFinite(state.spaTerrain) ? state.spaTerrain : 0)
      el('spaRange').textContent = `Reach on this terrain: ${Math.round(reach.min)} to ${Math.round(reach.max)} m.`
    }
    const distanceInput = el('spaDistance')
    if (document.activeElement !== distanceInput) {
      const d = spaDistance()
      distanceInput.value = d === null ? '' : String(d)
    }
    el('spaDistance').classList.toggle('from-map', state.spaDistance === null)

    const select = el('gunSelect')
    select.replaceChildren()
    hqGuns().forEach((_, index) => select.add(new Option(`Candidate ${gunLabel(map, index)}`, String(index))))
    if (state.built) select.add(new Option('Built gun', 'built'))
    select.value = String(state.gun)

    const placeLabel = spaMode ? 'SPA' : 'gun'
    for (const id of ['build', 'spaPlace']) {
      el(id).classList.toggle('active', state.placing)
      el(id).textContent = state.placing
        ? 'Cancel placement'
        : spaMode
          ? state.built
            ? 'Move the SPA'
            : 'Place the SPA'
          : 'Place a built gun'
    }
    el('modeHelp').textContent = state.placing
      ? `Tap the map to place the ${placeLabel}.`
      : 'Pick a candidate HQ gun or place your built one, then tap the map to mark the target.'
    el('mapInstruction').textContent = state.placing
      ? `Tap to place ${placeLabel}`
      : activeGun()
        ? 'Tap to set target'
        : `Place the ${placeLabel} first`

    el('legendGarrisons').hidden = !state.zones
    el('crosshair').hidden = !state.crosshair
    el('crosshairSet').hidden = !state.crosshair
    el('crosshairToggle').classList.toggle('active', state.crosshair)
    el('crosshairToggle').setAttribute('aria-pressed', String(state.crosshair))
    el('crosshairSet').textContent = state.placing ? `Place ${placeLabel} here` : 'Set target here'
  }

  function renderOverlay() {
    const map = current()
    const gun = activeGun()
    // Marks keep the same on-screen size at any zoom.
    const px = SVG_SIZE / (state.view.base || SVG_SIZE) / state.view.scale
    let svg = '<defs><clipPath id="mapClip"><rect width="1000" height="1000"/></clipPath></defs>'

    if (state.grid) {
      const cell = SVG_SIZE / GRID
      // Keypad lines only once zoomed in far enough to read them.
      if (state.view.scale >= 2.5) {
        for (let i = 0; i < GRID * 3; i++) {
          if (i % 3 === 0) continue
          const at = (i * cell) / 3
          svg += `<line class="keypad-line" x1="${at}" y1="0" x2="${at}" y2="${SVG_SIZE}"/>`
          svg += `<line class="keypad-line" x1="0" y1="${at}" x2="${SVG_SIZE}" y2="${at}"/>`
        }
      }
      for (let i = 1; i < GRID; i++) {
        const at = i * cell
        svg += `<line class="grid-line" x1="${at}" y1="0" x2="${at}" y2="${SVG_SIZE}"/>`
        svg += `<line class="grid-line" x1="0" y1="${at}" x2="${SVG_SIZE}" y2="${at}"/>`
      }
      for (let i = 0; i < GRID; i++) {
        const mid = (i + 0.5) * cell
        svg += `<text class="grid-label" x="${mid}" y="${14 * px}" font-size="${11 * px}">${GRID_LETTERS[i]}</text>`
        svg += `<text class="grid-label" x="${9 * px}" y="${mid + 4 * px}" font-size="${11 * px}">${i + 1}</text>`
      }
    }

    // Radial reach around the gun. This is range only, not traverse or cover.
    if (gun) {
      let inner = MIN_RANGE
      let outer = MAX_RANGE
      if (isSpa()) {
        const reach = spaReach(spa(), Number.isFinite(state.spaTerrain) ? state.spaTerrain : 0)
        inner = reach.min
        outer = reach.max
      }
      if (outer) svg += `<path class="reach" clip-path="url(#mapClip)" d="${ringPath(map, gun, inner, outer)}"/>`
    }

    if (state.zones) {
      GARRISONS[state.map][state.side].forEach((point, index) => {
        const p = toSvg(map, point)
        const s = 9 * px
        svg += `<g class="garrison"><rect x="${p.x - s}" y="${p.y - s}" width="${2 * s}" height="${2 * s}"/>
          <text x="${p.x}" y="${p.y + 3.5 * px}" font-size="${10 * px}">G${index + 1}</text></g>`
      })
    }

    if (gun && state.target) {
      const a = toSvg(map, gun)
      const b = toSvg(map, state.target)
      svg += `<line class="line-of-fire" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`
    }

    if (!isSpa()) {
      hqGuns().forEach((point, index) => {
        const p = toSvg(map, point)
        const active = state.gun === index
        svg += `<g class="gun candidate${active ? ' active' : ''}" data-gun="${index}">
          <circle class="hit" cx="${p.x}" cy="${p.y}" r="${20 * px}"/>
          <circle cx="${p.x}" cy="${p.y}" r="${(active ? 12 : 9) * px}"/>
          <text x="${p.x}" y="${p.y + 4 * px}" font-size="${11 * px}">${index + 1}</text></g>`
      })
    }

    if (state.built) {
      const p = toSvg(map, state.built)
      const active = isSpa() || state.gun === 'built'
      svg += `<g class="gun built${active ? ' active' : ''}" data-gun="built">
        <circle class="hit" cx="${p.x}" cy="${p.y}" r="${20 * px}"/>
        <circle cx="${p.x}" cy="${p.y}" r="${12 * px}"/>
        <text x="${p.x}" y="${p.y + 4 * px}" font-size="${11 * px}">${isSpa() ? 'S' : 'B'}</text></g>`
    }

    if (state.target) {
      const p = toSvg(map, state.target)
      const r = 12 * px
      const arm = 20 * px
      svg += `<g class="target"><circle cx="${p.x}" cy="${p.y}" r="${r}"/>
        <path d="M ${p.x - arm} ${p.y} h ${2 * arm} M ${p.x} ${p.y - arm} v ${2 * arm}"/></g>`
    }

    el('overlay').innerHTML = svg
  }

  // Elevation with a higher or lower mark against the previous target, so the
  // caller can say "lower" without reading both numbers.
  function showMil(mil) {
    const box = el('mil')
    state.shownMil = mil
    box.textContent = ''
    if (mil === null) {
      box.textContent = '-'
      return
    }
    const dir = state.milFrom === null ? 0 : Math.sign(mil - state.milFrom)
    if (dir) {
      const mark = document.createElement('span')
      mark.className = `mil-dir ${dir > 0 ? 'up' : 'down'}`
      mark.textContent = dir > 0 ? '▲' : '▼'
      mark.title = dir > 0 ? 'Higher than the last target' : 'Lower than the last target'
      box.append(mark, ' ')
    }
    box.append(String(mil))
  }

  // A new target: the elevation on screen becomes the one to compare against.
  // An out of range target keeps the last good number.
  function nextMilTarget() {
    if (state.shownMil !== null) state.milFrom = state.shownMil
  }

  // Forget the last elevation when it no longer applies, such as a new map or weapon.
  function resetMil() {
    state.shownMil = null
    state.milFrom = null
  }

  function renderSolution() {
    const map = current()
    const gun = activeGun()
    const spaMode = isSpa()
    const result = gun && state.target ? solve(gun, state.target, spaMode ? null : state.profile) : null
    const vehicle = spa()

    el('bearing').textContent = result ? `${result.bearing}°` : '-'

    let status
    let note = ''
    if (spaMode) {
      // The SPA solves from the typed or measured distance and the red terrain MIL.
      const distance = spaDistance()
      const spaOut = spaResult()
      el('distance').textContent = distance ?? '-'
      showMil(spaOut.status === 'ok' ? spaOut.barrel : null)
      const reachMax = spaOut.reach ? Math.round(spaOut.reach.max) : null
      status = {
        ok: 'Solution ready',
        missing: distance === null ? 'Enter a distance or mark the map' : 'Check the terrain number',
        badTerrain: `Terrain must be within ±${SPA_TERRAIN_LIMIT}`,
        tooClose: `Too close (minimum ${vehicle?.minDistance} m)`,
        beyond: `Beyond reach on this terrain (${reachMax} m)`,
        belowTurret: 'Below the turret’s lowest setting',
      }[spaOut.status]
      const terrain = Number.isFinite(state.spaTerrain) ? state.spaTerrain : 0
      note = `${vehicle?.name} · terrain ${terrain > 0 ? '+' : ''}${terrain} MIL · community model`
    } else {
      el('distance').textContent = result ? result.distance : '-'
      showMil(result?.mil ?? null)
      if (!gun) status = 'Select a gun'
      else if (!state.target) status = 'Awaiting target'
      else status = result.mil === null ? 'Out of range' : 'Solution ready'
      if (gun) {
        note = `${state.gun === 'built' ? 'Built gun' : 'Candidate ' + gunLabel(map, state.gun)} · ${PROFILE_NAMES[state.profile]} scale`
      }
    }
    el('status').textContent = status
    el('gunNote').textContent = note
    renderCallout(gun)

    const step = !spaMode && result?.mil != null ? metresPerMil(result.distance, state.profile) : null
    const was =
      state.shownMil !== null && state.milFrom !== null && state.shownMil !== state.milFrom
        ? `, was ${state.milFrom}`
        : ''
    el('milNote').textContent = spaMode
      ? `Barrel MIL${was}\n(yellow number)`
      : step
        ? `MIL${was}\n1 MIL ≈ ${step.toFixed(1)} m`
        : `MIL${was}`

    const manual = el('manualDistance').value
    const manualMil = manual === '' ? null : milFor(Number(manual), state.profile)
    el('manualResult').textContent = manual === '' ? '- MIL' : manualMil === null ? 'Out' : `${manualMil} MIL`

    el('fire').disabled = spaMode || !result || result.mil === null
    el('timerBox').hidden = spaMode
    renderTimer()
  }

  function renderKeypad(id, ref) {
    el(id)
      .querySelectorAll('i')
      .forEach((cell, index) => cell.classList.toggle('on', Boolean(ref) && index === ref.kpRow * 3 + ref.kpCol))
  }

  function renderCallout(gun) {
    const map = current()
    const target = state.target ? gridRef(map, state.target) : null
    const from = gun ? gridRef(map, gun) : null
    el('callout').hidden = !target && !from
    el('targetGrid').textContent = state.target ? callout(target, state.keypad) : '-'
    el('gunGrid').textContent = gun ? callout(from, state.keypad) : '-'
    renderKeypad('targetKp', target)
    renderKeypad('gunKp', from)
  }

  function renderTimer() {
    const out = el('timer')
    if (!state.shot) {
      out.textContent = `Splash est. ${state.flight} s`
      out.classList.remove('live', 'done')
      return
    }
    const left = state.shot.flight - (Date.now() - state.shot.at) / 1000
    out.classList.toggle('live', left > 0)
    out.classList.toggle('done', left <= 0)
    out.textContent = left > 0 ? `Splash in ${Math.ceil(left)} s` : 'Splash due (estimate)'
  }

  function render() {
    const map = current()
    el('mapTitle').textContent = map.name
    el('mapCode').textContent = state.map
    if (!el('mapImage').src.endsWith(map.image)) el('mapImage').src = map.image
    renderSetup()
    renderOverlay()
    renderSolution()
  }

  // ---- Map view: pan, pinch and wheel zoom ------------------------------------

  const viewport = el('viewport')
  const stage = el('stage')
  const MIN_SCALE = 1
  const MAX_SCALE = 6
  let overlayFrame = 0

  function clampView() {
    const v = state.view
    const w = viewport.clientWidth
    const h = viewport.clientHeight
    const size = v.base * v.scale
    v.x = size <= w ? (w - size) / 2 : Math.min(0, Math.max(w - size, v.x))
    v.y = size <= h ? (h - size) / 2 : Math.min(0, Math.max(h - size, v.y))
  }

  function applyView() {
    clampView()
    const v = state.view
    stage.style.width = `${v.base}px`
    stage.style.height = `${v.base}px`
    stage.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.scale})`
    el('zoomReset').textContent = `${Math.round(v.scale * 100)}%`
    // Marks are resized for the zoom; batch that to one redraw per frame.
    if (!overlayFrame)
      overlayFrame = requestAnimationFrame(() => {
        overlayFrame = 0
        renderOverlay()
      })
  }

  function fitView() {
    state.view.base = Math.min(viewport.clientWidth, viewport.clientHeight)
    state.view.scale = 1
    applyView()
  }

  // Zoom keeping the content under (cx, cy) in place. cx, cy are viewport pixels.
  function zoomAt(factor, cx, cy) {
    const v = state.view
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor))
    v.x = cx - ((cx - v.x) * next) / v.scale
    v.y = cy - ((cy - v.y) * next) / v.scale
    v.scale = next
    applyView()
  }

  const centre = () => ({ x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 })

  new ResizeObserver(() => {
    const v = state.view
    const nextBase = Math.min(viewport.clientWidth, viewport.clientHeight)
    if (!nextBase) return
    // Keep the same part of the map in view across a resize or rotation.
    const ratio = v.base ? nextBase / v.base : 1
    v.x *= ratio
    v.y *= ratio
    v.base = nextBase
    applyView()
  }).observe(viewport)

  const pointers = new Map()
  let gesture = null
  const TAP_SLOP = 8 // px a finger may wander and still count as a tap
  const TAP_TIME = 600 // ms

  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    try {
      viewport.setPointerCapture(event.pointerId)
    } catch {
      // Capture fails for a pointer the browser no longer tracks; carry on without it.
    }
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.size === 1) {
      gesture = {
        startX: event.clientX,
        startY: event.clientY,
        startT: performance.now(),
        viewX: state.view.x,
        viewY: state.view.y,
        moved: false,
        multi: false,
      }
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()]
      const rect = viewport.getBoundingClientRect()
      gesture.multi = true
      gesture.pinch = {
        distance: Math.hypot(b.x - a.x, b.y - a.y),
        mid: { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top },
        scale: state.view.scale,
        viewX: state.view.x,
        viewY: state.view.y,
      }
    }
  })

  viewport.addEventListener('pointermove', (event) => {
    if (!pointers.has(event.pointerId) || !gesture) return
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const v = state.view

    if (pointers.size >= 2 && gesture.pinch) {
      const [a, b] = [...pointers.values()]
      const rect = viewport.getBoundingClientRect()
      const p = gesture.pinch
      const mid = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top }
      const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, (p.scale * Math.hypot(b.x - a.x, b.y - a.y)) / p.distance))
      // The map point that was under the fingers stays under them.
      v.x = mid.x - ((p.mid.x - p.viewX) * scale) / p.scale
      v.y = mid.y - ((p.mid.y - p.viewY) * scale) / p.scale
      v.scale = scale
      applyView()
      return
    }

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    if (!gesture.moved && Math.hypot(dx, dy) > TAP_SLOP) gesture.moved = true
    if (gesture.moved) {
      v.x = gesture.viewX + dx
      v.y = gesture.viewY + dy
      applyView()
    }
  })

  function endPointer(event, cancelled) {
    if (!pointers.has(event.pointerId)) return
    pointers.delete(event.pointerId)
    if (!gesture) return
    if (pointers.size === 1) {
      // A pinch dropped to one finger: carry on panning from here, never tap.
      const [rest] = [...pointers.values()]
      gesture.startX = rest.x
      gesture.startY = rest.y
      gesture.viewX = state.view.x
      gesture.viewY = state.view.y
      gesture.moved = true
      gesture.pinch = null
      return
    }
    if (pointers.size === 0) {
      const quick = performance.now() - gesture.startT < TAP_TIME
      if (!cancelled && !gesture.moved && !gesture.multi && quick) tap(event.clientX, event.clientY, true)
      gesture = null
    }
  }
  viewport.addEventListener('pointerup', (event) => endPointer(event, false))
  viewport.addEventListener('pointercancel', (event) => endPointer(event, true))

  viewport.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault()
      const rect = viewport.getBoundingClientRect()
      zoomAt(Math.exp(-event.deltaY * 0.0015), event.clientX - rect.left, event.clientY - rect.top)
    },
    { passive: false },
  )

  viewport.addEventListener('keydown', (event) => {
    const c = centre()
    const step = 60
    const actions = {
      '+': () => zoomAt(1.25, c.x, c.y),
      '=': () => zoomAt(1.25, c.x, c.y),
      '-': () => zoomAt(0.8, c.x, c.y),
      0: fitView,
      ArrowLeft: () => ((state.view.x += step), applyView()),
      ArrowRight: () => ((state.view.x -= step), applyView()),
      ArrowUp: () => ((state.view.y += step), applyView()),
      ArrowDown: () => ((state.view.y -= step), applyView()),
      Enter: setAtCentre,
    }
    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()
    }
  })

  // A tap at client coordinates: select a gun marker, place a gun, or set the target.
  function tap(clientX, clientY, allowMarkers) {
    if (allowMarkers && !state.placing) {
      const marker = document.elementFromPoint(clientX, clientY)?.closest('[data-gun]')
      if (marker) {
        if (!isSpa()) state.gun = marker.dataset.gun === 'built' ? 'built' : Number(marker.dataset.gun)
        render()
        return
      }
    }
    const rect = stage.getBoundingClientRect()
    const svg = {
      x: ((clientX - rect.left) / rect.width) * SVG_SIZE,
      y: ((clientY - rect.top) / rect.height) * SVG_SIZE,
    }
    if (svg.x < 0 || svg.y < 0 || svg.x > SVG_SIZE || svg.y > SVG_SIZE) return
    const point = toGame(current(), svg)
    if (state.placing) {
      state.built = point
      if (!isSpa()) state.gun = 'built'
      state.placing = false
    } else if (activeGun()) {
      nextMilTarget()
      state.target = point
      state.shot = null
      state.spaDistance = null
    } else {
      return
    }
    render()
  }

  function setAtCentre() {
    const rect = viewport.getBoundingClientRect()
    const c = centre()
    tap(rect.left + c.x, rect.top + c.y, false)
  }

  // ---- Controls ---------------------------------------------------------------

  el('mapSelect').onchange = (event) => {
    state.map = event.target.value
    store.set('map', state.map)
    state.target = null
    resetMil()
    fitView()
    chooseSide(state.side)
  }
  el('allies').onclick = () => chooseSide('allies')
  el('axis').onclick = () => chooseSide('axis')
  el('weaponStatic').onclick = () => {
    state.weapon = 'static'
    resetGuns()
    resetMil()
    render()
  }
  el('weaponSpa').onclick = () => {
    state.weapon = 'spa'
    resetGuns()
    resetMil()
    state.placing = true
    render()
  }
  el('profileSelect').onchange = (event) => {
    state.profile = event.target.value
    render()
  }
  // The red terrain number: signed, typed from the HUD. iOS number pads have no
  // minus key, so a ± button flips the sign.
  function readTerrain() {
    const raw = el('spaTerrain').value.trim().replace(/^\+/, '')
    state.spaTerrain = raw === '' || raw === '-' ? 0 : /^-?\d+$/.test(raw) ? Number(raw) : NaN
    renderSetup()
    renderOverlay()
    renderSolution()
  }
  el('spaTerrain').oninput = readTerrain
  el('spaTerrainSign').onclick = () => {
    const raw = el('spaTerrain').value.trim()
    el('spaTerrain').value = raw.startsWith('-') ? raw.slice(1) : `-${raw.replace(/^\+/, '')}`
    readTerrain()
  }
  el('spaDistance').oninput = (event) => {
    const raw = event.target.value.trim()
    const value = Number(raw)
    state.spaDistance = raw === '' ? null : Number.isFinite(value) && value >= 0 ? Math.round(value) : null
    event.target.classList.toggle('from-map', state.spaDistance === null)
    renderOverlay()
    renderSolution()
  }
  el('spaDistance').onblur = renderSetup
  el('spaSelect').onchange = (event) => {
    state.spa = event.target.value
    render()
  }
  el('gunSelect').onchange = (event) => {
    state.gun = event.target.value === 'built' ? 'built' : Number(event.target.value)
    render()
  }
  const togglePlacing = () => {
    state.placing = !state.placing
    render()
  }
  el('build').onclick = togglePlacing
  el('spaPlace').onclick = togglePlacing
  el('zones').onchange = (event) => {
    state.zones = event.target.checked
    render()
  }
  el('gridToggle').onchange = (event) => {
    state.grid = event.target.checked
    store.set('grid', state.grid)
    renderOverlay()
  }
  el('keypadStyle').onchange = (event) => {
    state.keypad = event.target.value
    store.set('keypad', state.keypad)
    renderSolution()
  }
  el('manualDistance').oninput = renderSolution
  el('clear').onclick = () => {
    state.target = null
    state.shot = null
    render()
  }
  el('crosshairToggle').onclick = () => {
    state.crosshair = !state.crosshair
    render()
  }
  el('crosshairSet').onclick = setAtCentre

  el('flight').onchange = (event) => {
    const value = Math.round(Number(event.target.value))
    state.flight = Number.isFinite(value)
      ? Math.min(FLIGHT_ESTIMATE.max, Math.max(FLIGHT_ESTIMATE.min, value))
      : FLIGHT_ESTIMATE.default
    event.target.value = state.flight
    store.set('flight', state.flight)
    renderTimer()
  }
  el('fire').onclick = () => {
    state.shot = { at: Date.now(), flight: state.flight }
    renderTimer()
  }
  // Timed from the clock, so the countdown stays right after the tab sleeps.
  setInterval(() => state.shot && renderTimer(), 250)

  // ---- Crew, seat and gun stock ----------------------------------------------
  // Each device remembers who is holding it and which seat they are in. The
  // seat decides which numbers lead; the callsign signs shared missions.

  const crew = {
    member: store.get('crew', null),
    seat: store.get('seat', 'gunner'),
    ammo: store.get('ammo', { he: AMMO_CAPS.he, smoke: AMMO_CAPS.smoke }),
  }
  const SEAT_HINTS = {
    gunner: 'Gunner: set elevation and fine azimuth.',
    loader: 'Loader: reload and swing the gun when the azimuth is past the gunner’s reach.',
  }

  function renderCrew() {
    const root = document.documentElement
    root.dataset.seat = crew.seat
    document.querySelectorAll('[data-crew]').forEach((b) => {
      const on = b.dataset.crew === crew.member
      b.classList.toggle('selected', on)
      b.setAttribute('aria-pressed', String(on))
    })
    document.querySelectorAll('[data-seat]').forEach((b) => {
      const on = b.dataset.seat === crew.seat
      b.classList.toggle('selected', on)
      b.setAttribute('aria-pressed', String(on))
    })
    el('seatHint').textContent = crew.member ? SEAT_HINTS[crew.seat] : 'Pick who is on this device.'
    el('bearingNote').textContent = crew.seat === 'loader' ? 'Swing gun here' : 'Degrees'
    el('ammoHe').textContent = crew.ammo.he
    el('ammoSmoke').textContent = crew.ammo.smoke
  }

  document.querySelectorAll('[data-crew]').forEach((b) => {
    b.onclick = () => {
      crew.member = b.dataset.crew
      store.set('crew', crew.member)
      renderCrew()
    }
  })
  document.querySelectorAll('[data-seat]').forEach((b) => {
    b.onclick = () => {
      crew.seat = b.dataset.seat
      store.set('seat', crew.seat)
      renderCrew()
    }
  })
  document.querySelectorAll('[data-ammo]').forEach((b) => {
    b.onclick = () => {
      const kind = b.dataset.ammo
      crew.ammo[kind] = Math.min(AMMO_CAPS[kind], Math.max(0, crew.ammo[kind] + Number(b.dataset.step)))
      store.set('ammo', crew.ammo)
      renderCrew()
    }
  })
  el('ammoReset').onclick = () => {
    crew.ammo = { he: AMMO_CAPS.he, smoke: AMMO_CAPS.smoke }
    store.set('ammo', crew.ammo)
    renderCrew()
  }
  renderCrew()

  // ---- Sharing a fire mission ---------------------------------------------------

  function missionSummary() {
    const gun = activeGun()
    const map = current()
    if (!gun || !state.target) return null
    const result = solve(gun, state.target, isSpa() ? null : state.profile)
    let elevation = result.mil === null ? 'out of range' : `${result.mil} MIL`
    if (isSpa()) {
      const spaOut = spaResult()
      const terrain = Number.isFinite(state.spaTerrain) ? state.spaTerrain : 0
      elevation =
        spaOut.status === 'ok'
          ? `barrel ${spaOut.barrel} MIL at terrain ${terrain > 0 ? '+' : ''}${terrain} (${spa().name})`
          : `${spa().name}, no solution`
    }
    const square = callout(gridRef(map, state.target), state.keypad)
    return `${map.name} ${square}: ${result.distance} m, ${result.bearing}°, ${elevation}`
  }

  function showBanner(text) {
    el('missionText').textContent = text
    el('missionBanner').hidden = false
  }
  el('missionDismiss').onclick = () => {
    el('missionBanner').hidden = true
  }

  el('share').onclick = async () => {
    const summary = missionSummary()
    if (!summary) {
      el('shareStatus').textContent = 'Mark a target first.'
      return
    }
    const fragment = encodeMission({
      map: state.map,
      side: state.side,
      weapon: state.weapon,
      spa: state.spa,
      terrain: state.spaTerrain,
      profile: state.profile,
      gun: state.gun,
      built: state.built,
      target: state.target,
      from: crew.member,
    })
    const url = `${location.origin}/fire-control#${fragment}`
    const sender = CREW_NAMES[crew.member]
    const text = `Fire mission${sender ? ` from ${sender}` : ''}. ${summary}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Fire mission', text, url })
        el('shareStatus').textContent = 'Shared.'
        return
      }
      await navigator.clipboard.writeText(`${text}\n${url}`)
      el('shareStatus').textContent = 'Link copied. Paste it to the crew.'
    } catch (error) {
      // Cancelling the share sheet is not a failure worth reporting.
      if (error?.name === 'AbortError') return
      el('shareStatus').textContent = url
    }
  }

  // Opening a mission link (or receiving one while the page is open) loads it.
  function loadMissionFromLink() {
    if (!location.hash || location.hash.length < 2) return
    const mission = decodeMission(location.hash)
    history.replaceState(null, '', location.pathname + location.search)
    if (!mission) {
      showBanner('That mission link could not be read. Ask for a fresh one.')
      return
    }
    // A mission on the same map and weapon is the next target; anything else starts fresh.
    if (mission.map === state.map && mission.weapon === state.weapon) nextMilTarget()
    else resetMil()
    state.map = mission.map
    store.set('map', state.map)
    state.weapon = mission.weapon
    chooseSide(mission.side)
    if (mission.profile) state.profile = mission.profile
    if (mission.spa) state.spa = mission.spa
    if (mission.weapon === 'spa') {
      state.spaTerrain = mission.terrain
      el('spaTerrain').value = mission.terrain ? String(mission.terrain) : ''
      state.spaDistance = null
    }
    state.built = mission.built
    state.gun = mission.gun
    state.target = mission.target
    fitView()
    render()
    const sender = CREW_NAMES[mission.from]
    showBanner(`${sender ? `${sender}'s` : 'Shared'} mission loaded. ${missionSummary()}`)
  }
  window.addEventListener('hashchange', loadMissionFromLink)

  const c = () => centre()
  el('zoomIn').onclick = () => zoomAt(1.25, c().x, c().y)
  el('zoomOut').onclick = () => zoomAt(0.8, c().x, c().y)
  el('zoomReset').onclick = fitView

  chooseSide(state.side === 'axis' ? 'axis' : 'allies')
  fitView()
  loadMissionFromLink()
}

if (typeof document !== 'undefined') init()
