import { useState, useRef } from "react";
import { User, Bell, Shield, Save, Camera, Upload } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { toast } from "sonner";

export function SettingsPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(profile?.displayName || "");
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "security", name: "Security", icon: Shield },
  ];

  // Upload image to imgbb (free image host) or use base64
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }
    setUploading(true);
    try {
      // Convert to base64 data URL for preview and storage
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        setPhotoURL(dataUrl);
        // Save immediately to backend
        await api.put("/auth/me", { displayName: name, photoURL: dataUrl });
        toast.success("Profile picture updated!");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to upload image");
      setUploading(false);
    }
  };

  const handleProfileSave = async () => {
    if (!name.trim()) { toast.error("Name cannot be empty"); return; }
    setSaving(true);
    try {
      await api.put("/auth/me", { displayName: name, photoURL });
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/me/password", { currentPassword, newPassword });
      toast.success("Password updated!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-100 dark:border-neutral-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center space-x-2 px-6 py-5 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap",
                activeTab === tab.id ? "text-orange-600" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200")}>
              <tab.icon size={16} /><span>{tab.name}</span>
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-full" />}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-8">
              {/* Profile Image Upload */}
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 font-bold text-3xl overflow-hidden">
                    {photoURL ? (
                      <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.displayName?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white rounded-2xl cursor-pointer"
                  >
                    {uploading ? <Upload size={20} className="animate-bounce" /> : <Camera size={20} />}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Profile Picture</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">JPG, PNG or GIF. Max 2MB</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="mt-2 text-sm font-bold text-orange-600 hover:underline disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Change Photo"}
                  </button>
                </div>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="settings-name" className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    id="settings-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className="w-full px-5 py-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-400 cursor-not-allowed font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">Role</label>
                  <input
                    type="text"
                    value={profile?.role || "user"}
                    disabled
                    className="w-full px-5 py-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl text-neutral-400 cursor-not-allowed font-bold capitalize"
                  />
                </div>
              </div>

              <button onClick={handleProfileSave} disabled={saving}
                className="flex items-center space-x-2 px-8 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-50">
                {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={20} />}
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="max-w-2xl space-y-4">
              {[
                { title: "Event Updates", desc: "Get notified when an event you've joined is updated." },
                { title: "New Invitations", desc: "Receive alerts when you're invited to private events." },
                { title: "Review Reminders", desc: "Get a nudge to review events you've attended." },
                { title: "Marketing", desc: "Stay up to date with the latest news and features." },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700">
                  <div>
                    <h4 className="font-bold text-neutral-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 cursor-pointer shrink-0">
                    <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-md space-y-6">
              <div className="space-y-2">
                <label htmlFor="cur-pwd" className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">Current Password</label>
                <input id="cur-pwd" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••"
                  className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="new-pwd" className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">New Password</label>
                <input id="new-pwd" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6}
                  className="w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white" />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-pwd" className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                <input id="confirm-pwd" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                  className={cn("w-full px-5 py-4 bg-neutral-50 dark:bg-neutral-800 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-neutral-900 dark:text-white",
                    confirmPassword && newPassword !== confirmPassword ? "border-red-400" : "border-neutral-200 dark:border-neutral-700")} />
                {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500 ml-1">Passwords do not match</p>}
              </div>
              <button onClick={handlePasswordChange} disabled={saving}
                className="flex items-center space-x-2 px-8 py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold rounded-2xl shadow-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all disabled:opacity-50">
                {saving ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Shield size={20} />}
                <span>{saving ? "Updating..." : "Update Password"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
