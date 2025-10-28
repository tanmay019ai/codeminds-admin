import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

// 🧭 DEBUG HEADER
console.log("🚦 [INIT] /api/students/route.ts LOADED ✅ (root students route)");

const ALLOWED_ORIGIN = "https://codeminds-student-panel.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Helper for consistent CORS responses
function withCORS(json: any, status = 200) {
  return NextResponse.json(json, { status, headers: corsHeaders });
}

// Handle OPTIONS (CORS preflight)
export async function OPTIONS() {
  console.log("🟣 OPTIONS → /api/students (root)");
  return withCORS({});
}

// ✅ GET → Fetch all students
export async function GET() {
  console.log("📡 GET → /api/students (root) called");
  try {
    await connectToDatabase();
    const students = await Student.find();
    console.log(`✅ Found ${students.length} students`);
    return withCORS(students);
  } catch (error) {
    console.error("❌ GET error (root):", error);
    return withCORS({ success: false, message: "Failed to fetch students" }, 500);
  }
}

// ✅ POST → Add new student
export async function POST(req: Request) {
  console.log("🟢 POST → /api/students (root) called");
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log("📦 POST body:", body);

    const newStudent = new Student({
      name: body.name,
      task: body.task,
      deadline: body.deadline,
      github: body.github || "",
      status: "pending",
    });

    await newStudent.save();

    console.log("✅ Student created:", newStudent._id);
    return withCORS({ success: true, student: newStudent });
  } catch (error) {
    console.error("❌ POST error (root):", error);
    return withCORS({ success: false, message: "Failed to add student" }, 500);
  }
}

// ✅ PUT → Admin updates (status or GitHub)
export async function PUT(req: Request) {
  console.log("🟠 PUT → /api/students (root) called (⚠️ should not handle PATCH with ID)");
  try {
    await connectToDatabase();
    const body = await req.json();
    console.log("📦 PUT body:", body);

    const existing = await Student.findById(body.id);
    if (!existing) return withCORS({ success: false, message: "Student not found" }, 404);

    // Prevent overwriting GitHub
    if (body.github && existing.github?.trim()) {
      return withCORS({ success: false, message: "GitHub ID already locked 🔒" }, 400);
    }

    if (body.github) existing.github = body.github;
    if (body.status) existing.status = body.status;

    await existing.save();

    console.log("✅ Student updated (PUT root):", existing._id);
    return withCORS({ success: true, student: existing });
  } catch (error) {
    console.error("❌ PUT error (root):", error);
    return withCORS({ success: false, message: "Failed to update student" }, 500);
  }
}

// ✅ DELETE → Remove student
export async function DELETE(req: Request) {
  console.log("🧨 DELETE → /api/students (root) called");
  try {
    await connectToDatabase();
    const { id } = await req.json();
    console.log("🆔 DELETE ID:", id);

    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      console.warn("⚠️ Student not found (root DELETE):", id);
      return withCORS({ success: false, message: "Student not found" }, 404);
    }

    console.log("🗑️ Deleted student (root):", deleted._id);
    return withCORS({ success: true });
  } catch (error) {
    console.error("❌ DELETE error (root):", error);
    return withCORS({ success: false, message: "Failed to delete student" }, 500);
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
