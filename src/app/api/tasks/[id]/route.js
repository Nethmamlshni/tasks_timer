
import dbConnect from "../../../../../../lib/mongoose";
import Task from "../../../../../../models/task";


export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const task = await Task.findById(id).lean();
    if (!task) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ task }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("GET /api/tasks/[id] error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch task" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const updates = await req.json();
    updates.updatedAt = new Date();
    const task = await Task.findByIdAndUpdate(id, updates, { new: true });
    if (!task) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ task }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("PUT /api/tasks/[id] error:", err);
    return new Response(JSON.stringify({ error: "Failed to update" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("DELETE /api/tasks/[id] error:", err);
    return new Response(JSON.stringify({ error: "Failed to delete" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
