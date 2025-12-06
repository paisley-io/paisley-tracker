import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 1. GET: Fetch all items
export async function GET() {
  try {
    // Prevent caching to ensure live updates
    const { rows } = await sql`SELECT * FROM scope_items ORDER BY created_at DESC`;
    
    // Map snake_case DB columns to camelCase JS objects for the frontend
    const items = rows.map(row => ({
      id: row.id,
      priority: row.priority,
      title: row.title,
      category: row.category,
      sowRef: row.sow_ref,
      sstStatus: row.sst_status,
      ourPosition: row.our_position,
      decision: row.decision,
      phase: row.phase,
      timeline: row.timeline,
      dependencies: row.dependencies,
      activity: row.activity || [],
      signedOff: row.signed_off
    }));
    
    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// 2. POST: Add Item or Bulk Import
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (Array.isArray(body)) {
      // Bulk Import Logic
      for (const item of body) {
        await sql`
          INSERT INTO scope_items (id, priority, title, category, sow_ref, sst_status, our_position, decision, phase, timeline, dependencies, activity, signed_off)
          VALUES (
            ${item.id}, 
            ${item.priority}, 
            ${item.title}, 
            ${item.category}, 
            ${item.sowRef}, 
            ${JSON.stringify(item.sstStatus)}, 
            ${JSON.stringify(item.ourPosition)}, 
            ${item.decision}, 
            ${item.phase}, 
            ${item.timeline}, 
            ${item.dependencies}, 
            ${JSON.stringify(item.activity)}, 
            ${item.signedOff}
          )
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      return NextResponse.json({ message: "Bulk import successful" });
    } else {
      // Single Item Create Logic
      await sql`
        INSERT INTO scope_items (id, priority, title, category, sow_ref, sst_status, our_position, decision, phase, timeline, dependencies, activity, signed_off)
        VALUES (
          ${body.id}, 
          ${body.priority}, 
          ${body.title}, 
          ${body.category}, 
          ${body.sowRef}, 
          ${JSON.stringify(body.sstStatus)}, 
          ${JSON.stringify(body.ourPosition)}, 
          ${body.decision}, 
          ${body.phase}, 
          ${body.timeline}, 
          ${body.dependencies}, 
          ${JSON.stringify(body.activity)}, 
          ${body.signedOff}
        )
      `;
      return NextResponse.json({ message: "Item added" });
    }
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

// 3. PUT: Update Item
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    // Handle specific partial updates (like adding a comment or changing status)
    if (updates.activity) {
      await sql`UPDATE scope_items SET activity = ${JSON.stringify(updates.activity)} WHERE id = ${id}`;
    }
    if (updates.decision) {
      await sql`UPDATE scope_items SET decision = ${updates.decision} WHERE id = ${id}`;
    }
    if (updates.signedOff !== undefined) {
      await sql`UPDATE scope_items SET signed_off = ${updates.signedOff} WHERE id = ${id}`;
    }
    
    // Handle full updates (from the "Edit Item" modal)
    if (updates.title) {
      await sql`
        UPDATE scope_items 
        SET 
          title = ${updates.title}, 
          priority = ${updates.priority}, 
          category = ${updates.category}, 
          timeline = ${updates.timeline}, 
          dependencies = ${updates.dependencies}, 
          sow_ref = ${updates.sowRef}, 
          sst_status = ${JSON.stringify(updates.sstStatus)}, 
          our_position = ${JSON.stringify(updates.ourPosition)}, 
          phase = ${updates.phase} 
        WHERE id = ${id}
      `;
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

// 4. DELETE: Remove Item
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  try {
    await sql`DELETE FROM scope_items WHERE id = ${id}`;
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}