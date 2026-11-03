// Fire Control: pick a gun, mark a target, read off distance, azimuth and MIL.
// Depends on MAPS (js/maps.js), GARRISONS (js/garrisons.js), milFor,
// metresPerMil and FLIGHT_ESTIMATE (js/ballistics.js) and SPA_VEHICLES (js/spa.js).

const SVG_SIZE = 1000
const SECTORS = 5
// Static guns can be built in a team's first two sectors (Patch 19.1).
const BUILD_DEPTH = 2 / SECTORS

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

function ownsLowEnd(map, side) {
  return side === 'allies' ? map.front.alliesLow : !map.front.alliesLow
}

// How far a point sits from a side's own map edge, 0 at their HQ edge, 1 at the enemy's.
function depth(map, side, point) {
  const e = extent(map)
  const fromLow =
    map.front.axis === 'x' ? (point.x - e.left) / e.width : (point.y + e.height / 2) / e.height
  return ownsLowEnd(map, side) ? fromLow : 1 - fromLow
}

// The SVG rectangle covering depths d0 to d1 for a side.
function band(map, side, d0, d1) {
  const [a, b] = ownsLowEnd(map, side) ? [d0, d1] : [1 - d1, 1 - d0]
  return map.front.axis === 'x'
    ? { x: a * SVG_SIZE, y: 0, width: (b - a) * SVG_SIZE, height: SVG_SIZE }
    : { x: 0, y: (1 - b) * SVG_SIZE, width: SVG_SIZE, height: (b - a) * SVG_SIZE }
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

function gunLabel(map, index) {
  const label = map.hqLabels?.[index]
  return label ? label.replace('HQ Gun', 'HQ gun') : `HQ gun ${index + 1}`
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
    mode: store.get('mode', 'warfare'), // 'warfare' or 'offensive'
    weapon: 'static', // 'static' or 'spa'
    profile: 'US',
    spa: null,
    gun: 0, // an HQ candidate index, or 'built'
    built: null,
    target: null,
    placing: false,
    zones: true,
    crosshair: false,
    flight: store.get('flight', FLIGHT_ESTIMATE.default),
    shot: null, // { at, flight } for the countdown
    view: { scale: 1, x: 0, y: 0, base: 0 },
  }
  if (!MAPS[state.map]) state.map = 'CAR'

  const current = () => MAPS[state.map]
  const hqGuns = () => current().guns[state.side]
  const isSpa = () => state.weapon === 'spa'
  const spa = () => SPA_VEHICLES.find((v) => v.id === state.spa)
  const activeGun = () => {
    if (isSpa() || state.gun === 'built') return state.built
    return hqGuns()[state.gun]
  }

  for (const [key, map] of Object.entries(MAPS)) el('mapSelect').add(new Option(map.name, key))
  for (const [key, name] of Object.entries(PROFILE_NAMES)) el('profileSelect').add(new Option(name, key))
  for (const v of SPA_VEHICLES) el('spaSelect').add(new Option(`${v.name} (${v.faction})`, v.id))
  el('flight').value = state.flight
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
      ['modeWarfare', state.mode === 'warfare'],
      ['modeOffensive', state.mode === 'offensive'],
      ['weaponStatic', !spaMode],
      ['weaponSpa', spaMode],
    ]) {
      el(id).classList.toggle('selected', on)
      el(id).setAttribute('aria-pressed', String(on))
    }

    el('staticSetup').hidden = spaMode
    el('spaSetup').hidden = !spaMode
    el('profileSelect').value = state.profile
    el('spaSelect').value = state.spa
    const vehicle = spa()
    el('spaRange').textContent = vehicle?.maxRange
      ? `Listed range ${vehicle.maxRange} m (Patch 19.1). Facing up a slope can reach further.`
      : 'No range figure has been published for this vehicle.'

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

    el('offensiveNote').hidden = state.mode !== 'offensive'
    el('zonesLabel').textContent = state.mode === 'offensive' ? 'Show default garrisons' : 'Show build zones'
    el('legendZones').hidden = !state.zones || state.mode !== 'warfare'
    el('legendGarrisons').hidden = !state.zones || state.mode !== 'offensive'
    el('legend').hidden = !state.zones
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

    if (state.zones && state.mode === 'warfare') {
      const own = band(map, state.side, 0, BUILD_DEPTH)
      const enemy = band(map, state.side, 1 - BUILD_DEPTH, 1)
      svg += `<rect class="zone own" x="${own.x}" y="${own.y}" width="${own.width}" height="${own.height}"/>`
      svg += `<rect class="zone enemy" x="${enemy.x}" y="${enemy.y}" width="${enemy.width}" height="${enemy.height}"/>`
      for (let i = 1; i < SECTORS; i++) {
        const at = (i / SECTORS) * SVG_SIZE
        svg +=
          map.front.axis === 'x'
            ? `<line class="sector" x1="${at}" y1="0" x2="${at}" y2="${SVG_SIZE}"/>`
            : `<line class="sector" x1="0" y1="${at}" x2="${SVG_SIZE}" y2="${at}"/>`
      }
    }

    // Radial reach around the gun. This is range only, not traverse or cover.
    if (gun) {
      const outer = isSpa() ? spa()?.maxRange : MAX_RANGE
      const inner = isSpa() ? 0 : MIN_RANGE
      if (outer) svg += `<path class="reach" clip-path="url(#mapClip)" d="${ringPath(map, gun, inner, outer)}"/>`
    }

    if (state.zones && state.mode === 'offensive') {
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

  function renderSolution() {
    const map = current()
    const gun = activeGun()
    const spaMode = isSpa()
    const result = gun && state.target ? solve(gun, state.target, spaMode ? null : state.profile) : null
    const vehicle = spa()

    el('distance').textContent = result ? result.distance : '-'
    el('bearing').textContent = result ? `${result.bearing}°` : '-'
    el('mil').textContent = spaMode ? 'n/a' : (result?.mil ?? '-')

    let status
    if (!gun) status = spaMode ? 'Place the SPA' : 'Select a gun'
    else if (!state.target) status = 'Awaiting target'
    else if (spaMode)
      status =
        vehicle?.maxRange && result.distance > vehicle.maxRange ? 'Beyond listed range' : 'Distance and azimuth only'
    else status = result.mil === null ? 'Out of range' : 'Solution ready'
    el('status').textContent = status

    let note = ''
    let warning = false
    if (spaMode) {
      note = 'SPA elevation needs barrel and terrain readings; not calculated here'
    } else if (gun) {
      const outside = state.gun === 'built' && depth(map, state.side, state.built) > BUILD_DEPTH
      if (outside && state.mode === 'warfare') {
        note = 'Built gun is outside your first two sectors'
        warning = true
      } else {
        note = `${state.gun === 'built' ? 'Built gun' : 'Candidate ' + gunLabel(map, state.gun)} · ${PROFILE_NAMES[state.profile]} scale`
      }
    }
    el('gunNote').textContent = note
    el('gunNote').classList.toggle('warning', warning)

    const step = !spaMode && result?.mil != null ? metresPerMil(result.distance, state.profile) : null
    el('milNote').textContent = step ? `MIL · 1 MIL ≈ ${step.toFixed(1)} m` : 'MIL'

    const manual = el('manualDistance').value
    const manualMil = manual === '' ? null : milFor(Number(manual), state.profile)
    el('manualResult').textContent = manual === '' ? '- MIL' : manualMil === null ? 'Out' : `${manualMil} MIL`

    el('fire').disabled = spaMode || !result || result.mil === null
    el('timerBox').hidden = spaMode
    renderTimer()
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
      state.target = point
      state.shot = null
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
    fitView()
    chooseSide(state.side)
  }
  el('allies').onclick = () => chooseSide('allies')
  el('axis').onclick = () => chooseSide('axis')
  el('modeWarfare').onclick = () => {
    state.mode = 'warfare'
    store.set('mode', state.mode)
    render()
  }
  el('modeOffensive').onclick = () => {
    state.mode = 'offensive'
    store.set('mode', state.mode)
    render()
  }
  el('weaponStatic').onclick = () => {
    state.weapon = 'static'
    resetGuns()
    render()
  }
  el('weaponSpa').onclick = () => {
    state.weapon = 'spa'
    resetGuns()
    state.placing = true
    render()
  }
  el('profileSelect').onchange = (event) => {
    state.profile = event.target.value
    render()
  }
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

  const c = () => centre()
  el('zoomIn').onclick = () => zoomAt(1.25, c().x, c().y)
  el('zoomOut').onclick = () => zoomAt(0.8, c().x, c().y)
  el('zoomReset').onclick = fitView

  chooseSide(state.side === 'axis' ? 'axis' : 'allies')
  fitView()
}

if (typeof document !== 'undefined') init()
