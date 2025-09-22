import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    // Unique identifiers
    geonameid: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    // Basic information
    name: {
      type: String,
      required: true,
      index: true,
    },
    asciiName: {
      type: String,
      required: true,
    },

    // Administrative hierarchy
    country: {
      type: String,
      required: true,
      index: true,
    },
    countryCode: {
      type: String,
      required: true,
      length: 2, // ISO 3166-1 alpha-2
    },
    subcountry: {
      type: String,
      required: true,
      index: true,
    },
    subcountryCode: {
      type: String,
      required: false, // For province/state codes
    },

    // Geographic coordinates (for proximity searches)
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere', // Geospatial index
      },
    },

    // Additional information
    featureClass: {
      type: String,
      required: true, // P (populated place), A (administrative), etc.
    },
    featureCode: {
      type: String,
      required: true, // PPL (populated place), ADM1 (first-order administrative), etc.
    },
    population: {
      type: Number,
      default: 0,
    },
    timezone: {
      type: String,
      required: false,
    },

    // Alternative names (multilingual support)
    alternateNames: [
      {
        name: String,
        language: String, // es, en, etc.
        isPreferredName: { type: Boolean, default: false },
        isShortName: { type: Boolean, default: false },
      },
    ],

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for optimized searches
locationSchema.index({ country: 1, subcountry: 1 })
locationSchema.index({ countryCode: 1, subcountryCode: 1 })
locationSchema.index({ name: 'text', asciiName: 'text' }) // Text search

// Static methods
locationSchema.statics.findByCountry = function (countryCode) {
  return this.find({ countryCode, isActive: true })
}

locationSchema.statics.findByProximity = function (
  longitude,
  latitude,
  maxDistanceKm = 50
) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: maxDistanceKm * 1000, // Convert to meters
      },
    },
    isActive: true,
  })
}

locationSchema.statics.searchByName = function (searchTerm, country = 'AR') {
  return this.find({
    $and: [
      { countryCode: country },
      { isActive: true },
      {
        $or: [
          { name: new RegExp(searchTerm, 'i') },
          { asciiName: new RegExp(searchTerm, 'i') },
          { 'alternateNames.name': new RegExp(searchTerm, 'i') },
        ],
      },
    ],
  })
}

const Location = mongoose.model('Location', locationSchema)

export default Location
