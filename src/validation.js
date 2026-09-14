function isText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
}

export function validateCandidate(candidate) {
  if (!candidate || typeof candidate !== 'object') return 'A JSON body is required'
  if (!isText(candidate.name)) return 'name is required'
  if (!Array.isArray(candidate.skills) || !candidate.skills.every(isText)) return 'skills must be a list of strings'
  if (!isNumber(candidate.yearsOfExperience) || candidate.yearsOfExperience < 0) return 'yearsOfExperience must be a non-negative number'
  if (!isText(candidate.location)) return 'location is required'
  if (!isNumber(candidate.expectedSalary) || candidate.expectedSalary < 0) return 'expectedSalary must be a non-negative number'
  return null
}

function isSkill(value) {
  return value && isText(value.name) && ['must-have', 'nice-to-have'].includes(value.type)
}

export function validateJob(job) {
  if (!job || typeof job !== 'object') return 'A JSON body is required'
  if (!isText(job.title)) return 'title is required'
  if (!Array.isArray(job.requiredSkills) || !job.requiredSkills.every(isSkill)) return 'requiredSkills must contain skills with a name and type'
  if (!isNumber(job.minYearsExperience) || job.minYearsExperience < 0) return 'minYearsExperience must be a non-negative number'
  if (!isText(job.location)) return 'location is required'
  if (!job.salaryRange || !isNumber(job.salaryRange.min) || !isNumber(job.salaryRange.max) || job.salaryRange.min < 0 || job.salaryRange.max < job.salaryRange.min) return 'salaryRange needs valid min and max values'
  if (typeof job.remoteAllowed !== 'boolean') return 'remoteAllowed must be true or false'
  return null
}
