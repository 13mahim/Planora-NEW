import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Calendar, ShieldCheck } from "lucide-react";
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
        toast.error("Account not found. Redirecting to Sign Up...");
        setTimeout(() => navigate(`/signup?email=${encodeURIComponent(email)}`), 1500);
      } else {
        toast.error(msg || "Failed to sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-neutral-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-neutral-200 border border-neutral-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-200">
              <Calendar size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Welcome Back</h2>
            <p className="text-neutral-500 mt-2">Sign in to manage your events and participation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-neutral-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-orange-600 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2"
            >
              <span>Sign In</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-neutral-100 text-center">
            <p className="text-neutral-500 text-sm">
              Don't have an account?{" "}
              <Link to="/signup" className="text-orange-600 font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-2 text-neutral-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">Secure JWT Authentication</span>
        </div>
      </motion.div>
    </div>
  );
}
