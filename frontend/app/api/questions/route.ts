import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    
    console.log(`Fetching questions from: ${BACKEND_URL}/api/questions${queryString ? `?${queryString}` : ''}`)
    
    const response = await fetch(`${BACKEND_URL}/api/questions${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    console.log(`Backend response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error response:', errorText)
      return NextResponse.json(
        { success: false, error: `Backend error: ${response.status} - ${errorText}` },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    console.log('Backend response data:', data)
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('authorization')
    
    console.log(`Creating question at: ${BACKEND_URL}/api/questions`)
    
    const response = await fetch(`${BACKEND_URL}/api/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Question creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
} 