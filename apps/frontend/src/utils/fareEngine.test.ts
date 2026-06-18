import { describe, expect, it } from 'vitest'
import {
  calculateLibertePlusPrice,
  calculateNavigoDayPrice,
  calculateTicketPrice,
  getAnnualPrice,
  getEligiblePlans,
  sortByPrice,
  getSavingsVsTickets,
  scorePlan,
  recommendPlans,
  bestPlan,
  NAVIGO_DAY_PRICE,
} from './fareEngine'
import { PLANS, LIBERTE_PLUS_PRICE_PER_TRIP } from './faresData'
import type { SimulatorParams } from '../types/domain'

const baseEmployee: SimulatorParams = {
  profile: 'employee',
  daysPerWeek: 5,
  tripsPerDay: 2,
  zones: 5,
  age: 30,
}

describe('calculateLibertePlusPrice', () => {
  it('multiplies trips × days × 52 × LIBERTE_PLUS_PRICE_PER_TRIP', () => {
    expect(calculateLibertePlusPrice({ ...baseEmployee, daysPerWeek: 5, tripsPerDay: 2 }))
      .toBe(Math.round(5 * 52 * 2 * LIBERTE_PLUS_PRICE_PER_TRIP))
  })
})

describe('calculateTicketPrice', () => {
  it('uses SINGLE_TICKET_PRICE', () => {
    expect(calculateTicketPrice({ ...baseEmployee, daysPerWeek: 5, tripsPerDay: 2 }))
      .toBe(Math.round(5 * 52 * 2 * 2.10))
  })
})

describe('calculateNavigoDayPrice', () => {
  it('multiplies days/week × 52 × NAVIGO_DAY_PRICE', () => {
    expect(calculateNavigoDayPrice({ ...baseEmployee, daysPerWeek: 1 }))
      .toBe(Math.round(1 * 52 * NAVIGO_DAY_PRICE))
    expect(calculateNavigoDayPrice({ ...baseEmployee, daysPerWeek: 5 }))
      .toBe(Math.round(5 * 52 * NAVIGO_DAY_PRICE))
  })

  it('getAnnualPrice returns the dynamic computed price for navigo_day, not Infinity', () => {
    const day = PLANS.find((f) => f.id === 'navigo_day')!
    const occ = { ...baseEmployee, daysPerWeek: 1 }
    expect(getAnnualPrice(day, occ)).toBe(calculateNavigoDayPrice(occ))
    expect(getAnnualPrice(day, occ)).not.toBe(Infinity)
  })
})

describe('getAnnualPrice', () => {
  it('returns Liberty+ dynamic price', () => {
    const liberty = PLANS.find((f) => f.id === 'liberty_plus')!
    expect(getAnnualPrice(liberty, baseEmployee)).toBeGreaterThan(0)
  })
  it('returns Infinity for null yearlyPrice, for example Amethyst', () => {
    const amethyst = PLANS.find((f) => f.id === 'amethyst')!
    expect(getAnnualPrice(amethyst, baseEmployee)).toBe(Infinity)
  })
  it('returns the static yearlyPrice for Navigo Month', () => {
    const month = PLANS.find((f) => f.id === 'navigo_month')!
    expect(getAnnualPrice(month, baseEmployee)).toBe(1089.60)
  })
})

describe('getEligiblePlans', () => {
  it('filters by profile', () => {
    const result = getEligiblePlans(baseEmployee)
    expect(result.every((f) => f.profiles.includes('employee'))).toBe(true)
  })
  it('respects the condition() guard', () => {
    const occasional = { ...baseEmployee, daysPerWeek: 1 }
    const result = getEligiblePlans(occasional)
    expect(result.find((f) => f.id === 'navigo_month')).toBeUndefined()
    expect(result.find((f) => f.id === 'liberty_plus')).toBeDefined()
  })
  it('returns TST plans only for solidarity profile', () => {
    const solidarityUser: SimulatorParams = { ...baseEmployee, profile: 'solidarity' }
    const result = getEligiblePlans(solidarityUser)
    expect(result.every((f) => f.profiles.includes('solidarity'))).toBe(true)
  })
})

