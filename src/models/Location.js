import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    // Official codes from Poblaciones.org
    code: {
      type: String,
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

    // Province reference (Foreign Key)
    province_code: {
      type: String,
      required: true,
      index: true,
      ref: 'Province', // Reference to Province model
    },

    // Department/Comuna (optional - mainly for Buenos Aires)
    department_code: {
      type: String,
      required: false,
      index: true,
    },
    department_name: {
      type: String,
      required: false,
    },

    // Country (inherited from province, but kept for queries)
    country: {
      type: String,
      required: true,
      default: 'Argentina',
      index: true,
    },
    countryCode: {
      type: String,
      required: true,
      default: 'AR',
      length: 2,
    },

    // Geographic data from Poblaciones.org - FLAT structure
    surface: {
      type: Number, // Superficie en km2
      required: false,
    },

    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },

    // GeoJSON coordinates (for proximity searches)
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere',
      },
    },

    // Population (if available)
    population: {
      type: Number,
      default: 0,
    },

    // Data source tracking
    source: {
      type: String,
      default: 'poblaciones.org',
    },

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
locationSchema.index({ province_code: 1, department_code: 1 })
locationSchema.index({ countryCode: 1, province_code: 1 })
locationSchema.index({ name: 'text' }) // Text search

// Pre-save middleware to generate GeoJSON coordinates
locationSchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.coordinates = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    }
  }
  next()
})

// Static methods
locationSchema.statics.findByCountry = function (countryCode = 'AR') {
  return this.find({ countryCode, isActive: true })
}

// findProvinces method removed - provinces are now in separate Province model

locationSchema.statics.findCitiesByProvince = function (
  provinceCode,
  countryCode = 'AR'
) {
  return this.find({
    countryCode,
    province_code: provinceCode,
    isActive: true,
  }).sort({ name: 1 })
}

locationSchema.statics.findDepartmentsByProvince = function (
  provinceCode,
  countryCode = 'AR'
) {
  return this.find({
    countryCode,
    province_code: provinceCode,
    department_code: { $exists: true, $ne: null }, // Only locations with departments
    isActive: true,
  }).sort({ name: 1 })
}

// Method to get location with province information
locationSchema.statics.findWithProvince = function (query = {}) {
  return this.aggregate([
    {
      $match: { isActive: true, ...query },
    },
    {
      $lookup: {
        from: 'provinces',
        localField: 'province_code',
        foreignField: 'code',
        as: 'province',
      },
    },
    {
      $unwind: '$province',
    },
    {
      $sort: { name: 1 },
    },
  ])
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
        $maxDistance: maxDistanceKm * 1000,
      },
    },
    isActive: true,
  })
}

locationSchema.statics.searchByName = function (
  searchTerm,
  countryCode = 'AR'
) {
  return this.find({
    countryCode,
    isActive: true,
    $or: [
      { name: new RegExp(searchTerm, 'i') },
      { department_name: new RegExp(searchTerm, 'i') },
    ],
  }).sort({ name: 1 })
}

const Location = mongoose.model('Location', locationSchema)

export default Location
