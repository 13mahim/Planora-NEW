import { Response, NextFunction } from "express";
import Stripe from "stripe";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createCheckoutSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.body;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.isFree) throw new AppError("This event is free", 400);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: event.title },
          unit_amount: Math.round(event.registrationFee * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/events/${eventId}`,
      metadata: { eventId, userId: req.user!.uid },
    });

    await prisma.payment.create({
      data: {
        userId: req.user!.uid,
        eventId,
        amount: event.registrationFee,
        stripeSessionId: session.id,
      },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) { next(err); }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.query;
    const session = await stripe.checkout.sessions.retrieve(sessionId as string);
    if (session.payment_status !== "paid") throw new AppError("Payment not completed", 400);

    const { eventId, userId } = session.metadata!;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);

    // Update payment record
    await prisma.payment.updateMany({
      where: { stripeSessionId: sessionId as string },
      data: { isPaid: true, stripePaymentId: session.payment_intent as string },
    });

    // Update participant: public paid → approved, private paid → pending (needs organizer approval)
    const participantStatus = event.isPublic ? "approved" : "pending";
    const user = await prisma.user.findUnique({ where: { id: userId } });

    await prisma.participant.upsert({
      where: { userId_eventId: { userId, eventId } },
      update: { status: participantStatus, paymentStatus: "paid" },
      create: {
        eventId,
        userId,
        userName: user!.displayName,
        userEmail: user!.email,
        status: participantStatus,
        paymentStatus: "paid",
      },
    });

    res.json({
      success: true,
      message: event.isPublic
        ? "Payment successful! You are now registered."
        : "Payment successful! Awaiting organizer approval.",
    });
  } catch (err) { next(err); }
};

export const stripeWebhook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers["stripe-signature"]!;
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { isPaid: true },
      });
    }
    res.json({ received: true });
  } catch (err) { next(err); }
};
