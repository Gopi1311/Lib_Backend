import cron from "node-cron";
import { Borrow } from "../../models/Borrow";

cron.schedule(
  "0 * * * *",   // every hour at minute 0
  async () => {
    try {
      console.log("⏳ Running overdue check job...");

      const today = new Date();

      const borrows = await Borrow.find({
        status: { $in: ["issued", "late"] },
        dueDate: { $lt: today },
      });

      for (const borrow of borrows) {
        const due = new Date(borrow.dueDate);

        const daysLate = Math.floor(
          (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
        );

        borrow.status = "late";
        borrow.fine = daysLate * 10; // ₹10 per day
        await borrow.save();
      }

      console.log(`✔ Overdue check completed. Updated ${borrows.length} borrow(s).`);
    } catch (error) {
      console.error("❌ Overdue cron job error:", error);
    }
  }
);
