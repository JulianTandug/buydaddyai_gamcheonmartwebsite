'use server';
import { neon } from '@neondatabase/serverless';

export async function createOrderAction(data) {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    const itemsArray = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;

    // 1. Insert the new order
    await sql`
      INSERT INTO orders (
        customer_name, user_email, phone_number, user_role, address, 
        payment_method, items, total_price, status
      )
      VALUES (
        ${data.customer_name}, ${data.user_email}, ${data.phone_number}, 
        ${data.user_role}, ${data.address}, ${data.payment_method}, 
        ${JSON.stringify(itemsArray)}, ${data.total_price}, 'Pending'
      )
    `;

    // 2. 📉 Selective Stock Update
    for (const item of itemsArray) {
      const fuzzyName = `%${item.name.trim().replace(/[\s-]/g, '%')}%`;

      await sql`
        UPDATE products 
        SET stock_quantity = stock_quantity - ${Number(item.quantity)} 
        WHERE (id = ${item.id} OR name ILIKE ${fuzzyName})
        AND stock_quantity > 0
      `;
 
    }

    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateOrderStatus(orderId, newStatus) {
  const sql = neon(process.env.DATABASE_URL);
  try {
    await sql`UPDATE orders SET status = ${newStatus} WHERE id = ${orderId}`;
    return { success: true };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, error: error.message };
  }
}