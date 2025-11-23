import cron from "node-cron";
import { Reservation } from "../../models/Reservation";

cron.schedule(
  "0 * * * *",
  async () => {
    try {
      console.log("⏳ Running reservation auto-expiry job...");

      const now = new Date();

      const expiredReservations = await Reservation.find({
        status: "active",
        expiryDate: { $lt: now },
      });

      for (const reservation of expiredReservations) {
        reservation.status = "cancelled";
        await reservation.save();
      }

      console.log(
        `✔ Auto-expiry completed. Updated ${expiredReservations.length} reservation(s).`
      );
    } catch (error) {
      console.error("❌ Cron job error:", error);
    }
  }
);
