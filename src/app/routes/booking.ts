import express from "express";
import BookingController from "../controller/booking.controller";
import PaymentService from "../service/payment.service";
import { BookingService } from "../service/booking.service";

const router = express.Router();

let controller = new BookingController(
  new PaymentService(),
  new BookingService()
);

router.get("/", controller.getBookings);
router.post("/", controller.createBooking);
router.delete("/", controller.removeBookings);
router.put("/:id/cancel", controller.cancelBooking);
router.get("/:id", controller.getBooking);
router.put("/:id/payment", controller.processPayment);

export default router;
