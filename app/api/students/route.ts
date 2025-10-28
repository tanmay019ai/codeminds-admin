import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

// ✅ Allowed origin (your student panel domain)
const ALLOWED_ORIGIN = "https://codeminds-student-panel.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Helper to ensure every response includes CORS
function withCORS(json: any, status = 200) {
  return NextResponse.json(json, { status, headers: corsHeaders });
}

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return withCORS({});
}

// ✅ GET → Fetch all students
export async function GET() {
  console.log("📡 GET /api/students");
  try {
    await connectToDatabase();
    const students = await Student.find();
    return withCORS(students);
  } catch (error) {
    console.error("❌ GET error:", error);
    return withCORS({ success: false, message: "Failed to fetch students" }, 500);
  }
}

// ✅ POST → Add new student
export async function POST(req: Request) {
  console.log("🟢 POST /api/students");
  try {
    await connectToDatabase();
    const body = await req.json();

    const newStudent = new Student({
      name: body.name,
      task: body.task,
      deadline: body.deadline,
      github: body.github || "",
      status: "pending",
    });

    await newStudent.save();

    return withCORS({ success: true, student: newStudent });
  } catch (error) {
    console.error("❌ POST error:", error);
    return withCORS({ success: false, message: "Failed to add student" }, 500);
  }
}

// ✅ PUT → Admin updates (status or GitHub)
export async function PUT(req: Request) {
  console.log("🟠 PUT /api/students");
  try {
    await connectToDatabase();
    const body = await req.json();

    const existing = await Student.findById(body.id);
    if (!existing) return withCORS({ success: false, message: "Student not found" }, 404);

    // 🔒 Prevent overwriting GitHub
    if (body.github && existing.github?.trim()) {
      return withCORS({ success: false, message: "GitHub ID already locked 🔒" }, 400);
    }

    if (body.github) existing.github = body.github;
    if (body.status) existing.status = body.status;

    await existing.save();

    return withCORS({ success: true, student: existing });
  } catch (error) {
    console.error("❌ PUT error:", error);
    return withCORS({ success: false, message: "Failed to update student" }, 500);
  }
}

// ✅ DELETE → Remove student
export async function DELETE(req: Request) {
  console.log("🧨 DELETE /api/students");
  try {
    await connectToDatabase();
    const { id } = await req.json();
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) return withCORS({ success: false, message: "Student not found" }, 404);
    return withCORS({ success: true });
  } catch (error) {
    console.error("❌ DELETE error:", error);
    return withCORS({ success: false, message: "Failed to delete student" }, 500);
  }
}

// ✅ Ensure Vercel preserves headers
export const config = {
  api: {
    bodyParser: false,
  },
};
