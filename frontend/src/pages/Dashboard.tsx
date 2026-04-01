import { Routes, Route, Link, NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Calendar, Mail, Star, Settings,
  Plus, LogOut, User, ChevronRight, ShieldAlert, Bell
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

export function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const sidebarLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "My Events", href: "/dashboard/my-events", icon: Calendar },
    { name: "Invitations", href: "/dashboard/invitations", icon: Mail },
    { name: "My Reviews", href: "/dashboard/reviews", icon: Star },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  if (profile?.role === "admin") {
    sidebarLinks.push({ name: "Admin Panel", href: "/dashboard/admin", icon: ShieldAlert });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-6 shadow-sm sticky top-28">
            <div className="flex items-center space-x-4 mb-10 px-2">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-xl">
                {profile?.displayName?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold text-neutral-900 truncate max-w-[120px]">{profile?.displayName || "User"}</p>
                <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">{profile?.role || "Member"}</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                      isActive
                        ? "bg-orange-600 text-white shadow-lg shadow-orange-200"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                    )
                  }
                >
                  <div className="flex items-center space-x-3">
                    <link.icon size={18} />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              ))}
            </nav>

            <div className="mt-10 pt-10 border-t border-neutral-100">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 w-full text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut size={18} />
                <span>Logout</span>
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
  );
}

interface Stat {
  name: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

function DashboardOverview() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stat[]>([
    { name: "Total Events", value: "0", icon: Calendar, color: "bg-blue-50 text-blue-600" },
    { name: "Participants", value: "0", icon: User, color: "bg-orange-50 text-orange-600" },
    { name: "Avg. Rating", value: "0.0", icon: Star, color: "bg-emerald-50 text-emerald-600" },
    { name: "Pending Invites", value: "0", icon: Mail, color: "bg-purple-50 text-purple-600" },
  ]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
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
          { name: "Total Events", value: events.length.toString(), icon: Calendar, color: "bg-blue-50 text-blue-600" },
          { name: "Joined Events", value: joinedRes.length.toString(), icon: User, color: "bg-orange-50 text-orange-600" },
          { name: "Avg. Rating", value: "0.0", icon: Star, color: "bg-emerald-50 text-emerald-600" },
          { name: "Pending Invites", value: invites.length.toString(), icon: Mail, color: "bg-purple-50 text-purple-600" },
        ]);
        setRecentEvents(events.slice(0, 4));
        setJoinedEvents(joinedRes.slice(0, 4));
        setNotifications(notifRes.data.slice(0, 5));

        // Check upcoming events within 24 hours and create notifications
        joinedRes.forEach(async (j: any) => {
          const eventDate = new Date(j.event.date + " " + j.event.time);
          const now = new Date();
          const diff = eventDate.getTime() - now.getTime();
          const hoursLeft = diff / (1000 * 60 * 60);
          if (hoursLeft > 0 && hoursLeft <= 24) {
            toast.info(`Reminder: "${j.event.title}" is happening today!`, { duration: 6000 });
          }
        });
      } catch {
        // silently fail
      }
    };
    if (profile) fetchStats();
  }, [profile]);

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Dashboard Overview</h1>
          <p className="text-neutral-500 mt-1">Welcome back, {profile?.displayName}.</p>
        </div>
        <Link
          to="/dashboard/my-events"
          className="flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white font-bold rounded-2xl shadow-lg hover:bg-neutral-800 transition-all"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.name === "Total Events" ? "/dashboard/my-events" : stat.name === "Pending Invites" ? "/dashboard/invitations" : stat.name === "Avg. Rating" ? "/dashboard/reviews" : "/dashboard/my-events"}
            className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all cursor-pointer"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6", stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{stat.name}</p>
            <p className="text-3xl font-bold text-neutral-900">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentEvents.length > 0 ? recentEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900">You created "{event.title}"</p>
                  <p className="text-xs text-neutral-400 font-medium">Recently</p>
                </div>
              </div>
            )) : (
              <p className="text-neutral-400 text-sm">No recent activity found.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">Upcoming Events</h3>
          <div className="space-y-6">
            {recentEvents.length > 0 ? recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl overflow-hidden">
                    <img src={event.imageUrl || `https://picsum.photos/seed/${event.id}/100/100`} alt="Event" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{event.title}</p>
                    <p className="text-xs text-neutral-400 font-medium">{event.date}</p>
                  </div>
                </div>
                <Link to={`/events/${event.id}`} className="p-2 text-neutral-400 hover:text-orange-600 transition-colors">
                  <ChevronRight size={20} />
                </Link>
              </div>
            )) : (
              <p className="text-neutral-400 text-sm">No upcoming events found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Joined Events */}
      {joinedEvents.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-neutral-900">Events I Joined</h3>
            <Bell size={20} className="text-orange-600" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedEvents.map((j) => (
              <Link key={j.participantId} to={`/events/${j.event.id}`} className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-2xl hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 bg-orange-100 rounded-xl overflow-hidden shrink-0">
                  <img src={j.event.imageUrl || `https://picsum.photos/seed/${j.event.id}/100/100`} alt={j.event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-900 truncate">{j.event.title}</p>
                  <p className="text-xs text-neutral-400">{j.event.date} · {j.event.time}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", j.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700")}>
                    {j.status}
                  </span>
                </div>
                <ChevronRight size={16} className="text-neutral-400 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm">
          <h3 className="text-xl font-bold text-neutral-900 mb-6">Notifications</h3>
          <div className="space-y-3">
            {notifications.map((n: any) => (
              <div key={n.id} className={cn("flex items-start space-x-3 p-4 rounded-2xl", n.isRead ? "bg-neutral-50" : "bg-orange-50 border border-orange-100")}>
                <Bell size={16} className={n.isRead ? "text-neutral-400 mt-0.5" : "text-orange-600 mt-0.5"} />
                <div>
                  <p className="text-sm font-bold text-neutral-900">{n.title}</p>
                  <p className="text-xs text-neutral-500">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
