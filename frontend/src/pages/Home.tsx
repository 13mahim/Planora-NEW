import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight, Star, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";
import { eventService } from "../services/eventService";
import { Event } from "../types";

export function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [upcoming, featured] = await Promise.all([
          eventService.getUpcomingEvents(),
          eventService.getFeaturedEvent(),
        ]);
        setUpcomingEvents(upcoming);
        setFeaturedEvent(featured);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { name: "Public Free", icon: <Zap size={20} />, color: "bg-blue-50 text-blue-600" },
    { name: "Public Paid", icon: <Star size={20} />, color: "bg-orange-50 text-orange-600" },
    { name: "Private Free", icon: <Shield size={20} />, color: "bg-emerald-50 text-emerald-600" },
    { name: "Private Paid", icon: <Zap size={20} />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={featuredEvent?.imageUrl || `https://picsum.photos/seed/planora-hero/1920/1080?blur=2`}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-linear-to-b from-neutral-50/0 via-neutral-50/50 to-neutral-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {featuredEvent ? (
                <>
                  <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest rounded-full mb-6">Featured Event</span>
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-neutral-900 leading-[0.9] mb-8">
                    {featuredEvent.title}
                  </h1>
                  <p className="text-xl text-neutral-600 mb-4 leading-relaxed max-w-xl">{featuredEvent.description}</p>
                  <div className="flex items-center gap-4 text-sm text-neutral-500 mb-10">
                    <span className="flex items-center gap-1"><Calendar size={16} className="text-orange-600" />{featuredEvent.date}</span>
                    <span className="flex items-center gap-1"><User size={16} className="text-orange-600" />{featuredEvent.organizerName}</span>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", featuredEvent.isFree ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700")}>
                      {featuredEvent.isFree ? "Free" : formatCurrency(featuredEvent.registrationFee)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link to={`/events/${featuredEvent.id}`} className="px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 text-center">
                      {featuredEvent.isFree ? "Join Event Now" : `Pay & Join · ${formatCurrency(featuredEvent.registrationFee)}`}
                    </Link>
                    <Link to="/events" className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-all text-center">
                      Explore All Events
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-neutral-900 leading-[0.9] mb-8">
                    Discover &<br /><span className="text-orange-600">Join Events</span>
                  </h1>
                  <p className="text-xl text-neutral-600 mb-10 leading-relaxed max-w-xl">
                    Find events that match your interests, connect with people, and create unforgettable experiences.
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link to="/events" className="px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-105 text-center">
                      Explore All Events
                    </Link>
                    <Link to="/signup" className="px-8 py-4 bg-white text-neutral-900 font-bold rounded-2xl border border-neutral-200 hover:bg-neutral-50 transition-all text-center">
                      Get Started Free
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Slider */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900">Upcoming Events</h2>
            <p className="text-neutral-500 mt-2">Discover the most anticipated gatherings this season.</p>
          </div>
          <Link to="/events" className="hidden md:flex items-center space-x-2 text-orange-600 font-semibold hover:underline">
            <span>View All</span><ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-neutral-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-neutral-200" />
                <div className="p-8 space-y-3">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-3 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[3rem] border border-dashed border-neutral-200">
            <p className="text-neutral-400">No upcoming events yet. Be the first to create one!</p>
            <Link to="/dashboard/my-events" className="mt-4 inline-block px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all">
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.slice(0, 9).map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-neutral-200 transition-all duration-500"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={event.imageUrl || `https://picsum.photos/seed/${event.id}/800/600`}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm", event.isFree ? "bg-emerald-500 text-white" : "bg-orange-500 text-white")}>
                      {event.isFree ? "Free" : formatCurrency(event.registrationFee)}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2 text-neutral-400 text-xs font-medium uppercase tracking-widest">
                      <Calendar size={14} /><span>{event.date}</span>
                    </div>
                    {event.avgRating && (
                      <div className="flex items-center space-x-1 text-orange-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-[10px] font-bold">{event.avgRating}</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2 group-hover:text-orange-600 transition-colors">{event.title}</h3>
                  <div className="flex items-center space-x-2 text-neutral-500 text-sm mb-6">
                    <User size={14} /><span>By {event.organizerName}</span>
                  </div>
                  <Link to={`/events/${event.id}`} className="w-full py-3 bg-neutral-50 text-neutral-900 font-bold rounded-xl flex items-center justify-center space-x-2 group-hover:bg-orange-600 group-hover:text-white transition-all">
                    <span>View Details</span><ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-neutral-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Browse by Category</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">Find exactly what you're looking for with our curated event categories.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/events?filter=${cat.name.toLowerCase().replace(" ", "-")}`}
                className="bg-neutral-800/50 border border-neutral-700 p-8 rounded-3xl text-left hover:border-orange-500 transition-all hover:scale-105"
              >
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", cat.color)}>
                  {cat.icon}
                </div>
                <h3 className="text-white font-bold text-lg">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-orange-600 rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full blur-3xl opacity-50 -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-700 rounded-full blur-3xl opacity-50 -ml-48 -mb-48" />
          <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-tight mb-8">
              Ready to create your next big event?
            </h2>
            <p className="text-orange-100 text-lg mb-12">
              Join thousands of organizers who trust Planora to deliver seamless, high-impact event experiences.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/signup" className="px-10 py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-xl hover:bg-neutral-50 transition-all">
                Get Started Free
              </Link>
              <Link to="/events" className="px-10 py-4 bg-orange-700 text-white font-bold rounded-2xl hover:bg-orange-800 transition-all">
                Explore Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
