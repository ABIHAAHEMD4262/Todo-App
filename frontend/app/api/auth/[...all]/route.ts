import { NextResponse } from 'next/server'

// This is a placeholder auth route
// The actual authentication is handled by the backend API
export async function GET(request: Request) {
  try {
    // Forward to backend auth
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
      method: 'GET',
      headers: {
        ...request.headers,
      },
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
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
    // Forward to backend auth
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
      method: 'POST',
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
      },
      body: await request.json(),
    });

    const data = await backendResponse.json();
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error) {
    console.error('Auth POST error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Authentication error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
