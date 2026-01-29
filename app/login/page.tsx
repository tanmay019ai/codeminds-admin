"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const ADMIN_EMAIL = "admin@codeminds.com";
  const ADMIN_PASSWORD = "codeminds@123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem("isAdminLoggedIn", "true");
        router.push("/dashboard");
      } else {
        alert("❌ Invalid credentials. Access denied!");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-100 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-200 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">CodeMinds Admin Panel</h1>
        <p className="text-gray-500 mb-6">Sign in with admin credentials</p>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70"
          >
            {loading ? "Verifying..." : "Login"}
          </motion.button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} CodeMinds Admin
        </p>
      </motion.div>
    </main>
  );
}
