import { MongoClient } from 'mongodb'

let client

export async function getDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
    await client.connect()
  }

  return client.db(process.env.MONGODB_DB || 'learnern_job_match')
}

export async function closeDatabase() {
  if (client) {
    await client.close()
    client = undefined
  }
}
