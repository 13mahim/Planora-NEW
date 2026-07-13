import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Mail, Star, Settings,
  Plus, LogOut, User, ChevronRight, ShieldAlert, Bell, Menu, X
} from "lucide-react";
import { cn } from "../lib/utils";
import { MyEvents } from "./dashboard/MyEvents";
import { Invitations } from "./dashboard/Invitations";
import { MyReviews } from "./dashboard/MyReviews";
import { SettingsPage } from "./dashboard/Settings";
import { AdminPanel } from "./dashboard/AdminPanel";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import api from "../services/api";
import { eventService } from "../services/eventService";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    signOut();
    toast.success("Logged out successfully");
    navigate("/");
    setSidebarOpen(false);
  };

  const sidebarLinks = profile?.role === "admin" ? [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Admin Panel", href: "/dashboard/admin", icon: ShieldAlert, end: true },
    { name: "My Events", href: "/dashboard/my-events", icon: Calendar, end: true },
    { name: "Invitations", href: "/dashboard/invitations", icon: Mail, end: true },
    { name: "My Reviews", href: "/dashboard/reviews", icon: Star, end: true },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, end: true },
  ] : [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "My Events", href: "/dashboard/my-events", icon: Calendar, end: true },
    { name: "Invitations", href: "/dashboard/invitations", icon: Mail, end: true },
    { name: "My Reviews", href: "/dashboard/reviews", icon: Star, end: true },
    { name: "Settings", href: "/dashboard/settings", icon: Settings, end: true },
  ];

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <p className="font-bold text-neutral-900 dark:text-white text-lg">Dashboard</p>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={cn("lg:w-64 shrink-0", sidebarOpen ? "block" : "hidden lg:block")}>
            <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 p-6 shadow-sm lg:sticky top-24">
              <div className="flex items-center space-x-4 mb-8 px-2">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl">
                  {profile?.displayName?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white truncate max-w-[120px]">{profile?.displayName || "User"}</p>
                  <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">{profile?.role || "Member"}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <NavLink key={link.name} to={link.href} end={link.end} onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                      isActive ? "bg-orange-600 text-white shadow-lg shadow-orange-200" : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                    )}>
                    <div className="flex items-center space-x-3"><link.icon size={18} /><span>{link.name}</span></div>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </NavLink>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                  <LogOut size={18} /><span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="grow">
            <Routes>
              <Route index element={<DashboardOverview />} />
              <Route path="my-events" element={<MyEvents />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="reviews" element={<MyReviews />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="admin" element={<AdminPanel />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const { profile } = useAuth();
  const COLORS = ["#ea580c", "#3b82f6", "#10b981", "#8b5cf6"];

  const [stats, setStats] = useState([
    { name: "Total Events", value: "0", icon: Calendar, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", href: "/dashboard/my-events" },
    { name: "Joined Events", value: "0", icon: User, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", href: "/dashboard/my-events" },
    { name: "Avg. Rating", value: "0.0", icon: Star, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", href: "/dashboard/reviews" },
    { name: "Pending Invites", value: "0", icon: Mail, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", href: "/dashboard/invitations" },
  ]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    const fetch = async () => {
      try {
        const [eventsRes, invitesRes, joinedRes, notifRes] = await Promise.all([
          api.get("/events/my"),
          api.get("/invitations/my"),
          eventService.getJoinedEvents(),
          api.get("/notifications"),
        ]);
        const events = eventsRes.data;
        const invites = invitesRes.data;

        setStats([
          { name: "Total Events", value: events.length.toString(), icon: Calendar, color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", href: "/dashboard/my-events" },
          { name: "Joined Events", value: joinedRes.length.toString(), icon: User, color: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400", href: "/dashboard/my-events" },
          { name: "Avg. Rating", value: "0.0", icon: Star, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400", href: "/dashboard/reviews" },
          { name: "Pending Invites", value: invites.length.toString(), icon: Mail, color: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", href: "/dashboard/invitations" },
        ]);
        setRecentEvents(events.slice(0, 4));
        setJoinedEvents(joinedRes.slice(0, 4));
        setNotifications(notifRes.data.slice(0, 5));

        // Bar chart data
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        setBarData(months.map((m, i) => ({
          month: m,
          events: events.filter((e: any) => new Date(e.createdAt).getMonth() === i).length,
          joined: joinedRes.filter((j: any) => new Date(j.joinedAt).getMonth() === i).length,
        })));

        // Pie chart data
        const statusCount: Record<string, number> = {};
        events.forEach((e: any) => { statusCount[e.status] = (statusCount[e.status] || 0) + 1; });
        setPieData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));

        // Upcoming reminders
        joinedRes.forEach((j: any) => {
          const diff = new Date(j.event.date + " " + j.event.time).getTime() - Date.now();
          if (diff > 0 && diff <= 86400000) {
            toast.info(`Reminder: "${j.event.title}" is today!`, { duration: 6000 });
          }
        });
      } catch { /* silent */ }
    };
    fetch();
  }, [profile]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Welcome back, {profile?.displayName}.</p>
        </div>
        <Link to="/dashboard/my-events" className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all">
          <Plus size={20} /><span>Create Event</span>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}
            className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", stat.color)}><stat.icon size={20} /></div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{stat.name}</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-white">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Bar + Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Activity Overview</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData.length > 0 ? barData : [{ month: "Jan", events: 0, joined: 0 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "none", borderRadius: "12px", color: "#fff" }} />
              <Legend />
              <Bar dataKey="events" name="My Events" fill="#ea580c" radius={[4, 4, 0, 0]} />
              <Bar dataKey="joined" name="Joined" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Event Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "none", borderRadius: "12px", color: "#fff" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-neutral-400 text-sm">Create events to see status</div>
          )}
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Growth Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={barData.length > 0 ? barData : [{ month: "Jan", events: 0, joined: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "#111827", border: "none", borderRadius: "12px", color: "#fff" }} />
            <Legend />
            <Line type="monotone" dataKey="events" name="My Events" stroke="#ea580c" strokeWidth={2} dot={{ fill: "#ea580c", r: 4 }} />
            <Line type="monotone" dataKey="joined" name="Joined" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {recentEvents.length > 0 ? recentEvents.map((e) => (
              <div key={e.id} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-400"><Calendar size={16} /></div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">Created "{e.title}"</p>
                  <p className="text-xs text-neutral-400">{e.date}</p>
                </div>
              </div>
            )) : <p className="text-neutral-400 text-sm">No recent activity.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Upcoming Events</h3>
          <div className="space-y-4">
            {recentEvents.length > 0 ? recentEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50">
                    <img src={e.imageUrl || `https://picsum.photos/seed/${e.id}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 dark:text-white">{e.title}</p>
                    <p className="text-xs text-neutral-400">{e.date}</p>
                  </div>
                </div>
                <Link to={`/events/${e.id}`} className="p-2 text-neutral-400 hover:text-orange-600 transition-colors"><ChevronRight size={18} /></Link>
              </div>
            )) : <p className="text-neutral-400 text-sm">No upcoming events.</p>}
          </div>
        </div>
      </div>

      {joinedEvents.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Events I Joined</h3>
            <Bell size={18} className="text-orange-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {joinedEvents.map((j) => (
              <Link key={j.participantId} to={`/events/${j.event.id}`} className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-orange-100">
                  <img src={j.event.imageUrl || `https://picsum.photos/seed/${j.event.id}/100/100`} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{j.event.title}</p>
                  <p className="text-xs text-neutral-400">{j.event.date}</p>
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase", j.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700")}>{j.status}</span>
                </div>
                <ChevronRight size={14} className="text-neutral-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-4xl border border-neutral-100 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-6">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((n: any) => (
              <div key={n.id} className={cn("flex items-start space-x-3 p-4 rounded-2xl", n.isRead ? "bg-neutral-50 dark:bg-neutral-800" : "bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800")}>
                <Bell size={16} className={n.isRead ? "text-neutral-400 mt-0.5" : "text-orange-600 mt-0.5"} />
                <div>
                  <p className="text-sm font-bold text-neutral-900 dark:text-white">{n.title}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
