// lib/models/Student.ts
import mongoose, { Schema, models } from "mongoose";

const StudentSchema = new Schema({
  name: { type: String, required: true },
  task: { type: String, required: true },
  deadline: { type: String, required: true },
  github: { type: String, default: "" },
  status: { type: String, default: "pending" }, // pending → under review → reviewed
});

const Student = models.Student || mongoose.model("Student", StudentSchema);
export default Student;
