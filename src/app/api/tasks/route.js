
import dbConnect from "@/lib/mongoose";
import Task from "@/models/task";

export async function GET(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    if (!date) {
      return new Response(JSON.stringify({ error: "Missing 'date' query parameter" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const tasks = await Task.find({ date }).sort({ createdAt: -1 }).lean();
    // return object shaped { tasks } so frontend that expects { tasks } still works
    return new Response(JSON.stringify({ tasks }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch tasks" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, date } = body;
    if (!title || !date) {
      return new Response(JSON.stringify({ error: "Missing title or date" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const task = await Task.create({ title, date });
    return new Response(JSON.stringify({ task }), { status: 201, headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return new Response(JSON.stringify({ error: "Failed to create task" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
