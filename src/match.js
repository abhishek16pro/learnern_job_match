const weights = {
  skills: 50,
  experience: 20,
  location: 15,
  salary: 15
}

function normalize(value) {
  return value.trim().toLowerCase()
}

function round(value) {
  return Math.round(value * 100) / 100
}

export function hasMustHaveSkills(candidate, job) {
  const candidateSkills = new Set(candidate.skills.map(normalize))
  return job.requiredSkills
    .filter((skill) => skill.type === 'must-have')
    .every((skill) => candidateSkills.has(normalize(skill.name)))
}

function scoreSkills(candidate, job) {
  const candidateSkills = new Set(candidate.skills.map(normalize))
  const mustHave = job.requiredSkills.filter((skill) => skill.type === 'must-have')
  const niceToHave = job.requiredSkills.filter((skill) => skill.type === 'nice-to-have')
  const niceMatches = niceToHave.filter((skill) => candidateSkills.has(normalize(skill.name))).length

  if (mustHave.length === 0) {
    return niceToHave.length === 0 ? weights.skills : weights.skills * (niceMatches / niceToHave.length)
  }

  return niceToHave.length === 0 ? weights.skills : 35 + 15 * (niceMatches / niceToHave.length)
}

function scoreSalary(expectedSalary, salaryRange) {
  if (expectedSalary <= salaryRange.min) return weights.salary
  if (expectedSalary >= salaryRange.max) return 0
  return weights.salary * (salaryRange.max - expectedSalary) / (salaryRange.max - salaryRange.min)
}

export function scoreJob(candidate, job) {
  if (!hasMustHaveSkills(candidate, job)) return null

  const skills = scoreSkills(candidate, job)
  const experience = job.minYearsExperience === 0
    ? weights.experience
    : weights.experience * Math.min(1, candidate.yearsOfExperience / job.minYearsExperience)
  const location = normalize(candidate.location) === normalize(job.location)
    ? weights.location
    : job.remoteAllowed ? 9 : 0
  const salary = scoreSalary(candidate.expectedSalary, job.salaryRange)
  const breakdown = {
    skills: { score: round(skills), max: weights.skills },
    experience: { score: round(experience), max: weights.experience },
    location: { score: round(location), max: weights.location },
    salary: { score: round(salary), max: weights.salary }
  }

  return { score: round(skills + experience + location + salary), breakdown }
}
