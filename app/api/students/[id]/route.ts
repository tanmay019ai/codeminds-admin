import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Handle preflight (CORS)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ✅ PATCH → update student by ID (GitHub + Status control)
export async function PATCH(req: Request, context: any) {
  const { id } = await context.params;
  console.log("🟠 PATCH /api/students/[id] called, id =", id);

  await connectToDatabase();

  try {
    const body = await req.json();
    console.log("📦 Request body:", body);

    const existing = await Student.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // 🔒 1. Prevent overwriting GitHub once set
    if (body.github && existing.github.trim() !== "") {
      return NextResponse.json(
        { success: false, message: "GitHub ID already locked 🔒" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔒 2. Prevent reverting status backwards
    if (
      existing.status === "underReview" &&
      body.status === "pending"
    ) {
      return NextResponse.json(
        { success: false, message: "Cannot revert to pending" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (existing.status === "reviewed") {
      return NextResponse.json(
        { success: false, message: "Reviewed student is locked 🔒" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 🔒 3. Prevent skipping directly to reviewed from pending
    if (existing.status === "pending" && body.status === "reviewed") {
      return NextResponse.json(
        {
          success: false,
          message: "Student must first go underReview before reviewed",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Allowed transitions:
    // - pending → underReview (student action)
    // - underReview → reviewed (admin action)
    const allowed =
      (existing.status === "pending" && body.status === "underReview") ||
      (existing.status === "underReview" && body.status === "reviewed") ||
      body.github;

    if (!allowed) {
      return NextResponse.json(
        { success: false, message: "Invalid status transition" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ✅ Update document
    if (body.github) existing.github = body.github;
    if (body.status) existing.status = body.status;

    await existing.save();

    console.log("✅ Student updated successfully:", existing._id);
    return NextResponse.json({ success: true, student: existing }, { headers: corsHeaders });
  } catch (error) {
    console.error("💥 PATCH error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE → remove a student by ID
export async function DELETE(req: Request, context: any) {
  const { id } = await context.params;
  console.log("🧨 DELETE /api/students/[id], id =", id);

  await connectToDatabase();

  try {
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    console.log("🗑️ Deleted student:", deleted._id);
    return NextResponse.json({ success: true, deleted }, { headers: corsHeaders });
  } catch (error) {
    console.error("💥 DELETE error:", error);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
