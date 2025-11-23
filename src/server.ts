import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { config } from "./config/env";

import bookRouter from "./router/BookRouter";
import userRouter from "./router/UserRouter";
import borrowRouter from "./router/BorrowRouter";
import reservationRouter from "./router/ReservationRouter";
import reviewRouter from "./router/ReviewRouter";
import finePaymentRouter from "./router/FinePaymentRouter";
import adminDashBoardRouter from "./router/AdminDashBoardRouter";

import "./utils/cron/AutoFineCheck";
import "./utils/cron/AutoExpireReservations";


const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173"], 
    credentials: true,
  }) 
);

app.use("/api/books", bookRouter);
app.use("/api/users",userRouter);
app.use("/api/borrows",borrowRouter);
app.use("/api/reservations",reservationRouter);
app.use("/api/fines",finePaymentRouter);
app.use("/api/reviews",reviewRouter);
app.use("/api/admin",adminDashBoardRouter);


connectDB().then(() => {
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
  });
});
