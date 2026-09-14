import test from 'node:test'
import assert from 'node:assert/strict'
import { hasMustHaveSkills, scoreJob } from '../src/match.js'

const job = {
  requiredSkills: [
    { name: 'JavaScript', type: 'must-have' },
    { name: 'MongoDB', type: 'nice-to-have' }
  ],
  minYearsExperience: 4,
  location: 'Bengaluru',
  salaryRange: { min: 1000000, max: 1600000 },
  remoteAllowed: true
}

test('filters out a candidate missing a must-have skill', () => {
  const candidate = { skills: ['MongoDB'], yearsOfExperience: 8, location: 'Bengaluru', expectedSalary: 1000000 }
  assert.equal(hasMustHaveSkills(candidate, job), false)
  assert.equal(scoreJob(candidate, job), null)
})

test('penalizes lower experience without filtering the candidate out', () => {
  const candidate = { skills: ['JavaScript'], yearsOfExperience: 2, location: 'Bengaluru', expectedSalary: 1000000 }
  const result = scoreJob(candidate, job)
  assert.equal(result.breakdown.experience.score, 10)
  assert.ok(result.score > 0)
})

test('gives no salary points when the expectation is at or above the job maximum', () => {
  const candidate = { skills: ['JavaScript', 'MongoDB'], yearsOfExperience: 5, location: 'Bengaluru', expectedSalary: 1800000 }
  assert.equal(scoreJob(candidate, job).breakdown.salary.score, 0)
})

test('scores an exact location above a remote location match', () => {
  const exact = scoreJob({ skills: ['JavaScript'], yearsOfExperience: 4, location: 'Bengaluru', expectedSalary: 1000000 }, job)
  const remote = scoreJob({ skills: ['JavaScript'], yearsOfExperience: 4, location: 'Mumbai', expectedSalary: 1000000 }, job)
  assert.equal(exact.breakdown.location.score, 15)
  assert.equal(remote.breakdown.location.score, 9)
  assert.ok(exact.score > remote.score)
})

test('returns the maximum salary score when the offer floor meets the expectation', () => {
  const candidate = { skills: ['JavaScript'], yearsOfExperience: 4, location: 'Bengaluru', expectedSalary: 1000000 }
  assert.equal(scoreJob(candidate, job).breakdown.salary.score, 15)
})
