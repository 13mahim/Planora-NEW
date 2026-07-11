import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import api from "../services/api";
import { toast } from "sonner";

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/contact", form);
      setSubmitted(true);
      toast.success("Message sent successfully!");
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Get In Touch</span>
            <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">Contact Us</h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto text-lg">
              Have a question, suggestion, or need help? We'd love to hear from you.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Info */}
          <div className="space-y-6">
            {[
              { icon: Mail, title: "Email Us", value: "support@planora.app", sub: "We reply within 24 hours" },
              { icon: Phone, title: "Call Us", value: "+880 1234-567890", sub: "Mon–Fri, 9am–6pm" },
              { icon: MapPin, title: "Our Office", value: "Dhaka, Bangladesh", sub: "Visit by appointment" },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 flex items-start space-x-4 shadow-sm">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{item.title}</p>
                  <p className="font-bold text-neutral-900 dark:text-white mt-1">{item.value}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-neutral-900 p-10 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-8 px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all">
                    Send Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Full Name <span className="text-red-500">*</span></label>
                      <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Your full name" className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contact-email" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Email Address <span className="text-red-500">*</span></label>
                      <input id="contact-email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="name@example.com" className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Subject</label>
                    <select id="subject" name="subject" value={form.subject} onChange={handleChange} className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white">
                      <option value="">Select a subject</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Payment Issue">Payment Issue</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="Partnership">Partnership</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-bold text-neutral-700 dark:text-neutral-300 ml-1">Message <span className="text-red-500">*</span></label>
                    <textarea id="message" name="message" rows={5} required value={form.message} onChange={handleChange} placeholder="Tell us how we can help..." className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 resize-none" />
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /><span>Send Message</span></>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
