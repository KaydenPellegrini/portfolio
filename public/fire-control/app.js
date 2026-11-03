// Fire Control: pick a gun, click a target, read off distance, azimuth and MIL.
// Depends on MAPS (js/maps.js) and milFor (js/ballistics.js).

const SVG_SIZE = 1000
const SECTORS = 5
// Static guns can be built in a team's first two sectors.
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

function solve(gun, target, profile) {
  const dx = target.x - gun.x
  const dy = target.y - gun.y
  const distance = Math.round(Math.hypot(dx, dy) / 100)
  const bearing = Math.floor(((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360)
  return { distance, bearing, mil: milFor(distance, profile) }
}

function gunLabel(map, index) {
  const label = map.hqLabels?.[index]
  return label ? label.replace('HQ Gun', 'HQ gun') : `HQ gun ${index + 1}`
}

// ---- Page -------------------------------------------------------------------

function init() {
  const el = (id) => document.getElementById(id)
  const state = {
    map: 'CAR',
    side: 'allies',
    profile: 'US',
    gun: 0, // an HQ gun index, or 'built'
    built: null,
    target: null,
    placing: false,
    zones: true,
    zoom: 1,
  }

  const current = () => MAPS[state.map]
  const hqGuns = () => current().guns[state.side]
  const activeGun = () => (state.gun === 'built' ? state.built : hqGuns()[state.gun])

  for (const [key, map] of Object.entries(MAPS)) el('mapSelect').add(new Option(map.name, key))
  for (const [key, name] of Object.entries(PROFILE_NAMES)) el('profileSelect').add(new Option(name, key))

  function resetGuns() {
    state.gun = 0
    state.built = null
    state.placing = false
  }

  function chooseSide(side) {
    state.side = side
    state.profile = current().profiles[side]
    resetGuns()
    render()
  }

  function renderSetup() {
    const map = current()
    el('mapSelect').value = state.map
    el('profileSelect').value = state.profile
    el('alliesTeam').textContent = map.teams.allies
    el('axisTeam').textContent = map.teams.axis
    el('allies').classList.toggle('selected', state.side === 'allies')
    el('axis').classList.toggle('selected', state.side === 'axis')
    el('allies').setAttribute('aria-pressed', String(state.side === 'allies'))
    el('axis').setAttribute('aria-pressed', String(state.side === 'axis'))

    const select = el('gunSelect')
    select.replaceChildren()
    hqGuns().forEach((_, index) => select.add(new Option(gunLabel(map, index), String(index))))
    if (state.built) select.add(new Option('Built gun', 'built'))
    select.value = String(state.gun)

    el('build').classList.toggle('active', state.placing)
    el('build').textContent = state.placing ? 'Cancel placement' : 'Place a built gun'
    el('modeHelp').textContent = state.placing
      ? 'Click inside your build zone to place the gun.'
      : 'Pick an HQ gun or place a built one, then click the map to mark the target.'
    el('mapInstruction').textContent = state.placing ? 'Click map to place gun' : 'Click map to set target'
    el('legend').hidden = !state.zones
  }

  function renderOverlay() {
    const map = current()
    const gun = activeGun()
    let svg = ''

    if (state.zones) {
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

    if (gun && state.target) {
      const a = toSvg(map, gun)
      const b = toSvg(map, state.target)
      svg += `<line class="line-of-fire" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`
    }

    hqGuns().forEach((point, index) => {
      const p = toSvg(map, point)
      const active = state.gun === index
      svg += `<g class="gun${active ? ' active' : ''}" data-gun="${index}">
        <circle cx="${p.x}" cy="${p.y}" r="${active ? 15 : 11}"/>
        <text x="${p.x}" y="${p.y + 4}">${index + 1}</text></g>`
    })

    if (state.built) {
      const p = toSvg(map, state.built)
      svg += `<g class="gun built${state.gun === 'built' ? ' active' : ''}" data-gun="built">
        <circle cx="${p.x}" cy="${p.y}" r="14"/><text x="${p.x}" y="${p.y + 4}">B</text></g>`
    }

    if (state.target) {
      const p = toSvg(map, state.target)
      svg += `<g class="target"><circle cx="${p.x}" cy="${p.y}" r="15"/>
        <path d="M ${p.x - 22} ${p.y} h 44 M ${p.x} ${p.y - 22} v 44"/></g>`
    }

    el('overlay').innerHTML = svg
  }

  function renderSolution() {
    const map = current()
    const gun = activeGun()
    const result = gun && state.target ? solve(gun, state.target, state.profile) : null

    el('distance').textContent = result ? result.distance : '-'
    el('bearing').textContent = result ? `${result.bearing}°` : '-'
    el('mil').textContent = result?.mil ?? '-'
    el('status').textContent = !gun
      ? 'Select a gun'
      : !state.target
        ? 'Awaiting target'
        : result.mil === null
          ? 'Out of range'
          : 'Solution ready'

    const outside = state.gun === 'built' && state.built && depth(map, state.side, state.built) > BUILD_DEPTH
    el('gunNote').textContent = outside
      ? 'Built gun is outside your first two sectors'
      : gun
        ? `${state.gun === 'built' ? 'Built gun' : gunLabel(map, state.gun)} · ${PROFILE_NAMES[state.profile]} scale`
        : ''
    el('gunNote').classList.toggle('warning', Boolean(outside))

    const manual = el('manualDistance').value
    const manualMil = manual === '' ? null : milFor(Number(manual), state.profile)
    el('manualResult').textContent = manual === '' ? '- MIL' : manualMil === null ? 'Out' : `${manualMil} MIL`
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

  function applyZoom() {
    el('stage').style.width = state.zoom === 1 ? '' : `${state.zoom * 100}%`
    el('zoomReset').textContent = `${Math.round(state.zoom * 100)}%`
  }

  el('mapSelect').onchange = (event) => {
    state.map = event.target.value
    state.target = null
    state.zoom = 1
    applyZoom()
    chooseSide(state.side)
  }
  el('allies').onclick = () => chooseSide('allies')
  el('axis').onclick = () => chooseSide('axis')
  el('profileSelect').onchange = (event) => {
    state.profile = event.target.value
    render()
  }
  el('gunSelect').onchange = (event) => {
    state.gun = event.target.value === 'built' ? 'built' : Number(event.target.value)
    render()
  }
  el('build').onclick = () => {
    state.placing = !state.placing
    render()
  }
  el('zones').onchange = (event) => {
    state.zones = event.target.checked
    render()
  }
  el('manualDistance').oninput = renderSolution
  el('clear').onclick = () => {
    state.target = null
    render()
  }

  el('overlay').addEventListener('click', (event) => {
    const marker = event.target.closest('[data-gun]')
    if (marker && !state.placing) {
      state.gun = marker.dataset.gun === 'built' ? 'built' : Number(marker.dataset.gun)
      render()
      return
    }
    const rect = el('overlay').getBoundingClientRect()
    const point = toGame(current(), {
      x: ((event.clientX - rect.left) / rect.width) * SVG_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * SVG_SIZE,
    })
    if (state.placing) {
      state.built = point
      state.gun = 'built'
      state.placing = false
    } else {
      state.target = point
    }
    render()
  })

  el('zoomIn').onclick = () => {
    state.zoom = Math.min(3, state.zoom + 0.25)
    applyZoom()
  }
  el('zoomOut').onclick = () => {
    state.zoom = Math.max(1, state.zoom - 0.25)
    applyZoom()
  }
  el('zoomReset').onclick = () => {
    state.zoom = 1
    applyZoom()
  }

  chooseSide('allies')
}

if (typeof document !== 'undefined') init()
