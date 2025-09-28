import mongoose from 'mongoose'

const provinceSchema = new mongoose.Schema(
  {
    // Official code from Poblaciones.org
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

    // Country (ready for expansion to other countries)
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

    // Geographic data from Poblaciones.org
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

// Indexes for optimized searches
provinceSchema.index({ countryCode: 1, isActive: 1 })
provinceSchema.index({ name: 'text' })

// Pre-save middleware to generate GeoJSON coordinates
provinceSchema.pre('save', function (next) {
  if (this.latitude && this.longitude) {
    this.coordinates = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    }
  }
  next()
})

// Static methods
provinceSchema.statics.findByCountry = function (countryCode = 'AR') {
  return this.find({ countryCode, isActive: true }).sort({ name: 1 })
}

provinceSchema.statics.findByCode = function (code, countryCode = 'AR') {
  return this.findOne({ code, countryCode, isActive: true })
}

provinceSchema.statics.searchByName = function (
  searchTerm,
  countryCode = 'AR'
) {
  return this.find({
    countryCode,
    isActive: true,
    name: new RegExp(searchTerm, 'i'),
  }).sort({ name: 1 })
}

const Province = mongoose.model('Province', provinceSchema)

export default Province
