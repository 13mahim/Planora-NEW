import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, Calendar as CalendarIcon, MapPin, DollarSign, Globe, Lock, Users, CheckCircle, XCircle, Ban } from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";
import { useAuth } from "../../context/AuthContext";
import { eventService } from "../../services/eventService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Event, Participant } from "../../types";

// ─── EventForm outside MyEvents to prevent re-mount on every keystroke ───────
interface FormData {
  title: string; description: string; date: string; time: string;
  venue: string; isPublic: boolean; isFree: boolean; registrationFee: number; category: string;
}

interface EventFormProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  submitting: boolean;
}

function EventForm({ formData, setFormData, onSubmit, submitLabel, submitting }: EventFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Event Title</label>
          <input
            type="text" required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g. Annual Tech Summit"
            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="date" required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Time</label>
          <input
            type="time" required
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Venue / Link</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input
              type="text" required
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
              placeholder="Physical address or online link"
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Description</label>
          <textarea
            rows={4} required
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Tell people what your event is about..."
            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
          />
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Visibility</label>
          <div className="flex space-x-4">
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isPublic: true }))} className={cn("grow py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all", formData.isPublic ? "bg-orange-50 border-orange-500 text-orange-600 font-bold" : "bg-white border-neutral-200 text-neutral-400")}><Globe size={18} /><span>Public</span></button>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isPublic: false }))} className={cn("grow py-3 rounded-xl border flex items-center justify-center space-x-2 transition-all", !formData.isPublic ? "bg-orange-50 border-orange-500 text-orange-600 font-bold" : "bg-white border-neutral-200 text-neutral-400")}><Lock size={18} /><span>Private</span></button>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Entry Fee</label>
          <div className="flex space-x-4">
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isFree: true, registrationFee: 0 }))} className={cn("grow py-3 rounded-xl border flex items-center justify-center transition-all", formData.isFree ? "bg-emerald-50 border-emerald-500 text-emerald-600 font-bold" : "bg-white border-neutral-200 text-neutral-400")}>Free</button>
            <button type="button" onClick={() => setFormData(prev => ({ ...prev, isFree: false }))} className={cn("grow py-3 rounded-xl border flex items-center justify-center transition-all", !formData.isFree ? "bg-orange-50 border-orange-500 text-orange-600 font-bold" : "bg-white border-neutral-200 text-neutral-400")}>Paid</button>
          </div>
        </div>
        {!formData.isFree && (
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">Registration Fee (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input
                type="number" required min="1" step="0.01"
                value={formData.registrationFee}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: parseFloat(e.target.value) }))}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold"
              />
            </div>
          </div>
        )}
      </div>
      <button type="submit" disabled={submitting} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-50">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const defaultForm: FormData = {
  title: "", description: "", date: "", time: "",
  venue: "", isPublic: true, isFree: true, registrationFee: 0, category: "General",
};

