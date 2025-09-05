"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) router.push('/dashboard');
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();


      if (res.ok && data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        router.push('/dashboard');
      }
      else {
        const message = data.message;
        if (message === "Invalid Credentials") {
          toast.error('Invalid Credentials', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          // alert("Invalid Credentials");
        }
        else if (message === "Please login with Google") {
          toast.error('Login With Google', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
          });
          // alert("Please login with Google");
        }
      }

    } catch (err) {
      console.error('Login error:', err);
      toast.error('Something went Wrong', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      // alert('Something went wrong. Check console.');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />
      <Navbar></Navbar>
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-purple-900 flex items-center justify-center px-4">
        <div className="bg-gray-800 w-full max-w-md p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white mb-6">Sign in to your account</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />

            <button
              type="submit"
              // disabled={loading}
              className={`text-white font-medium px-6 rounded bg-gradient-to-t from-black via-purple-800 to-purple-600
  hover:from-purple-900 hover:to-purple-700 hover:shadow-lg transition duration-300 ease-in-out w-full py-3 ring-1 ring-purple-700/30 backdrop-blur-sm shadow-[0_0_12px_#a855f7] ${loading && 'opacity-50 cursor-not-allowed'}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-400">
              Don’t have an account?{' '}
              <Link href="/signup" className="text-purple-400 hover:underline">
                Sign up
              </Link>
            </p>

            <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}>
              <button
                type="button"
                disabled={loading}
                className="text-white font-medium px-6 rounded bg-gradient-to-t from-black via-purple-800 to-purple-600
  hover:from-purple-900 hover:to-purple-700 hover:shadow-lg transition duration-300 ease-in-out w-full py-3 ring-1 ring-purple-700/30 backdrop-blur-sm shadow-[0_0_12px_#a855f7]">
                Sign in with Google
              </button>
            </a>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
