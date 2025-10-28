import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // later: set to "https://codeminds-student-panel.vercel.app"
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Schema for single global task
const taskSchema = new mongoose.Schema({
  currentTask: { type: String, required: true },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// ✅ Handle preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET current global task
export async function GET() {
  console.log("📡 GET /api/task called");
  try {
    await connectToDatabase();
    const task = await Task.findOne();
    return NextResponse.json(
      task || { currentTask: "No task set" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ GET /api/task error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch current task" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ PATCH to update the current global task
export async function PATCH(req: Request) {
  console.log("🟠 PATCH /api/task called");
  try {
    await connectToDatabase();
    const { currentTask } = await req.json();

    if (!currentTask?.trim()) {
      return NextResponse.json(
        { success: false, message: "Task cannot be empty" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await Task.findOneAndUpdate(
      {},
      { currentTask },
      { new: true, upsert: true }
    );

    console.log("✅ Task updated:", updated);
    return NextResponse.json(
      { success: true, task: updated },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ PATCH /api/task error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update task" },
      { status: 500, headers: corsHeaders }
    );
  }
}
