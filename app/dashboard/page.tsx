"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

type Student = {
  _id: string;
  name: string;
  task: string;
  deadline: string;
  github?: string;
  status: "pending" | "underReview" | "reviewed";
};

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState({
    name: "",
    task: "",
    deadline: "",
    github: "",
  });

  const BASE_URL = "http://localhost:3001/api/students";

  // ✅ Fetch students from backend
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await axios.get(BASE_URL);
        setStudents(res.data);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    }
    fetchStudents();
  }, []);

  // ✅ Add new student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.task || !newStudent.deadline)
      return alert("Please fill all fields.");

    try {
      const res = await axios.post(BASE_URL, newStudent);
      if (res.data.success) {
        setStudents((prev) => [...prev, res.data.student]);
        setNewStudent({ name: "", task: "", deadline: "", github: "" });
      }
    } catch (err) {
      console.error("Error adding student:", err);
    }
  };

  // ✅ Update status or GitHub ID
  const updateStudent = async (
    id: string,
    field: "status" | "github",
    value: string
  ) => {
    try {
      const res = await axios.put(BASE_URL, { id, [field]: value });
      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === id ? res.data.student : s))
        );
      }
    } catch (err) {
      console.error("Error updating student:", err);
    }
  };

  // ✅ Delete student
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await axios.delete(BASE_URL, { data: { id } });
      if (res.data.success) {
        setStudents((prev) => prev.filter((s) => s._id !== id));
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 font-[Poppins] p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          CodeMinds Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Add Student Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-md rounded-2xl p-6 mb-8 border"
      >
        <h2 className="text-xl font-semibold mb-4">➕ Add New Student</h2>
        <form onSubmit={handleAddStudent} className="grid gap-4 md:grid-cols-4">
          <input
            type="text"
            placeholder="Name"
            value={newStudent.name}
            onChange={(e) =>
              setNewStudent({ ...newStudent, name: e.target.value })
            }
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Task"
            value={newStudent.task}
            onChange={(e) =>
              setNewStudent({ ...newStudent, task: e.target.value })
            }
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Deadline (e.g. 28 Oct 2025)"
            value={newStudent.deadline}
            onChange={(e) =>
              setNewStudent({ ...newStudent, deadline: e.target.value })
            }
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="GitHub ID (optional)"
            value={newStudent.github}
            onChange={(e) =>
              setNewStudent({ ...newStudent, github: e.target.value })
            }
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="col-span-full md:col-span-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-lg font-semibold shadow-md"
          >
            Add Student
          </motion.button>
        </form>
      </motion.div>

      {/* Student Table */}
      <div className="overflow-x-auto bg-white shadow-md rounded-2xl border">
        <table className="w-full text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Task</th>
              <th className="p-4">Deadline</th>
              <th className="p-4">GitHub</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student._id}
                className="border-b hover:bg-gray-50 transition-all"
              >
                <td className="p-4 font-medium">{student.name}</td>
                <td className="p-4">{student.task}</td>
                <td className="p-4">{student.deadline}</td>
                <td className="p-4">
                  <input
                    type="text"
                    defaultValue={student.github}
                    placeholder="GitHub ID"
                    className="border rounded-lg p-1 text-sm w-40"
                    onBlur={(e) =>
                      updateStudent(student._id, "github", e.target.value)
                    }
                  />
                </td>
                <td
                  className={`p-4 font-semibold ${
                    student.status === "underReview"
                      ? "text-yellow-500"
                      : student.status === "reviewed"
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  <select
                    value={student.status}
                    onChange={(e) =>
                      updateStudent(
                        student._id,
                        "status",
                        e.target.value as Student["status"]
                      )
                    }
                    className="border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="underReview">Under Review</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(student._id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
