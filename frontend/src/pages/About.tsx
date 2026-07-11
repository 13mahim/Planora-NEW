import { Link } from "react-router-dom";
import { Calendar, Users, Star, Shield, Zap, Heart } from "lucide-react";
import { motion } from "motion/react";

export function About() {
  const team = [
    { name: "Mahim Fahad", role: "Founder & CEO", avatar: "M" },
    { name: "Masud Rahman", role: "Lead Developer", avatar: "M" },
    { name: "Taher Ahmed", role: "UI/UX Designer", avatar: "T" },
  ];

  const values = [
    { icon: Zap, title: "Speed & Reliability", desc: "Lightning-fast performance with 99.9% uptime guarantee for all your events.", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    { icon: Shield, title: "Security First", desc: "Enterprise-grade security with JWT authentication and encrypted payments.", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
    { icon: Heart, title: "Community Driven", desc: "Built for and by event organizers who understand the real challenges.", color: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" },
    { icon: Star, title: "Quality Experience", desc: "Every feature is designed to deliver an exceptional experience for all users.", color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      {/* Hero */}
      <section className="bg-neutral-900 dark:bg-black py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1 bg-orange-600/20 text-orange-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6">About Planora</span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-tight">
              We Make Events<br /><span className="text-orange-500">Unforgettable</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Planora is a full-stack event management platform built to simplify how you create, manage, and join events — from intimate workshops to large-scale conferences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Calendar, value: "21+", label: "Events Created" },
            { icon: Users, value: "3+", label: "Active Users" },
            { icon: Star, value: "5.0", label: "Average Rating" },
            { icon: Shield, value: "100%", label: "Secure Payments" },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-neutral-900 p-8 rounded-4xl border border-neutral-100 dark:border-neutral-800 text-center shadow-sm">
              <s.icon size={28} className="text-orange-600 mx-auto mb-4" />
              <p className="text-3xl font-bold text-neutral-900 dark:text-white">{s.value}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-6">Our Mission</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
              We believe great events have the power to connect people, inspire communities, and create lasting memories. Planora was built with one goal: to remove every barrier between an idea and a world-class event.
            </p>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
              Whether you're organizing a private dinner for 10 or a public tech summit for 10,000, our platform gives you the tools to make it happen — seamlessly, securely, and beautifully.
            </p>
            <Link to="/events" className="inline-flex items-center space-x-2 px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all">
              <span>Explore Events</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {values.map((v) => (
              <div key={v.title} className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${v.color}`}>
                  <v.icon size={22} />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-neutral-900 dark:bg-black py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Meet the Team</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">A small team with big dreams, building the future of event management.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member) => (
              <div key={member.name} className="bg-neutral-800/50 border border-neutral-700 p-8 rounded-4xl text-center">
                <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-white font-bold text-lg">{member.name}</h3>
                <p className="text-neutral-400 text-sm mt-1">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-orange-600 rounded-[3rem] p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-orange-100 mb-8">Join Planora and start creating amazing events today.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/signup" className="px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-neutral-50 transition-all">
              Create Account
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-orange-700 text-white font-bold rounded-2xl hover:bg-orange-800 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
