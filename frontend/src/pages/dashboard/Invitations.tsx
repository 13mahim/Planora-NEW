import { useState, useEffect } from "react";
import { Mail, Check, X, Calendar, User } from "lucide-react";
import { eventService } from "../../services/eventService";
import { Invitation } from "../../types";
import { toast } from "sonner";
import { formatCurrency } from "../../lib/utils";

export function Invitations() {
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const data = await eventService.getMyInvitations();
      setInvites(data);
    } catch { toast.error("Failed to load invitations"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInvites(); }, []);

  const handleAccept = async (inv: Invitation) => {
    try {
      const res = await eventService.acceptInvitation(inv.id);
      if (res.requiresPayment) {
        const payment = await eventService.createCheckoutSession(inv.eventId);
        window.location.href = payment.url;
      } else {
        toast.success("Invitation accepted!");
        fetchInvites();
      }
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to accept"); }
  };

  const handleDecline = async (id: string) => {
    try {
      await eventService.declineInvitation(id);
      toast.success("Invitation declined");
      fetchInvites();
    } catch { toast.error("Failed to decline"); }
  };

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-neutral-100 rounded-[2.5rem] animate-pulse" />)}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Pending Invitations</h1>
        <p className="text-neutral-500 mt-1">You've been invited to these exclusive events.</p>
      </div>

      {invites.length === 0 ? (
        <div className="py-24 bg-white rounded-[3rem] border border-dashed border-neutral-300 text-center">
          <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6 text-neutral-400"><Mail size={32} /></div>
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No pending invitations</h3>
          <p className="text-neutral-500">When you're invited to private events, they'll appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invites.map((invite) => (
            <div key={invite.id} className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Mail size={24} /></div>
                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  {(invite as any).fee === 0 ? "Free Entry" : `Fee: ${formatCurrency((invite as any).fee || 0)}`}
                </span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">{invite.eventTitle}</h3>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2 text-neutral-500 text-sm">
                  <User size={14} className="text-orange-600" />
                  <span>Invited by <span className="font-bold text-neutral-700">{invite.hostName}</span></span>
                </div>
                {(invite as any).date && (
                  <div className="flex items-center space-x-2 text-neutral-500 text-sm">
                    <Calendar size={14} className="text-orange-600" />
                    <span>{(invite as any).date}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button onClick={() => handleAccept(invite)} className="grow py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all flex items-center justify-center space-x-2">
                  <Check size={18} />
                  <span>{(invite as any).fee > 0 ? "Pay & Accept" : "Accept"}</span>
                </button>
                <button onClick={() => handleDecline(invite.id)} className="px-4 py-3 bg-neutral-50 text-neutral-400 font-bold rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
