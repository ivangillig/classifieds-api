import mongoose from 'mongoose'
import app from './app.js'
import dotenv from 'dotenv'
import runExpireListings from './jobs/expireListings.js'

dotenv.config()

const PORT = process.env.PORT || 5000
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://admin:SecureMongoDB2025!@127.0.0.1:27017/classifieds?authSource=admin'

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    runExpireListings()
  })
  .catch((err) => console.log(err))

app.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}`
  console.log(`Server running on port ${PORT}`)
  console.log(`Web server listening at: ${baseUrl}`)
})
