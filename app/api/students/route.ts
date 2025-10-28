import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

// ✅ CORS headers (temporarily allow all)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Later: replace * with your student domain
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Always handle preflight CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET → Fetch all students
export async function GET() {
  try {
    await connectToDatabase();
    const students = await Student.find();
    return NextResponse.json(students, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch students" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ POST → Add new student
export async function POST(req: Request) {
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

    return NextResponse.json(
      { success: true, student: newStudent },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add student" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ PUT → Update github/status (Admin updates)
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const existing = await Student.findById(body.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 🔒 GitHub lock — cannot overwrite once set
    if (body.github && existing.github?.trim()) {
      return NextResponse.json(
        { success: false, message: "GitHub ID already locked 🔒" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (body.github) existing.github = body.github;
    if (body.status) existing.status = body.status;

    await existing.save();

    return NextResponse.json(
      { success: true, student: existing },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("❌ PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update student" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE → Remove student
export async function DELETE(req: Request) {
  try {
    await connectToDatabase();
    const { id } = await req.json();
    const deleted = await Student.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error) {
    console.error("❌ DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete student" },
      { status: 500, headers: corsHeaders }
    );
  }
}
