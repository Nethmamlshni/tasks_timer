// src/app/api/tasks/[id]/route.js
import dbConnect from "@/lib/mongoose";
import Task from "@/models/task";

export async function GET(req, { params }) {
  await dbConnect();
  const { id } = params;

  if (!id) return new Response(JSON.stringify({ error: "ID missing" }), { status: 400 });

  const task = await Task.findById(id).lean();
  if (!task) return new Response(JSON.stringify({ error: "Task not found" }), { status: 404 });

  return new Response(JSON.stringify({ task }), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function PUT(req, { params }) {
  await dbConnect();

  // Next.js 13 App Router passes params as an object
  const id = params?.id;
  if (!id) return new Response(JSON.stringify({ error: "ID missing" }), { status: 400 });

  const body = await req.json();
  if (!body || Object.keys(body).length === 0)
    return new Response(JSON.stringify({ error: "Empty body" }), { status: 400 });

  try {
    const updatedTask = await Task.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedTask) return new Response(JSON.stringify({ error: "Task not found" }), { status: 404 });

    return new Response(JSON.stringify({ task: updatedTask }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  await dbConnect();
  const { id } = params;
  if (!id) return new Response(JSON.stringify({ error: "ID missing" }), { status: 400 });

  const deletedTask = await Task.findByIdAndDelete(id);
  if (!deletedTask) return new Response(JSON.stringify({ error: "Task not found" }), { status: 404 });

  return new Response(JSON.stringify({ message: "Task deleted", task: deletedTask }), { status: 200, headers: { "Content-Type": "application/json" } });
}
