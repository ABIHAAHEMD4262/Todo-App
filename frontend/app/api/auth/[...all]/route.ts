import { NextResponse } from 'next/server'

// This route acts as a proxy to forward auth requests to the backend API
// This helps avoid CORS issues in production deployment
export async function GET(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  try {
    // Extract the specific auth endpoint from the URL
    const { all } = await params;
    const endpoint = all?.join('/') || '';

    // Forward to backend auth
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${endpoint}`, {
      method: 'GET',
      headers: {
        ...request.headers,
      },
    });

    // Return the backend response directly to preserve all headers and status codes
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ all: string[] }> }
) {
  try {
    // Extract the specific auth endpoint from the URL
    const { all } = await params;
    const endpoint = all?.join('/') || '';

    // Forward to backend auth
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
      },
      body: await request.json(),
    });

    // Return the backend response directly to preserve all headers and status codes
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