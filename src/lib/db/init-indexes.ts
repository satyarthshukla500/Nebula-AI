/**
 * Initialize MongoDB Indexes Script
 * 
 * Run this script to create all required indexes for the Nebula AI upgrade.
 * This can be run manually or as part of the deployment process.
 * 
 * Usage:
 *   npx tsx src/lib/db/init-indexes.ts
 */

import { initializeIndexes } from '../mongodb'

async function main() {
  console.log('🚀 Starting index initialization...')
  
  try {
    await initializeIndexes()
    console.log('✅ Index initialization completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Index initialization failed:', error)
    process.exit(1)
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main()
}

export default main
