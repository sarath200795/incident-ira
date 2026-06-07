import { describe, it, expect } from 'vitest'
import { diffSummary, auditMeta, AUDIT } from '../audit'

describe('diffSummary', () => {
  it('reports changed tracked fields as old → new', () => {
    const before = { severity: 'low', location: 'Office', lifecycle: 'reporting' }
    const after = { severity: 'high', location: 'Office' }
    expect(diffSummary(before, after)).toBe('severity: low → high')
  })
  it('shows em-dash for empty values', () => {
    expect(diffSummary({ type: '' }, { type: 'near_miss' })).toBe('type: — → near_miss')
  })
  it('returns empty string when nothing tracked changed', () => {
    expect(diffSummary({ type: 'near_miss' }, { type: 'near_miss' })).toBe('')
    expect(diffSummary({ type: 'near_miss' }, { updatedAt: 'x' })).toBe('')
  })
})

describe('auditMeta', () => {
  it('maps a known action to a label + color', () => {
    const m = auditMeta(AUDIT.INCIDENT_CREATE)
    expect(m.label).toBe('Incident created')
    expect(m.color).toMatch(/^#/)
  })
  it('falls back gracefully for unknown actions', () => {
    expect(auditMeta('weird.thing').label).toBe('weird.thing')
  })
})
