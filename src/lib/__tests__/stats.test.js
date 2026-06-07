import { describe, it, expect } from 'vitest'
import { statsDeltaFor, accumulate, emptyStats } from '../stats'

const inc = (over = {}) => ({ severity: 'high', type: 'lost_time', category: 'slip_trip_fall', location: 'Office', lifecycle: 'reporting', deletedAt: null, ...over })

describe('statsDeltaFor', () => {
  it('create → +1 total and +1 each bucket', () => {
    const d = statsDeltaFor(null, inc())
    expect(d.total).toBe(1)
    expect(d.bySeverity.high).toBe(1)
    expect(d.byType.lost_time).toBe(1)
    expect(d.byCategory.slip_trip_fall).toBe(1)
    expect(d.byLocation.Office).toBe(1)
    expect(d.byLifecycle.reporting).toBe(1)
  })

  it('soft-delete → -1 everywhere', () => {
    const before = inc()
    const after = inc({ deletedAt: true })
    const d = statsDeltaFor(before, after)
    expect(d.total).toBe(-1)
    expect(d.bySeverity.high).toBe(-1)
  })

  it('edit of one dimension nets old/new only', () => {
    const d = statsDeltaFor(inc(), inc({ severity: 'low' }))
    expect(d.total).toBeUndefined()
    expect(d.bySeverity.high).toBe(-1)
    expect(d.bySeverity.low).toBe(1)
    expect(d.byType).toBeUndefined()
  })

  it('lifecycle advance is tracked', () => {
    const d = statsDeltaFor(inc(), inc({ lifecycle: 'capa' }))
    expect(d.byLifecycle.reporting).toBe(-1)
    expect(d.byLifecycle.capa).toBe(1)
  })

  it('no change → null', () => {
    expect(statsDeltaFor(inc(), inc())).toBeNull()
  })

  it('skips empty bucket fields', () => {
    const d = statsDeltaFor(null, inc({ category: '', location: '' }))
    expect(d.byCategory).toBeUndefined()
    expect(d.byLocation).toBeUndefined()
    expect(d.total).toBe(1)
  })
})

describe('accumulate', () => {
  it('totals a list and excludes soft-deleted', () => {
    const s = accumulate([inc(), inc({ severity: 'low' }), inc({ deletedAt: true })])
    expect(s.total).toBe(2)
    expect(s.bySeverity.high).toBe(1)
    expect(s.bySeverity.low).toBe(1)
  })
  it('emptyStats has zeroed buckets', () => {
    const s = emptyStats()
    expect(s.total).toBe(0)
    expect(s.bySeverity).toEqual({})
  })
})
