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
  status: "pending" | "underReview" | "reviewed" | "notReviewed";
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

  // 🧩 Current Task State
  const [currentTask, setCurrentTask] = useState("");
  const [editingTask, setEditingTask] = useState("");

  const BASE_URL = "https://codeminds-admin.vercel.app/api/students";
const TASK_URL = "https://codeminds-admin.vercel.app/api/task";

  // ✅ Fetch all students
  async function fetchStudents() {
    try {
      const res = await axios.get(BASE_URL);
      if (Array.isArray(res.data)) {
        setStudents(res.data);
      } else {
        console.error("Invalid data:", res.data);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  }

  // ✅ Fetch Current Task
  async function fetchCurrentTask() {
  try {
    const res = await axios.get(TASK_URL);
    const latestTask = res.data.currentTask || "No current task set";
    setCurrentTask(latestTask);

    // 🧠 Only update the editing field if the admin is NOT currently typing something new
    setEditingTask((prev) => (prev.trim() === "" || prev === currentTask ? latestTask : prev));
  } catch (err) {
    console.error("Error fetching current task:", err);
  }
}


  // ✅ Update Current Task
  async function updateCurrentTask() {
    if (!editingTask.trim()) return alert("Please enter a valid task.");
    try {
      const res = await axios.patch(TASK_URL, { currentTask: editingTask });
      if (res.data.success) {
        setCurrentTask(editingTask);
        alert("✅ Current task updated successfully!");
      }
    } catch (err) {
      console.error("Error updating current task:", err);
    }
  }

  // ✅ Initialize fetchers
  useEffect(() => {
    fetchStudents();
    fetchCurrentTask();
    const interval = setInterval(() => {
      fetchStudents();
      fetchCurrentTask();
    }, 10000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  // ✅ Add new student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.task || !newStudent.deadline)
      return alert("Please fill all required fields.");

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

  // ✅ Update student (status or GitHub)
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
      } else {
        console.error("Failed to update:", res.data.message);
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
        <h1 className="text-3xl font-bold text-black-600">
          CodeMinds Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* 🧩 Current Task Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white shadow-md rounded-2xl p-6 mb-8 border"
      >
        <h2 className="text-xl font-semibold mb-3">🧩 Set Current Task (Visible to All Students)</h2>
<div className="flex flex-col md:flex-row items-center gap-3">
  <input
    type="text"
    value={editingTask}
    onChange={(e) => setEditingTask(e.target.value)}
    placeholder="Enter or update current task..."
    className="flex-1 border rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
  />
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={updateCurrentTask}
    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition"
  >
    Save Task
  </motion.button>
</div>
<p className="text-gray-600 mt-3">
  <span className="font-semibold">Current Task:</span>{" "}
  <span className="text-blue-600 font-medium">{currentTask}</span>
</p>

      </motion.div>

      {/* ➕ Add Student */}
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
            {students.map((student) => {
              const canChangeStatus =
                student.status === "underReview" ||
                student.status === "notReviewed";

              return (
                <tr
                  key={student._id}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-4 font-medium">{student.name}</td>
                  <td className="p-4">{student.task}</td>
                  <td className="p-4">{student.deadline}</td>

                  {/* GitHub field locked for admin */}
                  <td className="p-4">
                    <input
                      type="text"
                      value={student.github || ""}
                      readOnly
                      className="border rounded-lg p-1 text-sm w-40 bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </td>

                  {/* Status Control */}
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
                      disabled={!canChangeStatus}
                      className={`border rounded-lg p-2 text-sm ${
                        canChangeStatus
                          ? "focus:ring-2 focus:ring-green-500 bg-white"
                          : "bg-gray-100 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {student.status === "pending" && (
                        <option value="pending">Pending</option>
                      )}
                      {student.status === "underReview" && (
                        <>
                          <option value="underReview">Under Review</option>
                          <option value="reviewed">Reviewed</option>
                        </>
                      )}
                      {student.status === "reviewed" && (
                        <option value="reviewed">Reviewed ✅</option>
                      )}
                    </select>
                  </td>

                  {/* Delete button */}
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