describe('sortByPrice', () => {
  it('sorts eligible plans by yearly price ascending', () => {
    const result = sortByPrice(baseEmployee)
    const prices = result.map((f) => getAnnualPrice(f, baseEmployee))
    expect([...prices].sort((a, b) => a - b)).toEqual(prices)
  })
})

describe('getSavingsVsTickets', () => {
  it('returns tickets − plan price', () => {
    const month = PLANS.find((f) => f.id === 'navigo_month')!
    const econ = getSavingsVsTickets(month, baseEmployee)
    expect(econ).toBe(calculateTicketPrice(baseEmployee) - 1089.60)
  })
  it('can be negative if plan is more expensive than tickets', () => {
    const month = PLANS.find((f) => f.id === 'navigo_month')!
    const sparse = { ...baseEmployee, daysPerWeek: 1, tripsPerDay: 1 }
    expect(getSavingsVsTickets(month, sparse)).toBeLessThan(0)
  })
})

describe('scorePlan + recommendPlans', () => {
  it('non-eligible plan scores 0', () => {
    const solidarityUser: SimulatorParams = { ...baseEmployee, profile: 'solidarity' }
    const yearly = PLANS.find((f) => f.id === 'navigo_yearly')!
    const reduction50 = PLANS.find((f) => f.id === 'navigo_discount_50')!
    expect(scorePlan(reduction50, solidarityUser)).toBe(0) // flags.hasAME absent
    void yearly
  })

  it('AME-flag user gets navigo_discount_50 with score > 0', () => {
    const ame: SimulatorParams = { ...baseEmployee, profile: 'solidarity', flags: { hasAME: true } }
    const reduction50 = PLANS.find((f) => f.id === 'navigo_discount_50')!
    expect(scorePlan(reduction50, ame)).toBeGreaterThan(0)
  })

  it('RSA user gets navigo_free recommended', () => {
    const rsa: SimulatorParams = { ...baseEmployee, profile: 'solidarity', flags: { hasRSA: true } }
    const recs = recommendPlans(rsa)
    expect(recs[0].plan.id).toBe('navigo_free')
  })

  it('student aged 20 gets imagine_r_student recommended', () => {
    const studentCase: SimulatorParams = { ...baseEmployee, profile: 'student', age: 20, flags: { isStudent: true } }
    const top = bestPlan(studentCase)
    expect(top?.id).toBe('imagine_r_student')
  })

  it('apprentice aged 17 gets imagine_r_school recommended', () => {
    const apprenticeCase: SimulatorParams = { ...baseEmployee, profile: 'school', age: 17, flags: { isApprentice: true } }
    const top = bestPlan(apprenticeCase)
    expect(top?.id).toBe('imagine_r_school')
  })

  it('retired user aged 64 gets navigo_senior recommended', () => {
    const retiredCase: SimulatorParams = { ...baseEmployee, profile: 'senior', age: 64, flags: { isRetired: true } }
    const top = bestPlan(retiredCase)
    expect(top?.id).toBe('navigo_senior')
  })

  it('child aged 8 gets imagine_r_junior recommended', () => {
    const kid: SimulatorParams = { ...baseEmployee, profile: 'junior_school', age: 8 }
    const top = bestPlan(kid)
    expect(top?.id).toBe('imagine_r_junior')
  })

  it('daily employee sees Navigo Annual first', () => {
    const employeeCase: SimulatorParams = { ...baseEmployee, profile: 'employee', age: 30, daysPerWeek: 5, flags: { isEmployee: true } }
    const top = bestPlan(employeeCase)
    expect(top?.id).toBe('navigo_yearly')
  })

  it('occasional usage puts navigo_day or liberty_plus near the top', () => {
    const occ: SimulatorParams = { ...baseEmployee, daysPerWeek: 1, tripsPerDay: 1 }
    const top = bestPlan(occ)
    expect(['navigo_day', 'liberty_plus']).toContain(top?.id)
  })

  it('standard public Navigo plans are recommended to an employee', () => {
    const employeeCase: SimulatorParams = { ...baseEmployee, profile: 'employee', age: 30 }
    const recs = recommendPlans(employeeCase)
    const ids = recs.map((r) => r.plan.id)
    expect(ids).toEqual(expect.arrayContaining(['navigo_month']))
  })
})
