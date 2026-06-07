import { describe, it, expect } from 'vitest'
import { flattenActions, isActionOverdue, summarizeActions, todayISO } from '../actions'

const incidents = [
  { id: 'i1', refNo: 'IRA-2026-0001', capa: [
    { id: 'a1', description: 'Fix guard', ownerUid: 'u1', dueDate: '2020-01-01', status: 'open' },
    { id: 'a2', description: 'Retrain', ownerUid: 'u2', dueDate: '2999-01-01', status: 'closed' },
  ] },
  { id: 'i2', refNo: 'IRA-2026-0002', deletedAt: true, capa: [{ id: 'x', status: 'open' }] },
]
const illnesses = [
  { id: 'l1', refNo: 'ILL-2026-0001', actions: [
    { id: 'b1', description: 'Ventilate', ownerUid: 'u1', dueDate: '2999-01-01', status: 'in_progress' },
  ] },
]

describe('flattenActions', () => {
  it('flattens across incidents + illnesses and skips deleted parents', () => {
    const all = flattenActions(incidents, illnesses)
    expect(all).toHaveLength(3)
    expect(all.find((a) => a.id === 'a1').source).toBe('incident')
    expect(all.find((a) => a.id === 'a1').sourceRef).toBe('IRA-2026-0001')
    expect(all.find((a) => a.id === 'b1').source).toBe('illness')
    expect(all.some((a) => a.id === 'x')).toBe(false) // deleted parent excluded
  })
})

describe('isActionOverdue', () => {
  it('past due + not closed = overdue', () => {
    expect(isActionOverdue({ dueDate: '2020-01-01', status: 'open' })).toBe(true)
  })
  it('closed is never overdue', () => {
    expect(isActionOverdue({ dueDate: '2020-01-01', status: 'closed' })).toBe(false)
  })
  it('future due is not overdue', () => {
    expect(isActionOverdue({ dueDate: '2999-01-01', status: 'open' })).toBe(false)
  })
  it('no due date is not overdue', () => {
    expect(isActionOverdue({ status: 'open' })).toBe(false)
  })
})

describe('summarizeActions', () => {
  it('counts by status + overdue', () => {
    const all = flattenActions(incidents, illnesses)
    const s = summarizeActions(all)
    expect(s.total).toBe(3)
    expect(s.open).toBe(1)
    expect(s.in_progress).toBe(1)
    expect(s.closed).toBe(1)
    expect(s.overdue).toBe(1) // only a1
  })
})

describe('todayISO', () => {
  it('formats YYYY-MM-DD', () => {
    expect(todayISO(new Date('2026-06-06T10:00:00'))).toBe('2026-06-06')
  })
})
