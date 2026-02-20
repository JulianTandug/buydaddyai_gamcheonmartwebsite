import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 1. HANDLE BEST SELLER TOGGLE (PATCH)
export async function PATCH(request, { params }) {
  const { id } = await params; 

  try {
    const { is_best_seller } = await request.json();

    // Update the database with the new boolean value
    await sql`
      UPDATE products 
      SET is_best_seller = ${is_best_seller} 
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Status updated" }, { status: 200 });
  } catch (error) {
    console.error("Patch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. HANDLE DELETION (DELETE)
export async function DELETE(request, { params }) {
  const { id } = await params; 

  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
    return NextResponse.json({ message: "Product deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}