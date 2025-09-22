// Simple AR.txt loader with better error handling
import fs from 'fs'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://admin:SecureMongoDB2025!@127.0.0.1:27017/classifieds?authSource=admin'

async function loadArData() {
  try {
    console.log('🚀 Starting AR.txt data loading...')

    // Connect with timeout
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })
    console.log('✅ MongoDB connected')

    const db = mongoose.connection.db
    const collection = db.collection('locations')

    // Clear existing data
    console.log('🗑️ Clearing existing data...')
    const deleteResult = await collection.deleteMany({})
    console.log(`✅ Cleared ${deleteResult.deletedCount} existing locations`)

    // Check if file exists
    const filePath = 'src/data/AR.txt'
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`)
      return
    }

    console.log('📂 Reading AR.txt file...')
    const data = fs.readFileSync(filePath, 'utf8')
    console.log(
      `📄 File read successfully, size: ${(data.length / 1024 / 1024).toFixed(
        2
      )} MB`
    )

    const lines = data.split('\n').filter((line) => line.trim())
    console.log(`📊 Found ${lines.length} lines to process`)

    // Show sample of data
    console.log('\n🔍 Sample lines:')
    lines.slice(0, 3).forEach((line, index) => {
      console.log(`${index + 1}. ${line.substring(0, 100)}...`)
    })

    let processed = 0
    let skipped = 0
    const batchSize = 500
    let batch = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const fields = line.split('\t')

      if (fields.length < 19) {
        skipped++
        continue
      }

      const [
        geonameid,
        name,
        asciiname,
        alternatenames,
        latitude,
        longitude,
        featureClass,
        featureCode,
        countryCode,
        cc2,
        admin1Code,
        admin2Code,
        admin3Code,
        admin4Code,
        population,
        elevation,
        dem,
        timezone,
        modificationDate,
      ] = fields

      // Filter relevant places
      const relevantCodes = ['PPL', 'PPLA', 'PPLC', 'ADM1', 'ADM2', 'PCLI']
      if (!relevantCodes.includes(featureCode)) {
        skipped++
        continue
      }

      // Validate required fields
      if (!geonameid || !name || !latitude || !longitude) {
        skipped++
        continue
      }

      const location = {
        geonameid: parseInt(geonameid),
        name: name,
        asciiName: asciiname || name,
        country: 'Argentina',
        countryCode: 'AR',
        subcountry: getProvinceName(admin1Code),
        subcountryCode: admin1Code,
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        featureClass: featureClass,
        featureCode: featureCode,
        population: parseInt(population) || 0,
        timezone: timezone || 'America/Argentina/Buenos_Aires',
        alternateNames: parseAlternateNames(alternatenames),
        isActive: true,
        lastUpdated: new Date(),
      }

      batch.push(location)
      processed++

      // Insert batch
      if (batch.length >= batchSize) {
        try {
          await collection.insertMany(batch, { ordered: false })
          console.log(
            `✅ Inserted batch: ${processed} processed, ${skipped} skipped`
          )
          batch = []
        } catch (error) {
          console.log(`⚠️  Batch error (continuing): ${error.message}`)
          batch = []
        }
      }

      // Progress update every 5000 lines
      if (i % 5000 === 0 && i > 0) {
        console.log(
          `📊 Progress: ${i}/${lines.length} lines (${(
            (i / lines.length) *
            100
          ).toFixed(1)}%)`
        )
      }
    }

    // Insert final batch
    if (batch.length > 0) {
      try {
        await collection.insertMany(batch, { ordered: false })
        console.log(`✅ Inserted final batch`)
      } catch (error) {
        console.log(`⚠️  Final batch error: ${error.message}`)
      }
    }

    console.log(`\n📊 Processing completed:`)
    console.log(`  Processed: ${processed}`)
    console.log(`  Skipped: ${skipped}`)
    console.log(`  Total lines: ${lines.length}`)

    // Final count
    const finalCount = await collection.countDocuments()
    console.log(`🎯 Final database count: ${finalCount}`)

    // Sample results
    console.log('\n🔍 Sample inserted data:')
    const samples = await collection.find({}).limit(3).toArray()
    samples.forEach((loc, index) => {
      console.log(
        `${index + 1}. ${loc.name} (${loc.featureCode}) - [${loc.coordinates}]`
      )
    })
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed')
  }
}

function getProvinceName(admin1Code) {
  const provinces = {
    '01': 'Buenos Aires',
    '02': 'Catamarca',
    '03': 'Chaco',
    '04': 'Chubut',
    '05': 'Córdoba',
    '06': 'Corrientes',
    '07': 'Entre Ríos',
    '08': 'Formosa',
    '09': 'Jujuy',
    10: 'La Pampa',
    11: 'La Rioja',
    12: 'Mendoza',
    13: 'Misiones',
    14: 'Neuquén',
    15: 'Río Negro',
    16: 'Salta',
    17: 'San Juan',
    18: 'San Luis',
    19: 'Santa Cruz',
    20: 'Santa Fe',
    21: 'Santiago del Estero',
    22: 'Tierra del Fuego',
    23: 'Tucumán',
    24: 'Ciudad Autónoma de Buenos Aires',
  }
  return provinces[admin1Code] || admin1Code || 'Unknown'
}

function parseAlternateNames(alternateNamesStr) {
  if (!alternateNamesStr) return []

  const names = alternateNamesStr.split(',').filter((name) => name.trim())
  return names.slice(0, 5).map((name) => ({
    name: name.trim(),
    language: 'unknown',
  }))
}

loadArData()
  .then(() => {
    console.log('🎉 Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
