// models/Task.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: () => new Date() },
  updatedAt: { type: Date, default: () => new Date() },
  // date string in YYYY-MM-DD to group tasks per calendar day
  date: { type: String, required: true, index: true },
});

TaskSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Avoid model overwrite error in dev
export default mongoose.models.Task || mongoose.model("Task", TaskSchema);
