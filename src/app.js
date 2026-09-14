import express from 'express'
import { ObjectId } from 'mongodb'
import { getDatabase } from './database.js'
import { scoreJob } from './match.js'
import { validateCandidate, validateJob } from './validation.js'

function asJson(document) {
  return { ...document, id: document._id.toString(), _id: undefined }
}

function readLimit(value) {
  if (value === undefined) return 10
  const limit = Number(value)
  return Number.isInteger(limit) && limit > 0 && limit <= 100 ? limit : null
}

function readId(value) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null
}

async function findById(collection, id, response, label) {
  const objectId = readId(id)
  if (!objectId) {
    response.status(400).json({ error: `Invalid ${label} id` })
    return null
  }

  const record = await collection.findOne({ _id: objectId })
  if (!record) response.status(404).json({ error: `${label} not found` })
  return record
}

function rankJobs(candidate, jobs, limit) {
  return jobs
    .map((job) => {
      const match = scoreJob(candidate, job)
      return match && { job: asJson(job), ...match }
    })
    .filter(Boolean)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
}

// Ranking Method
function rankCandidates(job, candidates, limit) {
  return candidates
    .map((candidate) => {
      const match = scoreJob(candidate, job)
      return match && { candidate: asJson(candidate), ...match }
    })
    .filter(Boolean)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
}

export function createApp() {
  const app = express()
  app.use(express.json())

  // create candidate
  app.post('/candidates', async (request, response, next) => {
    try {
      const error = validateCandidate(request.body)
      if (error) return response.status(400).json({ error })
      const database = await getDatabase()
      const candidate = { ...request.body }
      const result = await database.collection('candidates').insertOne(candidate)
      return response.status(201).json({ candidate: { ...candidate, id: result.insertedId.toString() } })
    } catch (error) {
      return next(error)
    }
  })

  // create job
  app.post('/jobs', async (request, response, next) => {
    try {
      const error = validateJob(request.body)
      if (error) return response.status(400).json({ error })
      const database = await getDatabase()
      const job = { ...request.body }
      const result = await database.collection('jobs').insertOne(job)
      return response.status(201).json({ job: { ...job, id: result.insertedId.toString() } })
    } catch (error) {
      return next(error)
    }
  })

  // find match based on candidate id
  app.get('/candidates/:id/recommendations', async (request, response, next) => {
    try {
      const limit = readLimit(request.query.limit)
      if (!limit) return response.status(400).json({ error: 'limit must be a positive integer up to 100' })
      const database = await getDatabase()
      const candidate = await findById(database.collection('candidates'), request.params.id, response, 'candidate')
      if (!candidate) return undefined
      const jobs = await database.collection('jobs').find().toArray()
      return response.json({ candidate: asJson(candidate), recommendations: rankJobs(candidate, jobs, limit) })
    } catch (error) {
      return next(error)
    }
  })

  // find match based on job id
  app.get('/jobs/:id/recommendations', async (request, response, next) => {
    try {
      const limit = readLimit(request.query.limit)
      if (!limit) return response.status(400).json({ error: 'limit must be a positive integer up to 100' })
      const database = await getDatabase()
      const job = await findById(database.collection('jobs'), request.params.id, response, 'job')
      if (!job) return undefined
      const candidates = await database.collection('candidates').find().toArray()
      return response.json({ job: asJson(job), recommendations: rankCandidates(job, candidates, limit) })
    } catch (error) {
      return next(error)
    }
  })

  app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && 'body' in error) return response.status(400).json({ error: 'Invalid JSON body' })
    return response.status(500).json({ error: 'Something went wrong' })
  })

  return app
}
