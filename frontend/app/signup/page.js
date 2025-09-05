"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { ToastContainer, toast } from 'react-toastify';

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [profilepic, setprofilepic] = useState("")
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) router.push('/dashboard');
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name, profilepic }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('access_token', data.accessToken);
        router.push(data.redirectTo);
      } else {
        router.push(data.redirectTo);
      }
    } catch (err) {
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
      console.error(err);
    }
  }

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
      />
      <Navbar></Navbar>
      <div className="min-h-screen bg-gradient-to-b from-black via-black to-purple-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Create your account
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              name='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              name='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              name='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Profile Image URL"
              className="w-full px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              name='profilepic'
              value={profilepic}
              onChange={(e) => setprofilepic(e.target.value)}
            />
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition"
            >
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-500 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}

export default Signup;
