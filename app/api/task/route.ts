import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

// ✅ Update to your actual student panel domain
const ALLOWED_ORIGIN = "https://codeminds-student-panel.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Helper to add CORS headers safely
function withCORS(json: any, status = 200) {
  return NextResponse.json(json, { status, headers: corsHeaders });
}

// ✅ Define schema (singleton global task)
const taskSchema = new mongoose.Schema({
  currentTask: { type: String, required: true },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// ✅ Handle OPTIONS preflight
export async function OPTIONS() {
  return withCORS({});
}

// ✅ GET → Fetch current task
export async function GET() {
  console.log("📡 GET /api/task called");
  try {
    await connectToDatabase();
    const task = await Task.findOne();
    return withCORS(task || { currentTask: "No task set" });
  } catch (error) {
    console.error("❌ GET /api/task error:", error);
    return withCORS(
      { success: false, message: "Failed to fetch current task" },
      500
    );
  }
}

// ✅ PATCH → Update current global task
export async function PATCH(req: Request) {
  console.log("🟠 PATCH /api/task called");

  try {
    await connectToDatabase();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return withCORS({ success: false, message: "DB connection error" }, 500);
  }

  try {
    const { currentTask } = await req.json();

    if (!currentTask?.trim()) {
      return withCORS(
        { success: false, message: "Task cannot be empty" },
        400
      );
    }

    const updated = await Task.findOneAndUpdate(
      {},
      { currentTask },
      { new: true, upsert: true }
    );

    console.log("✅ Task updated:", updated);
    return withCORS({ success: true, task: updated });
  } catch (error) {
    console.error("❌ PATCH /api/task error:", error);
    return withCORS(
      { success: false, message: "Failed to update task" },
      500
    );
  }
}

// ✅ Required so Next.js doesn't strip headers on serverless deploys
export const config = {
  api: {
    bodyParser: false,
  },
};
