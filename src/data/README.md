# Location Data

This directory contains GeoNames data files for populating location information.

## Getting Started

1. **Download GeoNames Data**

   - Go to: https://download.geonames.org/export/dump/
   - For Argentina only: Download `AR.zip`
   - For all cities worldwide: Download `cities15000.zip` (cities with population > 15,000)
   - For specific countries: Download `{COUNTRY_CODE}.zip`

2. **Extract Files**

   - Extract the `.txt` file to this directory
   - Example: `AR.txt` for Argentina data

3. **Run Population Script**

   ```bash
   # Migrate existing data to new schema
   node src/scripts/populateLocations.js --migrate-only

   # Populate with new data (keeping existing)
   node src/scripts/populateLocations.js

   # Clear existing and populate fresh
   node src/scripts/populateLocations.js --clear

   # Use custom file path
   node src/scripts/populateLocations.js --file=path/to/custom.txt
   ```

## File Formats

### GeoNames Format

The GeoNames files contain tab-separated values with the following columns:

- geonameid
- name
- asciiname
- alternatenames
- latitude
- longitude
- feature class
- feature code
- country code
- cc2
- admin1 code
- admin2 code
- admin3 code
- admin4 code
- population
- elevation
- dem
- timezone
- modification date

## Supported Feature Codes

The script imports the following types of locations:

- **PPL, PPLA, PPLC**: Populated places (cities)
- **ADM1, ADM2**: Administrative divisions (states/provinces)
- **PCLI**: Country

## File Structure After Import

```
src/data/
├── README.md          # This file
├── AR.txt            # Argentina GeoNames data (download separately)
├── cities15000.txt   # Worldwide cities data (download separately)
└── .gitkeep          # Keep directory in git
```

**Note:** Data files are not included in the repository due to their size. Download them as needed.
