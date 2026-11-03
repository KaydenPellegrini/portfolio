// Elevation in MIL at every 100 m from 100 m to 1600 m, per gun family.
// Adapted from MIT licensed reference data, see REFERENCE-LICENSE.txt.
const MIN_RANGE = 100
const MAX_RANGE = 1600
const RANGE_STEP = 100

const MIL_TABLES = {
  // US and German guns share one scale.
  US: [978, 954, 930, 907, 883, 859, 836, 812, 788, 764, 741, 717, 693, 670, 646, 622],
  GER: [978, 954, 930, 907, 883, 859, 836, 812, 788, 764, 741, 717, 693, 670, 646, 622],
  RUS: [1120, 1099, 1077, 1056, 1035, 1013, 992, 971, 949, 928, 907, 885, 864, 843, 821, 800],
  // British and Canadian guns share one scale.
  GB: [533, 516, 498, 480, 462, 444, 427, 409, 391, 373, 356, 338, 320, 302, 284, 267],
  CAN: [533, 516, 498, 480, 462, 444, 427, 409, 391, 373, 356, 338, 320, 302, 284, 267],
}

// Linear interpolation between the two nearest table entries, rounded to a
// whole MIL. Returns null outside the gun's range.
function milFor(distance, profile) {
  const table = MIL_TABLES[profile]
  if (!table || !Number.isFinite(distance) || distance < MIN_RANGE || distance > MAX_RANGE) return null
  const index = Math.min(Math.floor((distance - MIN_RANGE) / RANGE_STEP), table.length - 2)
  const near = MIN_RANGE + index * RANGE_STEP
  const t = (distance - near) / RANGE_STEP
  return Math.round(table[index] + (table[index + 1] - table[index]) * t)
}

// Ground distance covered by one MIL at this range, from the same table. Shows
// how far a whole-MIL setting can sit from the exact distance.
function metresPerMil(distance, profile) {
  const table = MIL_TABLES[profile]
  if (!table || !Number.isFinite(distance) || distance < MIN_RANGE || distance > MAX_RANGE) return null
  const index = Math.min(Math.floor((distance - MIN_RANGE) / RANGE_STEP), table.length - 2)
  return RANGE_STEP / (table[index] - table[index + 1])
}

// Expected fall of shot for static guns, in seconds. Community reports put it
// at about 24 s (estimates range 20 to 26 s); no current per-range curve exists.
const FLIGHT_ESTIMATE = { default: 24, min: 10, max: 40 }
