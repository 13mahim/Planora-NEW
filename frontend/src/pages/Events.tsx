import { useState, useEffect, useCallback } from "react";
import { Search, Calendar, User, ArrowRight, Star, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { Link, useSearchParams } from "react-router-dom";
import { eventService } from "../services/eventService";
import api from "../services/api";
import { Event } from "../types";

const ITEMS_PER_PAGE = 8;

export function Events() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["all", "Technology", "Business", "Lifestyle", "Art", "Food", "Wellness", "Networking", "General"];
  const typeFilters = [
    { id: "all", name: "All" },
    { id: "public-free", name: "Public Free" },
    { id: "public-paid", name: "Public Paid" },
    { id: "private-free", name: "Private Free" },
    { id: "private-paid", name: "Private Paid" },
  ];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
  ];

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/events", {
        params: {
          search: search || undefined,
          filter: filter !== "all" ? filter : undefined,
          category: category !== "all" ? category : undefined,
          sortBy,
          page,
          limit: ITEMS_PER_PAGE,
        },
      });
      if (res.data.events) {
        setEvents(res.data.events);
        setTotal(res.data.total);
      } else {
        setEvents(res.data);
        setTotal(res.data.length);
      }
    } catch {
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, filter, category, sortBy, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filter, category, sortBy]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2">Discover Events</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Explore and join the best events happening around you.</p>
      </div>

      {/* Search + Filter toggle */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:border-orange-500 text-sm font-semibold text-neutral-700 dark:text-neutral-200 shadow-sm"
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn("flex items-center gap-2 px-4 py-4 rounded-2xl border text-sm font-semibold transition-all shadow-sm", showFilters ? "bg-orange-600 text-white border-orange-600" : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200")}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 mb-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Type</p>
            <div className="flex flex-wrap gap-2">
              {typeFilters.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={cn("px-4 py-2 rounded-xl text-sm font-semibold border transition-all", filter === f.id ? "bg-orange-600 text-white border-orange-600" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-orange-500")}>
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={cn("px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize", category === c ? "bg-orange-600 text-white border-orange-600" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-orange-500")}>
                  {c === "all" ? "All Categories" : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
          {loading ? "Loading..." : `${total} event${total !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden animate-pulse">
              <div className="h-48 bg-neutral-200 dark:bg-neutral-800" />
              <div className="p-5 space-y-3"><div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" /><div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" /></div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event.id} className="group bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-2xl hover:shadow-neutral-200 dark:hover:shadow-neutral-900 transition-all duration-500 flex flex-col">
              <div className="relative h-48 overflow-hidden shrink-0">
                <img src={event.imageUrl || `https://picsum.photos/seed/${event.id}/600/400`} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold shadow-sm", event.isFree ? "bg-emerald-500 text-white" : "bg-orange-500 text-white")}>
                    {event.isFree ? "Free" : formatCurrency(event.registrationFee)}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold shadow-sm", event.isPublic ? "bg-blue-500 text-white" : "bg-purple-500 text-white")}>
                    {event.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1 text-neutral-400 text-xs font-medium"><Calendar size={12} /><span>{event.date}</span></div>
                  {event.avgRating && (
                    <div className="flex items-center space-x-1 text-orange-500"><Star size={12} fill="currentColor" /><span className="text-[10px] font-bold">{event.avgRating}</span></div>
                  )}
                </div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-orange-600 transition-colors line-clamp-2 flex-1">{event.title}</h3>
                <div className="flex items-center space-x-1 text-neutral-500 dark:text-neutral-400 text-xs mb-4"><User size={12} /><span>By {event.organizerName}</span></div>
                <Link to={`/events/${event.id}`} className="w-full py-2.5 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1 group-hover:bg-orange-600 group-hover:text-white transition-all">
                  <span>View Details</span><ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white dark:bg-neutral-900 rounded-[3rem] border border-dashed border-neutral-300 dark:border-neutral-700">
          <Search size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No events found</h3>
          <p className="text-neutral-500 dark:text-neutral-400">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-orange-500 hover:text-orange-600 disabled:opacity-40 transition-all">
            <ChevronLeft size={18} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={cn("w-10 h-10 rounded-xl text-sm font-bold transition-all", p === page ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-orange-500")}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-orange-500 hover:text-orange-600 disabled:opacity-40 transition-all">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
