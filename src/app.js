import express from 'express'
import { getDatabase } from './database.js'
import { validateCandidate } from './validation.js'

export function createApp() {
  const app = express()
  app.use(express.json())

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

  return app
}
