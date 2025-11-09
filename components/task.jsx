"use client";
import { useEffect, useState, useRef } from "react";
import { Calendar } from "lucide-react"; // 📅 icon for mobile view

function todayDateString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [date, setDate] = useState(todayDateString());
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false); // 👈 mobile icon toggle
  const inputRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, [date]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [editingId, date]);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${encodeURIComponent(date)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function createTask(e) {
    e?.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, date }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
      setTitle("");
    } catch (err) {
      console.error(err);
      alert("Failed to create task");
    }
  }

  function startEdit(task) {
    setTitle(task.title);
    setEditingId(task._id || task.id);
    inputRef.current?.focus();
  }

  async function updateTask(e) {
    e?.preventDefault();
    if (!editingId) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const res = await fetch(`/api/tasks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const { task } = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      setTitle("");
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  }

  async function toggleComplete(id, current) {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
      if (!res.ok) throw new Error("Failed to toggle");
      const { task } = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
    } catch (err) {
      console.error(err);
      alert("Failed to update");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-6 m-10">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-purple-700">
            Tasks 🌸
          </h1>
          <div className="text-sm text-gray-600">{tasks.length} tasks</div>
        </header>

        {/* DATE SELECTOR */}
        <div className="mb-4 flex flex-wrap gap-3 items-center relative">
          <label className="text-sm text-gray-700">Select date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded-md border focus:outline-none bg-white"
          />

          {/* 📱 MOBILE ICON */}
          <div className="ml-auto sm:hidden">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-100"
            >
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>

            {/* Dropdown for mobile */}
            {showOptions && (
              <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md flex flex-col gap-1 p-2 z-20">
                <button
                  onClick={() => {
                    setDate(todayDateString(0));
                    setShowOptions(false);
                  }}
                  className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700 text-left"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    setDate(todayDateString(-1));
                    setShowOptions(false);
                  }}
                  className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700 text-left"
                >
                  Yesterday
                </button>
                <button
                  onClick={() => {
                    setDate(todayDateString(1));
                    setShowOptions(false);
                  }}
                  className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700 text-left"
                >
                  Tomorrow
                </button>
              </div>
            )}
          </div>

          {/* 💻 DESKTOP BUTTONS */}
          <div className="ml-auto hidden sm:flex gap-2">
            <button
              onClick={() => setDate(todayDateString(0))}
              className="text-sm px-3 py-1 rounded-md bg-white shadow-sm"
            >
              Today
            </button>
            <button
              onClick={() => setDate(todayDateString(-1))}
              className="text-sm px-3 py-1 rounded-md bg-white shadow-sm"
            >
              Yesterday
            </button>
            <button
              onClick={() => setDate(todayDateString(1))}
              className="text-sm px-3 py-1 rounded-md bg-white shadow-sm"
            >
              Tomorrow
            </button>
          </div>
        </div>

        {/* ADD TASK FORM */}
        <form
          onSubmit={editingId ? updateTask : createTask}
          className="mb-6"
        >
          <div className="flex gap-3">
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 rounded-xl px-4 py-3 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-shadow shadow-md"
              >
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold shadow-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        {/* TASK LIST */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading…</div>
        ) : tasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-white rounded-xl shadow-sm">
            No tasks for this date ✨
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task._id}
                className={`flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm ${
                  task.completed ? "opacity-80" : ""
                }`}
              >
                <button
                  onClick={() => toggleComplete(task._id, task.completed)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    task.completed
                      ? "bg-green-100 border-green-300"
                      : "border-gray-200"
                  }`}
                >
                  {task.completed ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3
                      className={`text-lg font-medium truncate ${
                        task.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="ml-auto text-xs text-gray-400">
                      {new Date(task.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(task)}
                    className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* FOOTER */}
        <footer className="mt-6 flex items-center gap-3">
          <div className="text-sm text-gray-600">
            {tasks.filter((t) => !t.completed).length} remaining
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm("Clear all tasks for this date?")) {
                  tasks.forEach((t) => deleteTask(t._id));
                }
              }}
              className="text-sm px-3 py-1 rounded-md bg-white shadow-sm text-gray-700"
            >
              Clear all
            </button>
            <button
              onClick={() => {
                if (confirm("Remove completed tasks for this date?")) {
                  tasks
                    .filter((t) => t.completed)
                    .forEach((t) => deleteTask(t._id));
                }
              }}
              className="text-sm px-3 py-1 rounded-md bg-white shadow-sm text-gray-700"
            >
              Clear completed
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
