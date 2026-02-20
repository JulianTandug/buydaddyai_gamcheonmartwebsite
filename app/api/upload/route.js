import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    // 1. Read the image as a buffer to avoid "stream" crashes
    const arrayBuffer = await request.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Explicitly log the token status (Check your Terminal!)
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("CRITICAL: BLOB_READ_WRITE_TOKEN is missing from the server environment!");
      return NextResponse.json({ error: "Server configuration missing token" }, { status: 500 });
    }

    const blob = await put(filename, buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    // This sends the REAL error to your browser console
    console.error("SERVER CRASH:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}