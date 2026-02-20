import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  const { rows } = await sql`SELECT * FROM products ORDER BY id DESC`;
  return NextResponse.json(rows);
}

export async function POST(request) {
  try {
    // 1. Receive data from your dashboard
    const { name, price, description, image_url, category, stock_quantity } = await request.json();

    // 2. Insert into the EXACT column names from your Neon screenshot
    await sql`
      INSERT INTO products (name, price, description, image_url, category, stock_quantity)
      VALUES (${name}, ${price}, ${description}, ${image_url}, ${category}, ${stock_quantity})
    `;

    return NextResponse.json({ message: "Success" }, { status: 201 });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}