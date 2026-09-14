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
