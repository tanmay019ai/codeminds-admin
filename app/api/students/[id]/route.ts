import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Student from "@/lib/models/Student";

const ALLOWED_ORIGIN = "https://codeminds-student-panel.vercel.app"; // ✅ Replace with your student panel domain

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ Helper: wrap all responses with CORS headers
function withCORS(json: any, status = 200) {
  return NextResponse.json(json, { status, headers: corsHeaders });
}

// ✅ Handle CORS preflight
export async function OPTIONS() {
  return withCORS({});
}

// ✅ PATCH → update student by ID
export async function PATCH(req: Request, context: any) {
  const { id } = context.params;
  console.log("🟠 PATCH /api/students/[id] called, id =", id);

  try {
    await connectToDatabase();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return withCORS({ success: false, message: "DB connection error" }, 500);
  }

  try {
    const body = await req.json();
    console.log("📦 Request body:", body);

    const existing = await Student.findById(id);
    if (!existing) return withCORS({ success: false, message: "Student not found" }, 404);

    // 🔒 GitHub lock
    if (body.github && existing.github?.trim() !== "") {
      return withCORS({ success: false, message: "GitHub ID already locked 🔒" }, 400);
    }

    // 🔒 Prevent revert or invalid transitions
    if (existing.status === "underReview" && body.status === "pending")
      return withCORS({ success: false, message: "Cannot revert to pending" }, 400);

    if (existing.status === "reviewed")
      return withCORS({ success: false, message: "Reviewed student is locked 🔒" }, 400);

    if (existing.status === "pending" && body.status === "reviewed")
      return withCORS({ success: false, message: "Must go underReview before reviewed" }, 400);

    const allowed =
      (existing.status === "pending" && body.status === "underReview") ||
      (existing.status === "underReview" && body.status === "reviewed") ||
      body.github;

    if (!allowed) return withCORS({ success: false, message: "Invalid status transition" }, 400);

    // ✅ Update document
    if (body.github) existing.github = body.github;
    if (body.status) existing.status = body.status;

    await existing.save();

    console.log("✅ Student updated successfully:", existing._id);
    return withCORS({ success: true, student: existing });
  } catch (error) {
    console.error("💥 PATCH error:", error);
    return withCORS({ success: false, message: "Server error" }, 500);
  }
}

// ✅ DELETE → remove student by ID
export async function DELETE(req: Request, context: any) {
  const { id } = context.params;
  console.log("🧨 DELETE /api/students/[id], id =", id);

  try {
    await connectToDatabase();
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    return withCORS({ success: false, message: "DB connection error" }, 500);
  }

  try {
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) return withCORS({ success: false, message: "Student not found" }, 404);

    console.log("🗑️ Deleted student:", deleted._id);
    return withCORS({ success: true, deleted });
  } catch (error) {
    console.error("💥 DELETE error:", error);
    return withCORS({ success: false, message: "Delete failed" }, 500);
  }
}

// ✅ Fallback: ensure all responses have CORS
export const config = {
  api: {
    bodyParser: false,
  },
};
