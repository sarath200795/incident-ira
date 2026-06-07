import { describe, it, expect } from 'vitest'
import { can, roleLabel } from '../permissions'

describe('can', () => {
  it('admin can do everything', () => {
    expect(can('admin', 'user.manage')).toBe(true)
    expect(can('admin', 'incident.delete')).toBe(true)
    expect(can('admin', 'action.manage')).toBe(true)
    expect(can('admin', 'anything.unknown')).toBe(true)
  })

  it('reporter can report but not investigate or manage users', () => {
    expect(can('reporter', 'incident.create')).toBe(true)
    expect(can('reporter', 'incident.report')).toBe(true)
    expect(can('reporter', 'illness.create')).toBe(true)
    expect(can('reporter', 'incident.investigate')).toBe(false)
    expect(can('reporter', 'action.manage')).toBe(false)
    expect(can('reporter', 'user.manage')).toBe(false)
  })

  it('investigator can investigate + manage actions but not users', () => {
    expect(can('investigator', 'incident.investigate')).toBe(true)
    expect(can('investigator', 'incident.close')).toBe(true)
    expect(can('investigator', 'action.manage')).toBe(true)
    expect(can('investigator', 'user.manage')).toBe(false)
    expect(can('investigator', 'incident.delete')).toBe(false)
  })

  it('unknown role gets nothing', () => {
    expect(can('ghost', 'incident.create')).toBe(false)
  })
})

describe('roleLabel', () => {
  it('maps role keys to labels', () => {
    expect(roleLabel('reporter')).toBe('Reporter')
    expect(roleLabel('investigator')).toBe('Investigator')
    expect(roleLabel('admin')).toBe('Admin')
  })
})
