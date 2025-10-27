import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PATCH → update any field (status, github, etc.)
export async function PATCH(req, { params }) {
  await connectToDatabase();
  const { id } = params;
  const body = await req.json();

  const updated = await Student.findByIdAndUpdate(id, body, { new: true });
  return NextResponse.json(updated, { headers: corsHeaders });
}

// ✅ DELETE → remove a student
export async function DELETE(req, { params }) {
  await connectToDatabase();
  const { id } = params;
  const deleted = await Student.findByIdAndDelete(id);
  return NextResponse.json({ success: true, deleted }, { headers: corsHeaders });
}
