import { useState, useEffect } from "react";
import { ShieldAlert, Users, Calendar, Trash2, Star } from "lucide-react";
import api from "../../services/api";
import { cn } from "../../lib/utils";
import { Event, UserProfile } from "../../types";
import { toast } from "sonner";

export function AdminPanel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"events" | "users">("events");

  const fetchData = async () => {
    try {
      const [eventsRes, usersRes] = await Promise.all([
        api.get("/admin/events"),
        api.get("/admin/users"),
      ]);
      setEvents(eventsRes.data);
      setUsers(usersRes.data);
    } catch { toast.error("Failed to fetch admin data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents(events.filter(e => e.id !== id));
      toast.success("Event deleted");
    } catch { toast.error("Failed to delete event"); }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${uid}`);
      setUsers(users.filter(u => u.uid !== uid));
      toast.success("User deleted");
    } catch { toast.error("Failed to delete user"); }
  };

  const handleSetFeatured = async (id: string) => {
    try {
      await api.patch(`/events/${id}/feature`);
      toast.success("Featured event updated");
      fetchData();
    } catch { toast.error("Failed to set featured event"); }
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Admin Panel</h1>
        <p className="text-neutral-500 mt-1">Monitor all platform activity and manage resources.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Events", value: events.length, color: "bg-blue-50 text-blue-600", icon: Calendar },
          { label: "Total Users", value: users.length, color: "bg-orange-50 text-orange-600", icon: Users },
          { label: "Admins", value: users.filter(u => u.role === "admin").length, color: "bg-purple-50 text-purple-600", icon: ShieldAlert },
          { label: "Featured", value: events.filter((e: any) => e.isFeatured).length, color: "bg-emerald-50 text-emerald-600", icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mb-6">
        <button onClick={() => setTab("events")} className={cn("px-6 py-3 rounded-2xl font-bold text-sm transition-all", tab === "events" ? "bg-orange-600 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-orange-500")}>
          Events ({events.length})
        </button>
        <button onClick={() => setTab("users")} className={cn("px-6 py-3 rounded-2xl font-bold text-sm transition-all", tab === "users" ? "bg-orange-600 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:border-orange-500")}>
          Users ({users.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-neutral-100 rounded-2xl animate-pulse" />)}</div>
      ) : tab === "events" ? (
        <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center space-x-3"><Calendar className="text-orange-600" size={24} /><h2 className="text-xl font-bold text-neutral-900">All Events</h2></div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{events.length} Total</span>
          </div>
          <div className="divide-y divide-neutral-100 max-h-[500px] overflow-y-auto">
            {events.map((event: any) => (
              <div key={event.id} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div>
                  <p className="font-bold text-neutral-900">{event.title}</p>
                  <p className="text-xs text-neutral-400">By {event.organizerName} · {event.date}</p>
                  <div className="flex gap-2 mt-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", event.isPublic ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>{event.isPublic ? "Public" : "Private"}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", event.isFree ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600")}>{event.isFree ? "Free" : "Paid"}</span>
                    {event.isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-yellow-50 text-yellow-600">Featured</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSetFeatured(event.id)} className="p-2 text-neutral-400 hover:text-yellow-500 transition-colors" title="Set as featured"><Star size={18} /></button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-neutral-400 hover:text-red-600 transition-colors" title="Delete"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center space-x-3"><Users className="text-orange-600" size={24} /><h2 className="text-xl font-bold text-neutral-900">All Users</h2></div>
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{users.length} Total</span>
          </div>
          <div className="divide-y divide-neutral-100 max-h-[500px] overflow-y-auto">
            {users.map((user: any) => (
              <div key={user.uid} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold">
                    {user.displayName?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-neutral-900">{user.displayName}</p>
                    <p className="text-xs text-neutral-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest", user.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600")}>{user.role}</span>
                  <button onClick={() => handleDeleteUser(user.uid)} className="p-2 text-neutral-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
