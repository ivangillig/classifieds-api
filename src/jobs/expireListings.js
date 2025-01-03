import cron from 'node-cron'
import Listing from '../models/Listing.js'

async function runExpireListings() {
  try {
    const now = new Date()
    await Listing.updateMany(
      { validUntil: { $lt: now.toISOString() }, status: { $ne: 'expired' } },
      { $set: { status: 'expired' } }
    )
    console.log('Expired listings updated successfully')
  } catch (error) {
    console.error('Error updating expired listings:', error)
  }
}

// Schedule the job to run every day at midnight
cron.schedule('0 0 * * *', runExpireListings)

export default runExpireListings