export function MyEvents() {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultForm);

  const fetchEvents = async () => {
    try {
      const data = await eventService.getMyEvents();
      setEvents(data);
    } catch { toast.error("Failed to load events"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmitting(true);
    try {
      await eventService.createEvent({ ...formData, organizerId: profile.uid, organizerName: profile.displayName });
      toast.success("Event created!");
      setShowCreateModal(false);
      setFormData(defaultForm);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create event");
    } finally { setSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    setSubmitting(true);
    try {
      await eventService.updateEvent(selectedEvent.id, formData);
      toast.success("Event updated!");
      setShowEditModal(false);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    try {
      await eventService.deleteEvent(id);
      toast.success("Event deleted");
      fetchEvents();
    } catch { toast.error("Failed to delete event"); }
  };

  const openEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({ title: event.title, description: event.description, date: event.date, time: event.time, venue: event.venue, isPublic: event.isPublic, isFree: event.isFree, registrationFee: event.registrationFee, category: event.category });
    setShowEditModal(true);
  };

  const openParticipants = async (event: Event) => {
    setSelectedEvent(event);
    try {
      const data = await eventService.getParticipants(event.id);
      setParticipants(data);
      setShowParticipantsModal(true);
    } catch { toast.error("Failed to load participants"); }
  };

  const handleParticipantAction = async (participantId: string, status: "approved" | "rejected" | "banned") => {
    try {
      await eventService.updateParticipantStatus(participantId, status);
      toast.success(`Participant ${status}`);
      if (selectedEvent) {
        const data = await eventService.getParticipants(selectedEvent.id);
        setParticipants(data);
      }
    } catch { toast.error("Failed to update participant"); }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Events</h1>
          <p className="text-neutral-500 mt-1">Manage the events you've created and organized.</p>
        </div>
        <button onClick={() => { setFormData(defaultForm); setShowCreateModal(true); }} className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all">
          <Plus size={20} /><span>Create New Event</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-neutral-100 rounded-[2.5rem] animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-neutral-300">
          <CalendarIcon size={48} className="text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No events yet</h3>
          <p className="text-neutral-500">Create your first event to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><CalendarIcon size={24} /></div>
                <div className="flex space-x-2">
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", event.isPublic ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>{event.isPublic ? "Public" : "Private"}</span>
                  <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", event.isFree ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600")}>{event.isFree ? "Free" : formatCurrency(event.registrationFee)}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{event.title}</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-neutral-500 text-sm"><CalendarIcon size={14} className="text-orange-600" /><span>{event.date} · {event.time}</span></div>
                <div className="flex items-center space-x-2 text-neutral-500 text-sm"><MapPin size={14} className="text-orange-600" /><span>{event.venue}</span></div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openParticipants(event)} className="flex items-center space-x-1 px-4 py-2 bg-neutral-50 text-neutral-600 font-bold rounded-xl hover:bg-neutral-100 transition-all text-sm"><Users size={16} /><span>Participants</span></button>
                <button onClick={() => openEdit(event)} className="flex items-center space-x-1 px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all text-sm"><Edit2 size={16} /><span>Edit</span></button>
                <button onClick={() => handleDelete(event.id)} className="p-2 bg-neutral-50 text-neutral-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-neutral-900">Create New Event</h2><p className="text-sm text-neutral-500">Fill in the details to launch your event.</p></div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X size={24} /></button>
              </div>
              <EventForm formData={formData} setFormData={setFormData} onSubmit={handleCreate} submitLabel="Launch Event" submitting={submitting} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-neutral-900">Edit Event</h2><p className="text-sm text-neutral-500">Update your event details.</p></div>
                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X size={24} /></button>
              </div>
              <EventForm formData={formData} setFormData={setFormData} onSubmit={handleUpdate} submitLabel="Save Changes" submitting={submitting} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Participants Modal */}
      <AnimatePresence>
        {showParticipantsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowParticipantsModal(false)} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-neutral-100 flex justify-between items-center">
                <div><h2 className="text-2xl font-bold text-neutral-900">Participants</h2><p className="text-sm text-neutral-500">{selectedEvent?.title}</p></div>
                <button onClick={() => setShowParticipantsModal(false)} className="p-2 hover:bg-neutral-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
                {participants.length === 0 ? (
                  <p className="text-neutral-400 text-center py-8">No participants yet.</p>
                ) : participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-neutral-900">{p.userName}</p>
                      <p className="text-xs text-neutral-400">{p.userEmail}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", p.status === "approved" ? "bg-emerald-100 text-emerald-700" : p.status === "banned" ? "bg-red-100 text-red-700" : p.status === "rejected" ? "bg-neutral-100 text-neutral-500" : "bg-yellow-100 text-yellow-700")}>{p.status}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", p.paymentStatus === "paid" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-500")}>{p.paymentStatus}</span>
                      </div>
                    </div>
                    {p.status === "pending" && (
                      <div className="flex gap-2">
                        <button onClick={() => handleParticipantAction(p.id, "approved")} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100" title="Approve"><CheckCircle size={18} /></button>
                        <button onClick={() => handleParticipantAction(p.id, "rejected")} className="p-2 bg-neutral-50 text-neutral-400 rounded-xl hover:bg-red-50 hover:text-red-500" title="Reject"><XCircle size={18} /></button>
                      </div>
                    )}
                    {p.status === "approved" && (
                      <button onClick={() => handleParticipantAction(p.id, "banned")} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100" title="Ban"><Ban size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
