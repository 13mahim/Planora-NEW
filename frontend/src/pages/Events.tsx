import { useState, useEffect } from "react";
import { Search, Calendar, User, ArrowRight, Star } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { Event } from "../types";

export function Events() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: "all", name: "All Events" },
    { id: "public-free", name: "Public Free" },
    { id: "public-paid", name: "Public Paid" },
    { id: "private-free", name: "Private Free" },
    { id: "private-paid", name: "Private Paid" },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await eventService.getPublicEvents(search || undefined, filter !== "all" ? filter : undefined);
        setEvents(data);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [search, filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">Discover Events</h1>
        <p className="text-neutral-500">Explore and join the best events happening around you.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="relative grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or organizer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex overflow-x-auto pb-2 lg:pb-0 space-x-2 no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                "px-6 py-4 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all border",
                filter === f.id
                  ? "bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-orange-500 hover:text-orange-600"
              )}
            >
              {f.name}
            </button>
          ))}
        </div>
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
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="group bg-white rounded-3xl border border-neutral-100 overflow-hidden hover:shadow-2xl hover:shadow-neutral-200 transition-all duration-500">
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
                  <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm", event.isPublic ? "bg-blue-500 text-white" : "bg-purple-500 text-white")}>
                    {event.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2 text-neutral-400 text-xs font-medium uppercase tracking-widest">
                    <Calendar size={14} />
                    <span>{event.date}</span>
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
                  <User size={14} />
                  <span>By {event.organizerName}</span>
                </div>
                <Link to={`/events/${event.id}`} className="w-full py-3 bg-neutral-50 text-neutral-900 font-bold rounded-xl flex items-center justify-center space-x-2 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <span>View Details</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-neutral-300">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No events found</h3>
          <p className="text-neutral-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
