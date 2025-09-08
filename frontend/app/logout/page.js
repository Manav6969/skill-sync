"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LogoutPage = () => {
  const router = useRouter();
  useEffect(() => {
    const logout = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include", 
          headers: {
            "Content-Type": "application/json"
          },
          cache: "no-store",
        });

        if (response.ok) {
          console.log("Logout successful");
          localStorage.removeItem("access_token");
          router.replace("/login");
        } else {
          console.error("Logout failed");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black via-purple-900 to-purple-800 text-white">
      <h2 className="text-xl font-semibold">Logging out...</h2>
    </div>
  );
}


export default LogoutPage