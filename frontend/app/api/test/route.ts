import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test database connection
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
    const authSecret = process.env.BETTER_AUTH_SECRET

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      config: {
        hasDatabaseUrl: !!dbUrl,
        hasAuthSecret: !!authSecret,
        authSecretLength: authSecret?.length || 0,
        databaseType: dbUrl?.includes('neon') ? 'neon' : 'other',
        environment: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
