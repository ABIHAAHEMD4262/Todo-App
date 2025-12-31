import { auth } from "@/lib/auth-server"
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    return await auth.handler(request)
  } catch (error) {
    console.error('Auth GET error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Authentication error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    return await auth.handler(request)
  } catch (error) {
    console.error('Auth POST error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Authentication error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
