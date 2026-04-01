import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, User, Clock, Shield, Star, MessageSquare, ArrowLeft, CheckCircle2, AlertCircle, Send, Users, Check, X, Ban } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, formatCurrency } from "../lib/utils";
import { eventService } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Review, Event, Participant } from "../types";

export function EventDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [event, setEvent] = useState<Event | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myParticipation, setMyParticipation] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const fetchData = async () => {
    if (!id) return;
    try {
      const [eventData, reviewsData] = await Promise.all([
        eventService.getEventById(id),
        eventService.getReviews(id),
      ]);
      if (eventData) {
        setEvent(eventData);
        setReviews(reviewsData);
        if (profile) {
          const parts = await eventService.getParticipants(id);
          setParticipants(parts);
          setMyParticipation(parts.find(p => p.userId === profile.uid) || null);
        }
      }
    } catch {
      toast.error("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id, profile]);

  const handleJoin = async () => {
    if (!user || !profile) return navigate("/login");
    if (!event) return;
    setJoining(true);
    try {
      if (!event.isFree) {
        const payment = await eventService.createCheckoutSession(event.id);
        window.location.href = payment.url;
        return;
      }
      const res: any = await eventService.joinEvent(event.id, profile.uid, profile.displayName, profile.email, false);
      toast.success(res.message || "Joined successfully!");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to join event");
    } finally { setJoining(false); }
  };

  const handleParticipantAction = async (participantId: string, status: "approved" | "rejected" | "banned") => {
    try {
      await eventService.updateParticipantStatus(participantId, status);
      toast.success(`Participant ${status}`);
      fetchData();
    } catch { toast.error("Failed to update participant"); }
  };

  const handleDeleteEvent = async () => {
    if (!event || !confirm("Delete this event?")) return;
    try {
      await eventService.deleteEvent(event.id);
      toast.success("Event deleted");
      navigate("/dashboard/my-events");
    } catch { toast.error("Failed to delete event"); }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !id || !event) return toast.error("Please login to submit a review");
    setSubmittingReview(true);
    try {
      await eventService.addReview({ eventId: id, eventTitle: event.title, userId: profile.uid, userName: profile.displayName, rating, comment });
      toast.success("Review submitted!");
      setComment(""); setRating(5); setShowReviewForm(false);
      const updatedReviews = await eventService.getReviews(id);
      setReviews(updatedReviews);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally { setSubmittingReview(false); }
  };

  const isOwner = profile?.uid === event?.organizerId;
  const avgRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  const getJoinButtonText = () => {
    if (!event) return "";
    if (event.isPublic && event.isFree) return "Join Event Now";
    if (event.isPublic && !event.isFree) return `Pay & Join · ${formatCurrency(event.registrationFee)}`;
    if (!event.isPublic && event.isFree) return "Request to Join";
    return `Pay & Request · ${formatCurrency(event.registrationFee)}`;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-4">
      <AlertCircle size={64} className="text-neutral-300 mb-6" />
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Event not found</h2>
      <p className="text-neutral-500 mb-8 text-center max-w-md">The event you're looking for doesn't exist or has been removed.</p>
      <Link to="/events" className="px-8 py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all">Back to Events</Link>
    </div>
  );

  return (
    <div className="bg-neutral-50 min-h-screen pb-24">
      <div className="relative h-[50vh] overflow-hidden">
        <img src={event.imageUrl || `https://picsum.photos/seed/${event.id}/1200/600`} alt={event.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <Link to="/events" className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft size={18} /><span className="text-sm font-semibold uppercase tracking-widest">Back to Events</span>
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white leading-tight max-w-4xl">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-8 rounded-4xl border border-neutral-100 shadow-sm">
              {[
                { label: "Date", icon: Calendar, value: event.date },
                { label: "Time", icon: Clock, value: event.time },
                { label: "Venue", icon: MapPin, value: event.venue },
                { label: "Organizer", icon: User, value: event.organizerName },
              ].map(({ label, icon: Icon, value }) => (
                <div key={label} className="space-y-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{label}</p>
                  <div className="flex items-center space-x-2 text-neutral-900 font-bold">
                    <Icon size={16} className="text-orange-600" />
                    <span className="truncate text-sm">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-8">
              <div className="flex space-x-8 border-b border-neutral-200">
                {["details", "reviews", ...(isOwner ? ["participants"] : [])].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={cn("pb-4 text-sm font-bold uppercase tracking-widest transition-all relative", activeTab === tab ? "text-orange-600" : "text-neutral-400 hover:text-neutral-600")}>
                    {tab}
                    {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-orange-600 rounded-full" />}
                  </button>
                ))}
              </div>

              {activeTab === "details" && (
                <div className="prose prose-neutral max-w-none">
                  <p className="text-neutral-600 leading-relaxed text-lg">{event.description}</p>
                  <h3 className="text-2xl font-bold text-neutral-900 mt-12 mb-6">What to expect</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                    {["Keynote speeches from industry leaders", "Interactive workshops", "Networking opportunities", "Portfolio review sessions", "Access to exclusive resources", "Complimentary refreshments"].map((item, i) => (
                      <li key={i} className="flex items-start space-x-3 bg-white p-4 rounded-2xl border border-neutral-100">
                        <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-neutral-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl font-bold text-neutral-900">{avgRating}</div>
                      <div className="flex flex-col">
                        <div className="flex text-orange-500">{[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />)}</div>
                        <span className="text-neutral-500 text-xs font-bold uppercase tracking-widest">{reviews.length} Reviews</span>
                      </div>
                    </div>
                    {user && !showReviewForm && (
                      <button onClick={() => setShowReviewForm(true)} className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all">Write a Review</button>
                    )}
                  </div>
                  <AnimatePresence>
                    {showReviewForm && (
                      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white p-8 rounded-4xl border border-neutral-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-bold text-neutral-900">Your Experience</h3>
                          <button onClick={() => setShowReviewForm(false)} className="text-neutral-400 hover:text-neutral-600">Cancel</button>
                        </div>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} className="text-orange-500 transition-transform hover:scale-110">
                              <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <textarea rows={4} required value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts about the event..." className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all" />
                          <button type="submit" disabled={submittingReview} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2 disabled:opacity-50">
                            <Send size={18} /><span>{submittingReview ? "Submitting..." : "Submit Review"}</span>
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="space-y-6">
                    {reviews.length > 0 ? reviews.map((review) => (
                      <div key={review.id} className="bg-white p-8 rounded-4xl border border-neutral-100 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 font-bold">{review.userName.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-neutral-900">{review.userName}</p>
                              <p className="text-xs text-neutral-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex text-orange-500">{[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < review.rating ? "currentColor" : "none"} />)}</div>
                        </div>
                        <p className="text-neutral-600 leading-relaxed">{review.comment}</p>
                      </div>
                    )) : (
                      <div className="text-center py-12 bg-white rounded-4xl border border-dashed border-neutral-200">
                        <MessageSquare size={48} className="text-neutral-200 mx-auto mb-4" />
                        <p className="text-neutral-500">No reviews yet. Be the first to share your experience!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "participants" && isOwner && (
                <div className="space-y-4">
                  {participants.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-4xl border border-dashed border-neutral-200">
                      <Users size={48} className="text-neutral-200 mx-auto mb-4" />
                      <p className="text-neutral-500">No participants yet.</p>
                    </div>
                  ) : participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-6 bg-white rounded-2xl border border-neutral-100 shadow-sm">
                      <div>
                        <p className="font-bold text-neutral-900">{p.userName}</p>
                        <p className="text-xs text-neutral-400">{p.userEmail}</p>
                        <div className="flex gap-2 mt-1">
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", p.status === "approved" ? "bg-emerald-100 text-emerald-700" : p.status === "banned" ? "bg-red-100 text-red-700" : p.status === "rejected" ? "bg-neutral-100 text-neutral-500" : "bg-yellow-100 text-yellow-700")}>{p.status}</span>
                          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", p.paymentStatus === "paid" ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-500")}>{p.paymentStatus}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {p.status === "pending" && (
                          <>
                            <button onClick={() => handleParticipantAction(p.id, "approved")} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100" title="Approve"><Check size={18} /></button>
                            <button onClick={() => handleParticipantAction(p.id, "rejected")} className="p-2 bg-neutral-50 text-neutral-400 rounded-xl hover:bg-red-50 hover:text-red-500" title="Reject"><X size={18} /></button>
                          </>
                        )}
                        {p.status === "approved" && (
                          <button onClick={() => handleParticipantAction(p.id, "banned")} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100" title="Ban"><Ban size={18} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-xl shadow-neutral-200/50">
                <div className="mb-8">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Registration Fee</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-neutral-900">{event.isFree ? "Free" : formatCurrency(event.registrationFee)}</span>
                    {!event.isFree && <span className="text-neutral-400 font-medium">/ person</span>}
                  </div>
                </div>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-sm text-neutral-600"><Shield size={18} className="text-orange-600" /><span>Secure Payment Processing</span></div>
                  <div className="flex items-center space-x-3 text-sm text-neutral-600"><MessageSquare size={18} className="text-orange-600" /><span>Instant Confirmation</span></div>
                </div>
                {isOwner ? (
                  <div className="space-y-3">
                    <Link to="/dashboard/my-events" className="w-full py-4 bg-neutral-900 text-white font-bold rounded-2xl flex items-center justify-center hover:bg-neutral-800 transition-all">Manage Event</Link>
                    <button onClick={handleDeleteEvent} className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all">Delete Event</button>
                  </div>
                ) : myParticipation ? (
                  <div className={cn("w-full py-4 rounded-2xl text-center font-bold text-sm", myParticipation.status === "approved" ? "bg-emerald-50 text-emerald-700" : myParticipation.status === "banned" ? "bg-red-50 text-red-700" : "bg-yellow-50 text-yellow-700")}>
                    {myParticipation.status === "approved" ? "✓ You are registered" : myParticipation.status === "banned" ? "✗ You are banned" : "⏳ Pending approval"}
                  </div>
                ) : (
                  <button onClick={handleJoin} disabled={joining} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-200 hover:bg-orange-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                    {joining ? "Processing..." : getJoinButtonText()}
                  </button>
                )}
                <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-6">Limited spots available</p>
              </div>
              <div className="bg-orange-50 p-8 rounded-[2.5rem] border border-orange-100">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertCircle className="text-orange-600" size={20} />
                  <h4 className="font-bold text-orange-900">Event Visibility</h4>
                </div>
                <p className="text-sm text-orange-800/70 leading-relaxed mb-6">
                  This event is <strong>{event.isPublic ? "public" : "private"}</strong> and <strong>{event.isFree ? "free" : "paid"}</strong>.
                </p>
                <Link to="/dashboard" className="text-sm font-bold text-orange-600 hover:underline">Manage your events →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
