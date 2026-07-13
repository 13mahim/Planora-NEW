import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Calendar, ShieldCheck, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// Google SVG icon
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Facebook SVG icon
const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

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

          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
            <p className="text-center text-xs text-neutral-400 mb-4 font-bold uppercase tracking-widest">Or continue with</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toast.info("Google login coming soon! Use email login for now.")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:border-orange-400 hover:shadow-md transition-all"
              >
                <GoogleIcon /> Google
              </button>
              <button
                type="button"
                onClick={() => toast.info("Facebook login coming soon! Use email login for now.")}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-sm font-bold text-neutral-700 dark:text-neutral-200 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <FacebookIcon /> Facebook
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
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
