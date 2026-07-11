import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, ShieldCheck, Calendar, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export function Signup() {
  const [name, setName] = useState("");
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-neutral-50 dark:bg-neutral-950">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        <div className="bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] shadow-2xl shadow-neutral-200 dark:shadow-neutral-900 border border-neutral-100 dark:border-neutral-800">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-orange-200">
              <Calendar size={32} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Create Account</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">Join Planora and start managing your events.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input id="signup-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-pwd" className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 ml-1">Password <span className="text-neutral-400 font-normal">(min 6 chars)</span></label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input id="signup-pwd" type={showPwd ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && password.length < 6 && (
                <p className="text-xs text-red-500 ml-1">Password is too short</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><span>Create Account</span><ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-center">
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-orange-600 font-bold hover:underline">Sign In</Link>
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
