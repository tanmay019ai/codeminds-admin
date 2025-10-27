"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login");
    }, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-900 font-[Poppins]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          CodeMinds Admin Panel
        </h1>

        <p className="text-lg text-gray-600 font-medium">
          Loading admin access<span className="animate-pulse">...</span>
        </p>

        <motion.div
          className="mt-6 w-16 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            repeatType: "mirror",
            duration: 1.2,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </main>
  );
}
