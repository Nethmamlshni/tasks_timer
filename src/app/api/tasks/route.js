// src/app/api/tasks/route.js
import dbConnect from "@/lib/mongoose";
import Task from "@/models/task";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return new Response(JSON.stringify({ error: "Missing date" }), { status: 400 });
  }

  const tasks = await Task.find({ date }).sort({ createdAt: -1 }).lean();
  return new Response(JSON.stringify({ tasks }), { status: 200, headers: { "Content-Type": "application/json" } });
}

export async function POST(req) {
  await dbConnect();
  const { title, date } = await req.json();

  if (!title || !date) {
    return new Response(JSON.stringify({ error: "Title and date are required" }), { status: 400 });
  }

  const task = await Task.create({ title, date });
  return new Response(JSON.stringify({ task }), { status: 201, headers: { "Content-Type": "application/json" } });
}
