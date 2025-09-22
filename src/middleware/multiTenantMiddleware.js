// Multi-tenant middleware for subdomain-based country detection

// Argentina-first configuration (expandable for future countries)
const defaultConfig = {
  country: 'AR',
  language: 'es',
  currency: 'ARS',
}

const tenantConfig = {
  // Argentina (active)
  ar: defaultConfig,

  // Future countries (ready to activate when needed)
  // us: { country: 'US', language: 'en', currency: 'USD' },
  // br: { country: 'BR', language: 'pt', currency: 'BRL' },
}

// Argentina-first middleware (with future expansion capability)
export function multiTenantMiddleware(req, res, next) {
  try {
    // For Year 1: Default to Argentina for all requests
    // This makes the API work seamlessly for Argentina without configuration

    const host = req.get('host') || req.hostname
    const subdomain = host.split('.')[0].toLowerCase()

    // Check if we have a specific tenant configuration
    let config = tenantConfig[subdomain]

    // If no specific config found, default to Argentina
    if (!config) {
      config = defaultConfig
    }

    // Add tenant info to request
    req.tenant = {
      subdomain: subdomain,
      country: config.country,
      language: config.language,
      currency: config.currency,
      config: config,
      isDefault: !tenantConfig[subdomain], // Flag if using default config
    }

    // Log for development (remove in production)
    if (process.env.NODE_ENV === 'development') {
      const flag = config.country === 'AR' ? '🇦🇷' : '🌍'
      console.log(`${flag} Tenant: ${subdomain}.miapp.com -> ${config.country}`)
    }

    next()
  } catch (error) {
    console.error('❌ Multi-tenant middleware error:', error)
    // Even if middleware fails, default to Argentina
    req.tenant = {
      subdomain: 'default',
      country: 'AR',
      language: 'es',
      currency: 'ARS',
      isDefault: true,
    }
    next()
  }
}

// Helper to get tenant info from request
export function getTenantInfo(req) {
  return req.tenant || null
}

// Helper to check if request is from a known tenant
export function isKnownTenant(req) {
  return !!req.tenant
}

// Helper to get tenant's country or fallback
export function getTenantCountry(req, fallback = null) {
  return req.tenant?.country || fallback
}

// Admin function to add new tenant dynamically (for future use)
export function addTenant(subdomain, config) {
  tenantConfig[subdomain.toLowerCase()] = config
  console.log(`✅ Added new tenant: ${subdomain} -> ${config.country}`)
}

// Get all configured tenants (for admin/monitoring)
export function getAllTenants() {
  return Object.keys(tenantConfig).map((subdomain) => ({
    subdomain,
    ...tenantConfig[subdomain],
  }))
}
