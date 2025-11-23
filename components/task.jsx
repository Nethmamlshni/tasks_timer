"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

function todayDateString(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayDateString());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState({});
  const [showOptions, setShowOptions] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const inputRef = useRef(null);
  const soundsRef = useRef({ add: null, update: null, delete: null, complete: null });

  useEffect(() => {
    try {
      Object.keys(soundsRef.current).forEach((key) => {
        soundsRef.current[key] = new Audio(`/sounds/${key}.mp3`);
        soundsRef.current[key]?.load();
      });
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [date]);
  useEffect(() => { inputRef.current?.focus(); }, [editingId, date]);

  const playSound = (name) => { if (!soundEnabled) return; soundsRef.current[name]?.play().catch(() => {}); };

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err); setTasks([]);
    } finally { setLoading(false); }
  }

  async function createTask(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed, date }),
      });
      const { task } = await res.json();
      setTasks((prev) => [task, ...prev]);
      setTitle("");
      playSound("add");
    } catch (err) { console.error(err); alert("Failed to create task"); }
  }

  function startEdit(task) { setEditingId(task._id); setTitle(task.title); inputRef.current?.focus(); }

  async function updateTask(e) {
    e.preventDefault();
    if (!editingId || !title.trim()) return;
    const taskToEdit = tasks.find((t) => t._id === editingId);
    if (!taskToEdit) { alert("Task not found in state!"); setEditingId(null); setTitle(""); return; }
    setTaskLoading((prev) => ({ ...prev, [editingId]: true }));
    try {
      const res = await fetch(`/api/tasks/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      const { task } = await res.json();
      if (!task?._id) throw new Error("Invalid task returned from server");
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      setTitle(""); setEditingId(null); playSound("update");
    } catch (err) { console.error(err); alert("Failed to update task: " + err.message); }
    finally { setTaskLoading((prev) => ({ ...prev, [editingId]: false })); }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    setTaskLoading((prev) => ({ ...prev, [id]: true }));
    try { await fetch(`/api/tasks/${id}`, { method: "DELETE" }); setTasks((prev) => prev.filter((t) => t._id !== id)); playSound("delete"); }
    catch (err) { console.error(err); alert("Failed to delete task"); }
    finally { setTaskLoading((prev) => ({ ...prev, [id]: false })); }
  }

  async function toggleComplete(id, current) {
    setTaskLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !current }),
      });
      const { task } = await res.json();
      setTasks((prev) => prev.map((t) => (t._id === task._id ? task : t)));
      playSound("complete");
    } catch (err) { console.error(err); alert("Failed to toggle task"); }
    finally { setTaskLoading((prev) => ({ ...prev, [id]: false })); }
  }

  function cancelEdit() { setEditingId(null); setTitle(""); }
  async function bulkDelete(toDelete) { if (!toDelete.length || !confirm("Delete selected tasks?")) return; await Promise.all(toDelete.map((t) => deleteTask(t._id))); }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* HEADER */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-purple-700">Tasks</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="px-3 py-1 rounded-md bg-white shadow-sm text-sm hover:bg-gray-100 transition">
            {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
          <div className="text-sm text-gray-600">{tasks.length} tasks</div>
        </div>
      </header>

      {/* DATE PICKER */}
      <div className="mb-4 flex flex-wrap items-center gap-3 relative">
        <label className="text-sm text-gray-700">Select date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-md border bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />

        <div className="ml-auto sm:hidden relative">
          <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-md bg-white shadow-sm hover:bg-gray-100 transition">
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
          {showOptions && (
            <div className="absolute right-0 top-12 bg-white shadow-lg rounded-md flex flex-col gap-1 p-2 z-20">
              {["Today", "Yesterday", "Tomorrow"].map((label, idx) => {
                const offset = idx - 1;
                return (
                  <button
                    key={label}
                    onClick={() => { setDate(todayDateString(offset)); setShowOptions(false); }}
                    className="text-sm px-3 py-1 rounded-md hover:bg-gray-100 text-gray-700 text-left"
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="ml-auto hidden sm:flex gap-2">
          {["Today", "Yesterday", "Tomorrow"].map((label, idx) => {
            const offset = idx - 1;
            return (
              <button key={label} onClick={() => setDate(todayDateString(offset))} className="text-sm px-3 py-1 rounded-md bg-white shadow-sm hover:bg-gray-100 transition">
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ADD/UPDATE FORM */}
      <form onSubmit={editingId ? updateTask : createTask} className="mb-6 flex gap-3">
        <input
        id="task-input"
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 rounded-xl px-4 py-3 shadow-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white transition"
        />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-3 rounded-xl bg-purple-500 text-white font-semibold hover:bg-purple-600 transition-shadow shadow-md" disabled={editingId && taskLoading[editingId]}>
            {editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-4 py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition-shadow shadow-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* TASK LIST */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading…</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-500 py-8 bg-white rounded-xl shadow-sm">No tasks for this date ✨</div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) =>
            task?._id ? (
              <li key={task._id} className={`flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition ${task.completed ? "opacity-80" : ""}`}>
                <button
                  onClick={() => toggleComplete(task._id, task.completed)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${task.completed ? "bg-green-100 border-green-300" : "border-gray-200"} transition`}
                  disabled={taskLoading[task._id]}
                >
                  {task.completed ? "✔️" : ""}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-medium truncate ${task.completed ? "line-through text-gray-400" : "text-gray-800"}`}>{task.title}</h3>
                  <div className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(task)} className="px-3 py-1 rounded-lg bg-purple-50 text-purple-700 text-sm hover:bg-purple-100 transition">Edit</button>
                  <button onClick={() => deleteTask(task._id)} className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-sm hover:bg-red-100 transition" disabled={taskLoading[task._id]}>Delete</button>
                </div>
              </li>
            ) : null
          )}
        </ul>
      )}

      {/* FOOTER */}
      <footer className="mt-6 flex items-center gap-3">
        <div className="text-sm text-gray-600">{tasks.filter((t) => !t.completed).length} remaining</div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => bulkDelete(tasks)} className="text-sm px-3 py-1 rounded-md bg-white shadow-sm text-gray-700 hover:bg-gray-100 transition">Clear all</button>
          <button onClick={() => bulkDelete(tasks.filter((t) => t.completed))} className="text-sm px-3 py-1 rounded-md bg-white shadow-sm text-gray-700 hover:bg-gray-100 transition">Clear completed</button>
        </div>
      </footer>
    </div>
  );
}
