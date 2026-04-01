import { useState, useEffect } from "react";
import { Star, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { eventService } from "../../services/eventService";
import { useAuth } from "../../context/AuthContext";
import { Review } from "../../types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function MyReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    if (!user) return;
    try {
      const data = await eventService.getUserReviews(user.uid);
      setReviews(data);
    } catch { toast.error("Failed to load reviews"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [user]);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdate = async () => {
    if (!editingReview) return;
    setSubmitting(true);
    try {
      await eventService.updateReview(editingReview.id, editRating, editComment);
      toast.success("Review updated!");
      setEditingReview(null);
      fetchReviews();
    } catch { toast.error("Failed to update review"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await eventService.deleteReview(id);
      toast.success("Review deleted");
      fetchReviews();
    } catch { toast.error("Failed to delete review"); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-12 h-12 text-orange-600 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Reviews</h1>
        <p className="text-neutral-500 mt-1">Manage the feedback you've shared on events.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="py-24 bg-white rounded-[3rem] border border-dashed border-neutral-300 text-center">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400"><Star size={32} /></div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No reviews yet</h3>
          <p className="text-neutral-500">After attending events, you can share your experience here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900">{review.eventTitle}</h3>
                  <p className="text-xs text-neutral-400 font-medium mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex text-orange-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />)}
                </div>
              </div>
              <p className="text-neutral-600 leading-relaxed mb-8 italic">"{review.comment}"</p>
              <div className="flex space-x-3">
                <button onClick={() => handleEdit(review)} className="flex items-center space-x-2 px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-neutral-800 transition-all">
                  <Edit2 size={16} /><span>Edit</span>
                </button>
                <button onClick={() => handleDelete(review.id)} className="flex items-center space-x-2 px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all">
                  <Trash2 size={16} /><span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingReview(null)} className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">Edit Review</h2>
                <button onClick={() => setEditingReview(null)} className="p-2 hover:bg-neutral-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="flex space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setEditRating(star)} className="text-orange-500 transition-transform hover:scale-110">
                    <Star size={32} fill={star <= editRating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea rows={4} value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full px-6 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all mb-6" />
              <button onClick={handleUpdate} disabled={submitting} className="w-full py-4 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 transition-all disabled:opacity-50">
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
