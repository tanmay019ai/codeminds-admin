import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

// ✅ Common CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or set your admin panel origin (e.g. http://localhost:3001)
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ GET → Fetch all students
export async function GET() {
  await connectToDatabase();
  const students = await Student.find();
  return NextResponse.json(students, { headers: corsHeaders });
}

// ✅ POST → Add new student
export async function POST(req: Request) {
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
  return NextResponse.json({ success: true, student: newStudent }, { headers: corsHeaders });
}

// ✅ PUT → Update github/status
export async function PUT(req: Request) {
  await connectToDatabase();
  const body = await req.json();

  const student = await Student.findByIdAndUpdate(
    body.id,
    {
      ...(body.github && { github: body.github }),
      ...(body.status && { status: body.status }),
    },
    { new: true }
  );

  if (!student) {
    return NextResponse.json({ success: false, message: "Student not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({ success: true, student }, { headers: corsHeaders });
}

// ✅ DELETE → Remove student
export async function DELETE(req: Request) {
  await connectToDatabase();
  const { id } = await req.json();

  const deleted = await Student.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ success: false, message: "Student not found" }, { status: 404, headers: corsHeaders });
  }

  return NextResponse.json({ success: true }, { headers: corsHeaders });
}
