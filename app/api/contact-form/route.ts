import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()
    const {
      firstName,
      lastName,
      email,
      company,
      subject,
      message
    } = formData

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create the submission entry
    const timestamp = new Date().toISOString()
    const submissionEntry = `
=====================================
Submission Date: ${timestamp}
Name: ${firstName} ${lastName}
Email: ${email}
Company: ${company || 'Not provided'}
Subject: ${subject}
Message: ${message}
=====================================

`

    // Define the file path
    const dataDir = path.join(process.cwd(), 'data')
    const filePath = path.join(dataDir, 'contact-submissions.txt')

    try {
      // Ensure the data directory exists
      await fs.mkdir(dataDir, { recursive: true })
      
      // Append to the file (create if it doesn't exist)
      await fs.appendFile(filePath, submissionEntry, 'utf8')
      
      return NextResponse.json(
        { success: true, message: 'Contact form submitted successfully' },
        { status: 200 }
      )
    } catch (fileError) {
      console.error('File operation error:', fileError)
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}