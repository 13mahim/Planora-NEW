import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Star, Shield, Zap, Users, CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";
import { eventService } from "../services/eventService";
import { Event } from "../types";
import api from "../services/api";

// ─── EVENT SLIDER COMPONENT ───────────────────────────────────────────────
function EventSlider({ events }: { events: Event[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const itemsPerSlide = 4;
  const totalSlides = Math.ceil(events.length / itemsPerSlide);

  useEffect(() => {
    if (isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % totalSlides);
    }, 3500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPaused, totalSlides]);

  const prev = () => { setCurrent(c => (c - 1 + totalSlides) % totalSlides); };
  const next = () => { setCurrent(c => (c + 1) % totalSlides); };
  const visibleEvents = events.slice(current * itemsPerSlide, current * itemsPerSlide + itemsPerSlide);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {visibleEvents.map((event) => (
            <div key={event.id} className="group bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-neutral-200 dark:hover:shadow-neutral-900 transition-all duration-500">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`}
                  alt={event.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className={cn("px-2 py-1 rounded-full text-xs font-bold shadow-sm", event.isFree ? "bg-emerald-500 text-white" : "bg-orange-500 text-white")}>
                    {event.isFree ? "Free" : formatCurrency(event.registrationFee)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <div className="flex items-center space-x-2 text-neutral-400 text-xs font-medium mb-2">
                  <Calendar size={12} /><span>{event.date}</span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">{event.title}</h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 flex items-center gap-1">
                  <User size={10} />By {event.organizerName}
                </p>
                <Link to={`/events/${event.id}`} className="w-full py-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-sm font-bold rounded-xl flex items-center justify-center space-x-2 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <span>View Details</span><ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      {totalSlides > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn("rounded-full transition-all duration-300", i === current ? "w-8 h-3 bg-orange-600" : "w-3 h-3 bg-neutral-300 dark:bg-neutral-600 hover:bg-orange-300")}
              />
            ))}
          </div>
          <button onClick={next} className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full text-neutral-600 dark:text-neutral-300 hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

export function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState({ totalEvents: 0, totalUsers: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [newsletter, setNewsletter] = useState("");
  const [newsletterSent, setNewsletterSent] = useState(false);
  const [counter, setCounter] = useState({ events: 0, users: 0, reviews: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [upcoming, featured, statsRes] = await Promise.all([
          eventService.getUpcomingEvents(),
          eventService.getFeaturedEvent(),
          api.get("/stats"),
        ]);
        setUpcomingEvents(upcoming);
        setFeaturedEvent(featured);
        setStats(statsRes.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Animated counter
  useEffect(() => {
    if (stats.totalEvents === 0) return;
    const duration = 1500;
    const steps = 40;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setCounter({
        events: Math.round(stats.totalEvents * progress),
        users: Math.round(stats.totalUsers * progress),
        reviews: Math.round(stats.totalReviews * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [stats]);

  const categories = [
    { name: "Technology", icon: <Zap size={20} />, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", filter: "technology" },
    { name: "Business", icon: <Star size={20} />, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", filter: "business" },
    { name: "Wellness", icon: <Shield size={20} />, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", filter: "wellness" },
    { name: "Networking", icon: <Users size={20} />, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", filter: "networking" },
    { name: "Art", icon: <Star size={20} />, color: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400", filter: "art" },
    { name: "Food", icon: <Zap size={20} />, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400", filter: "food" },
    { name: "Lifestyle", icon: <Shield size={20} />, color: "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400", filter: "lifestyle" },
    { name: "General", icon: <Calendar size={20} />, color: "bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300", filter: "general" },
  ];

  const howItWorks = [
    { step: "01", title: "Create Account", desc: "Sign up in seconds with your email. No credit card required to get started.", icon: User },
    { step: "02", title: "Discover Events", desc: "Browse hundreds of public and private events by category, date, or location.", icon: Calendar },
    { step: "03", title: "Join or Host", desc: "Join events with one click or create your own with full customization options.", icon: Users },
    { step: "04", title: "Enjoy & Review", desc: "Attend your event, connect with others, and leave a review to help the community.", icon: Star },
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Event Organizer", comment: "Planora made managing my tech summit incredibly easy. The approval workflow for private events is genius!", rating: 5, avatar: "S" },
    { name: "Ahmed Rahman", role: "Regular Attendee", comment: "I've joined 6 events through Planora. The interface is clean, fast, and the notifications keep me updated.", rating: 5, avatar: "A" },
    { name: "Priya Sharma", role: "Workshop Host", comment: "The payment integration works flawlessly. My paid workshops have never been easier to manage.", rating: 5, avatar: "P" },
  ];

  const faqs = [
    { q: "Is Planora free to use?", a: "Creating an account and joining free events is completely free. We only charge a small platform fee for paid events processed through our payment system." },
    { q: "How do private events work?", a: "Private events require organizer approval. When you request to join, the organizer reviews your request and can approve, reject, or ban participants." },
    { q: "What payment methods are supported?", a: "We support Stripe for international payments (Visa, Mastercard, etc.) and SSLCommerz for local Bangladesh payments (bKash, Nagad, etc.)." },
    { q: "Can I cancel my event registration?", a: "You can contact the event organizer directly through the platform. Refund policies are set by individual organizers." },
    { q: "How do I become an organizer?", a: "Any registered user can create events immediately. Simply go to your Dashboard and click 'Create New Event'." },
  ];

  return (
    <div className="space-y-0 pb-0">
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-center overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        <div className="absolute inset-0 z-0">
          <img
            src={featuredEvent?.imageUrl || `https://picsum.photos/seed/planora-hero/1920/1080?blur=2`}
            alt="Hero"
            className="w-full h-full object-cover opacity-10 dark:opacity-5"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-b from-neutral-50/0 via-neutral-50/60 to-neutral-50 dark:from-neutral-950/0 dark:via-neutral-950/60 dark:to-neutral-950" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {featuredEvent ? (
                <>
                  <span className="inline-block px-4 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest rounded-full mb-6">✦ Featured Event</span>
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-neutral-900 dark:text-white leading-[0.9] mb-8">{featuredEvent.title}</h1>
                  <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-4 leading-relaxed max-w-xl">{featuredEvent.description}</p>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-10 flex-wrap">
                    <span className="flex items-center gap-1"><Calendar size={16} className="text-orange-600" />{featuredEvent.date}</span>
                    <span className="flex items-center gap-1"><User size={16} className="text-orange-600" />{featuredEvent.organizerName}</span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", featuredEvent.isFree ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400")}>
                      {featuredEvent.isFree ? "Free" : formatCurrency(featuredEvent.registrationFee)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to={`/events/${featuredEvent.id}`} className="px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 text-center">
                      {featuredEvent.isFree ? "Join Event Now" : `Pay & Join · ${formatCurrency(featuredEvent.registrationFee)}`}
                    </Link>
                    <Link to="/events" className="px-8 py-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-center">
                      Explore All Events
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-neutral-900 dark:text-white leading-[0.9] mb-8">
                    Discover &<br /><span className="text-orange-600">Join Events</span>
                  </h1>
                  <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed max-w-xl">
                    Find events that match your interests, connect with people, and create unforgettable experiences.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link to="/events" className="px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 text-center">Explore All Events</Link>
                    <Link to="/signup" className="px-8 py-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-bold rounded-2xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all text-center">Get Started Free</Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DYNAMIC STATS ─────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-orange-600 via-orange-500 to-orange-700" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Trusted by Event Lovers</h2>
            <p className="text-orange-100 text-sm">Real numbers from our growing community</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { value: counter.events || stats.totalEvents, label: "Events Created", suffix: "+", icon: "🎪", desc: "and growing every day" },
              { value: counter.users || stats.totalUsers, label: "Active Members", suffix: "+", icon: "👥", desc: "joined our community" },
              { value: counter.reviews || stats.totalReviews, label: "Reviews Posted", suffix: "+", icon: "⭐", desc: "from satisfied attendees" },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{s.icon}</div>
                <p className="text-6xl font-black text-white tracking-tight">{s.value}<span className="text-orange-200">{s.suffix}</span></p>
                <p className="text-white font-bold text-lg mt-2 uppercase tracking-widest">{s.label}</p>
                <p className="text-orange-200 text-sm mt-1">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── UPCOMING EVENTS SLIDER ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Upcoming Events</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">Discover the most anticipated events this season.</p>
          </div>
          <Link to="/events" className="hidden md:flex items-center space-x-2 text-orange-600 font-semibold hover:underline">
            <span>View All</span><ArrowRight size={18} />
          </Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-200 dark:bg-neutral-800" />
                <div className="p-6 space-y-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" /><div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-[3rem] border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-neutral-400">No upcoming events yet.</p>
            <Link to="/dashboard/my-events" className="mt-4 inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all">Create Event</Link>
          </div>
        ) : (
          <EventSlider events={upcomingEvents} />
        )}
      </section>

      {/* ─── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="bg-neutral-900 dark:bg-black py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Browse by Category</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">Find exactly what you're looking for with our curated event categories.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat, idx) => (
              <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                <Link to={`/events?category=${cat.filter}`} className="bg-neutral-800/50 border border-neutral-700 p-5 rounded-2xl flex flex-col items-center hover:border-orange-500 transition-all hover:scale-105 hover:bg-neutral-800">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", cat.color)}>{cat.icon}</div>
                  <span className="text-white font-bold text-xs text-center">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">Get started in minutes. No complicated setup required.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {howItWorks.map((step, idx) => (
            <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
              className="relative text-center">
              {idx < howItWorks.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-orange-200 dark:bg-orange-900/40 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-6 shadow-lg shadow-orange-200">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="bg-orange-50 dark:bg-orange-900/10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">What People Say</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">Join thousands of satisfied organizers and attendees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-neutral-900 p-8 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
                <div className="flex text-orange-500 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 italic">"{t.comment}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-xs text-neutral-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">Everything you need to know about Planora.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div key={idx} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden">
              <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all">
                <span className="font-bold text-neutral-900 dark:text-white">{faq.q}</span>
                {faqOpen === idx ? <ChevronUp size={18} className="text-orange-600 shrink-0" /> : <ChevronDown size={18} className="text-neutral-400 shrink-0" />}
              </button>
              <AnimatePresence>
                {faqOpen === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <div className="px-6 pb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800 pt-4">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="bg-neutral-900 dark:bg-black py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-neutral-400 mb-10">Get notified about the best upcoming events, exclusive deals, and platform updates.</p>
          {newsletterSent ? (
            <div className="flex items-center justify-center space-x-2 text-emerald-400">
              <CheckCircle2 size={24} />
              <span className="font-bold">You're subscribed! Thanks for joining.</span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 transition-all"
              />
              <button
                onClick={() => { if (newsletter) { setNewsletterSent(true); } }}
                className="px-6 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-orange-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-700 rounded-full blur-3xl opacity-50 -ml-48 -mb-48" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-tight mb-8">Ready to create your next big event?</h2>
            <p className="text-orange-100 text-lg mb-12">Join thousands of organizers who trust Planora for seamless, high-impact events.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="px-10 py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:bg-neutral-50 transition-all">Get Started Free</Link>
              <Link to="/events" className="px-10 py-4 bg-orange-700 text-white font-bold rounded-2xl hover:bg-orange-800 transition-all">Explore Events</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
