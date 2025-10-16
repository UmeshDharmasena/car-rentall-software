import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, contactNumber, softwareName } = body

    // Validate required fields
    if (!name || !email || !contactNumber || !softwareName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Create contact data entry
    const timestamp = new Date().toLocaleString()
    const contactEntry = `
=====================================
CONTACT FORM SUBMISSION
=====================================
Timestamp: ${timestamp}
Software Interest: ${softwareName}
Name: ${name}
Email: ${email}
Contact Number: ${contactNumber}
Source: FleetIQ Website - Software Card Click
=====================================

`

    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      await mkdir(dataDir, { recursive: true })
    }

    // Define file path
    const filePath = join(dataDir, 'contact-submissions.txt')

    // Append data to file
    await writeFile(filePath, contactEntry, { flag: 'a' })

    console.log('Contact data saved to file:', {
      name,
      email,
      contactNumber,
      softwareName,
      timestamp
    })

    return NextResponse.json(
      { 
        message: 'Contact information saved successfully',
        success: true 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing contact form:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}