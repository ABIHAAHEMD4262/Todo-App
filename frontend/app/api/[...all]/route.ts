import { NextResponse } from 'next/server'

// This route acts as a proxy to forward API requests to the backend API
// This helps avoid CORS issues in production deployment
// Specifically handles non-auth API endpoints like /api/{user_id}/tasks, /api/{user_id}/dashboard, etc.
export async function GET(
  request: Request,
  { params }: { params: { all: string[] } }
) {
  try {
    // Extract the specific API endpoint from the URL
    const endpoint = params.all?.join('/') || '';

    // Forward to backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}`, {
      method: 'GET',
      headers: {
        ...request.headers,
      },
    });

    // Return the backend response directly to preserve all headers and status codes
    if (backendResponse.headers.get('content-type')?.includes('application/json')) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      // For non-JSON responses (like plain text, etc.)
      const text = await backendResponse.text();
      return new Response(text, {
        status: backendResponse.status,
        headers: backendResponse.headers
      });
    }
  } catch (error) {
    console.error('API GET error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'API error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { all: string[] } }
) {
  try {
    // Extract the specific API endpoint from the URL
    const endpoint = params.all?.join('/') || '';

    // Forward to backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}`, {
      method: 'POST',
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
      },
      body: await request.json(),
    });

    // Return the backend response directly to preserve all headers and status codes
    if (backendResponse.headers.get('content-type')?.includes('application/json')) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      // For non-JSON responses (like plain text, etc.)
      const text = await backendResponse.text();
      return new Response(text, {
        status: backendResponse.status,
        headers: backendResponse.headers
      });
    }
  } catch (error) {
    console.error('API POST error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'API error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { all: string[] } }
) {
  try {
    // Extract the specific API endpoint from the URL
    const endpoint = params.all?.join('/') || '';

    // Forward to backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}`, {
      method: 'PUT',
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
      },
      body: await request.json(),
    });

    // Return the backend response directly to preserve all headers and status codes
    if (backendResponse.headers.get('content-type')?.includes('application/json')) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      // For non-JSON responses (like plain text, etc.)
      const text = await backendResponse.text();
      return new Response(text, {
        status: backendResponse.status,
        headers: backendResponse.headers
      });
    }
  } catch (error) {
    console.error('API PUT error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'API error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { all: string[] } }
) {
  try {
    // Extract the specific API endpoint from the URL
    const endpoint = params.all?.join('/') || '';

    // Forward to backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}`, {
      method: 'PATCH',
      headers: {
        ...request.headers,
        'Content-Type': 'application/json',
      },
      body: await request.json(),
    });

    // Return the backend response directly to preserve all headers and status codes
    if (backendResponse.headers.get('content-type')?.includes('application/json')) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      // For non-JSON responses (like plain text, etc.)
      const text = await backendResponse.text();
      return new Response(text, {
        status: backendResponse.status,
        headers: backendResponse.headers
      });
    }
  } catch (error) {
    console.error('API PATCH error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'API error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { all: string[] } }
) {
  try {
    // Extract the specific API endpoint from the URL
    const endpoint = params.all?.join('/') || '';

    // Forward to backend API
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...request.headers,
      },
    });

    // Return the backend response directly to preserve all headers and status codes
    if (backendResponse.status === 204) {
      // No content response for DELETE
      return new Response(null, { status: 204 });
    } else if (backendResponse.headers.get('content-type')?.includes('application/json')) {
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } else {
      // For non-JSON responses (like plain text, etc.)
      const text = await backendResponse.text();
      return new Response(text, {
        status: backendResponse.status,
        headers: backendResponse.headers
      });
    }
  } catch (error) {
    console.error('API DELETE error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'API error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}