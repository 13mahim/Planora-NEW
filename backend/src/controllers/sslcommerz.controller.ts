import { Response, NextFunction } from "express";
import SSLCommerzPayment from "sslcommerz-lts";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/errorHandler";
import { AuthRequest } from "../middlewares/auth.middleware";

const store_id = process.env.SSLCOMMERZ_STORE_ID!;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!;
const is_live = process.env.SSLCOMMERZ_IS_LIVE === "true";

export const initSSLPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.body;
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError("Event not found", 404);
    if (event.isFree) throw new AppError("This event is free", 400);

    const user = await prisma.user.findUnique({ where: { id: req.user!.uid } });
    if (!user) throw new AppError("User not found", 404);

    const transactionId = `PLANORA-${Date.now()}-${req.user!.uid.slice(0, 8)}`;

    // Save payment record
    await prisma.payment.create({
      data: {
        userId: req.user!.uid,
        eventId,
        amount: event.registrationFee,
        stripeSessionId: transactionId, // reusing field for tran_id
      },
    });

    const data = {
      total_amount: event.registrationFee,
      currency: "BDT",
      tran_id: transactionId,
      success_url: `${process.env.CLIENT_URL}/payment/ssl-success?tran_id=${transactionId}&eventId=${eventId}`,
      fail_url: `${process.env.CLIENT_URL}/payment/ssl-fail`,
      cancel_url: `${process.env.CLIENT_URL}/events/${eventId}`,
      ipn_url: `${process.env.CLIENT_URL?.replace("5173", "5000")}/api/payment/ssl/ipn`,
      shipping_method: "NO",
      product_name: event.title,
      product_category: "Event",
      product_profile: "general",
      cus_name: user.displayName,
      cus_email: user.email,
      cus_add1: "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: "01700000000",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const apiResponse = await sslcz.init(data);

    if (apiResponse?.GatewayPageURL) {
      res.json({ url: apiResponse.GatewayPageURL, transactionId });
    } else {
      throw new AppError("Failed to initialize SSLCommerz payment", 500);
    }
  } catch (err) { next(err); }
};

export const sslSuccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tran_id, eventId } = req.query;

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const validation = await sslcz.validate({ val_id: req.body.val_id });

    if (validation?.status !== "VALID" && validation?.status !== "VALIDATED") {
      throw new AppError("Payment validation failed", 400);
    }

    const event = await prisma.event.findUnique({ where: { id: eventId as string } });
    if (!event) throw new AppError("Event not found", 404);

    await prisma.payment.updateMany({
      where: { stripeSessionId: tran_id as string },
      data: { isPaid: true },
    });

    // Get userId from payment record
    const payment = await prisma.payment.findFirst({ where: { stripeSessionId: tran_id as string } });
    if (!payment) throw new AppError("Payment record not found", 404);

    const user = await prisma.user.findUnique({ where: { id: payment.userId } });
    const participantStatus = event.isPublic ? "approved" : "pending";

    await prisma.participant.upsert({
      where: { userId_eventId: { userId: payment.userId, eventId: event.id } },
      update: { status: participantStatus, paymentStatus: "paid" },
      create: {
        eventId: event.id,
        userId: payment.userId,
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

export const sslIPN = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tran_id, status } = req.body;
    if (status === "VALID" || status === "VALIDATED") {
      await prisma.payment.updateMany({
        where: { stripeSessionId: tran_id },
        data: { isPaid: true },
      });
    }
    res.json({ received: true });
  } catch (err) { next(err); }
};
