import { useState } from "react";
import { User, Bell, Shield, Save, Camera } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "sonner";

export function SettingsPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(profile?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.put("/auth/me", { displayName: name });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) return toast.error("Fill in all fields");
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters");
    setSaving(true);
    try {
      await api.put("/auth/me/password", { currentPassword, newPassword });
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("flex items-center space-x-2 px-8 py-6 text-sm font-bold uppercase tracking-widest transition-all relative", activeTab === tab.id ? "text-orange-600" : "text-neutral-400 hover:text-neutral-600")}>
              <tab.icon size={18} />
              <span>{tab.name}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="p-10">
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-10">
              <div className="flex items-center space-x-8">
                <div className="relative group">
                  <div className="w-24 h-24 bg-orange-100 rounded-4xl flex items-center justify-center text-orange-600 font-bold text-3xl">
                    {profile?.displayName?.charAt(0) || "U"}
                  </div>
                  <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-4xl">
                    <Camera size={24} />
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">Profile Picture</h3>
                  <p className="text-sm text-neutral-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-neutral-900" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input type="email" value={profile?.email || ""} disabled className="w-full px-6 py-4 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-400 cursor-not-allowed font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Role</label>
                  <input type="text" value={profile?.role || "user"} disabled className="w-full px-6 py-4 bg-neutral-100 border border-neutral-200 rounded-2xl text-neutral-400 cursor-not-allowed font-bold capitalize" />
                </div>
              </div>
              <button onClick={handleProfileSave} disabled={saving} className="flex items-center space-x-2 px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-50">
                <Save size={20} /><span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-2xl space-y-8">
              {[
                { title: "Event Updates", desc: "Get notified when an event you've joined is updated." },
                { title: "New Invitations", desc: "Receive alerts when you're invited to private events." },
                { title: "Review Reminders", desc: "Get a nudge to review events you've attended." },
                { title: "Marketing", desc: "Stay up to date with the latest news and features." },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-neutral-50 rounded-3xl border border-neutral-100">
                  <div>
                    <h4 className="font-bold text-neutral-900">{item.title}</h4>
                    <p className="text-sm text-neutral-500">{item.desc}</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 cursor-pointer">
                    <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-2xl space-y-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">New Password</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                </div>
              </div>
              <button onClick={handlePasswordChange} disabled={saving} className="flex items-center space-x-2 px-8 py-4 bg-neutral-900 text-white font-bold rounded-2xl shadow-xl hover:bg-neutral-800 transition-all disabled:opacity-50">
                <Shield size={20} /><span>{saving ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

