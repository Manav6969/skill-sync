"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

const Navbar = () => {
  const [isLog, setIsLog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/userAuthentication`,
          { method: "GET" }
        );
        if (res.ok) setIsLog(true);
        else setIsLog(false);
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsLog(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        localStorage.removeItem("access_token");
        setIsLog(false);
        router.push("/login");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#111827] shadow-lg border-b border-purple-600">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-iphone:flex max-iphone:text-sm sm:flex justify-between items-center h-16">
          <div className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-pulse">
            SkillSync
          </div>

          <div className="flex gap-8 text-white font-medium text-lg">
            <Link href="/dashboard" className="hover:text-purple-400 transition-colors duration-200">
              Dashboard
            </Link>
            <Link href="/teams" className="hover:text-purple-400 transition-colors duration-200">
              Teams
            </Link>
            <Link href="/skills" className="hover:text-purple-400 transition-colors duration-200">
              Skills
            </Link>
            <Link href="/chat/all" className="hover:text-purple-400 transition-colors duration-200">
              ChitChat
            </Link>
          </div>

          <div>
            {isLog ? (
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default React.memo(Navbar);
