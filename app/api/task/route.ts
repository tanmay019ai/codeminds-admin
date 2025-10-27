import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Simple schema for a single global task
const taskSchema = new mongoose.Schema({
  currentTask: { type: String, required: true },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET current task
export async function GET() {
  await connectToDatabase();
  const task = await Task.findOne();
  return NextResponse.json(
    task || { currentTask: "No task set" },
    { headers: corsHeaders }
  );
}

// ✅ PATCH to update the current task
export async function PATCH(req: Request) {
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

  return NextResponse.json({ success: true, task: updated }, { headers: corsHeaders });
}
