import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Calendar, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
      if (msg.includes("Invalid credentials") || error.response?.status === 401) {
        toast.error("Invalid credentials. Please try again.");
      } else {
        toast.error(msg || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: "user" | "admin") => {
    if (role === "admin") {
      setEmail("fahad13mahim@gmail.com");
      setPassword("123456");
    } else {
      setEmail("masud@gmail.com");
      setPassword("123456");
    }
    toast.info("Demo credentials filled! Click Sign In.");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] shadow-2xl shadow-neutral-200 dark:shadow-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-200">
              <Calendar size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Welcome Back</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">Sign in to manage your events.</p>
          </div>

          {/* Demo Login Buttons */}
          <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
            <p className="text-xs font-bold text-orange-700 dark:text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Zap size={12} /> Quick Demo Login
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemo("user")}
                className="flex-1 py-2 bg-white dark:bg-neutral-800 border border-orange-200 dark:border-orange-700 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all"
              >
                User Demo
              </button>
              <button
                type="button"
                onClick={() => fillDemo("admin")}
                className="flex-1 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl hover:bg-orange-700 transition-all shadow-md shadow-orange-200"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-orange-600 font-bold hover:underline">Create Account</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-neutral-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">Secure JWT Authentication</span>
        </div>
      </motion.div>
    </div>
  );
}
