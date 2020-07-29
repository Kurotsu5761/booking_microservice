import express from "express";
import { BookingState } from "../../db/model/booking.interface";
import IPaymentService from "../service/payment.service.inteface";
import { IBookingService } from "../service/booking.service";

class BookingController {
  private paymentService: IPaymentService;
  private bookingService: IBookingService;

  constructor(
    paymentService: IPaymentService,
    bookingService: IBookingService
  ) {
    this.paymentService = paymentService;
    this.bookingService = bookingService;
  }

  createBooking = (req: express.Request, res: express.Response) => {
    try {
      let { paymentInfo, bookingInfo } = req.body;
      return this.bookingService
        .createBooking(bookingInfo)
        .then((savedBooking) => {
          //Automatically call payment service after booking created if paymentInfo is provided
          if (
            paymentInfo !== undefined &&
            Object.keys(paymentInfo).length !== 0
          ) {
            //Some callback hell
            return this.bookingService
              .updateBookingStatusById(
                savedBooking.id,
                BookingState.AWAITING_PAYMENT
              )
              .then(() => {
                return this.paymentService
                  .verifyPayment(savedBooking.id, paymentInfo)
                  .then((status) => {
                    //Update the booking state only if payment return true
                    if (status) {
                      return this.bookingService
                        .updateBookingStatusById(
                          savedBooking.id,
                          BookingState.CONFIRMED
                        )
                        .then(() => {
                          return res.status(201).json({ id: savedBooking.id });
                        });
                    } else {
                      return res.status(403).send("Payment rejected");
                    }
                  });
              });
          } else {
            return res.status(201).json({ id: savedBooking.id });
          }
        });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  };

  processPayment = (req: express.Request, res: express.Response) => {
    try {
      let { paymentInfo } = req.body;
      if (
        paymentInfo === null ||
        paymentInfo === undefined ||
        Object.keys(paymentInfo).length === 0
      )
        return res.status(403).send("Payment Info not provided");
      return this.bookingService
        .getBookingById(req.params["id"])
        .then((foundBooking) => {
          if (!foundBooking) return res.status(404);
          if (foundBooking.state === BookingState.AWAITING_PAYMENT)
            return res.status(403).send("Payment already under process");
          if (foundBooking.state !== BookingState.CREATED)
            return res.status(403).send(`Booking is ${foundBooking.state}`);

          return this.bookingService
            .updateBookingStatusById(
              foundBooking.id,
              BookingState.AWAITING_PAYMENT
            )
            .then(() => {
              return this.paymentService
                .verifyPayment(foundBooking.id, paymentInfo)
                .then((status) => {
                  //Update the booking state only if payment return true
                  if (status) {
                    return this.bookingService
                      .updateBookingStatusById(
                        foundBooking.id,
                        BookingState.CONFIRMED
                      )
                      .then(() => {
                        return res.status(201).json({ id: foundBooking.id });
                      });
                  } else {
                    return this.bookingService
                      .updateBookingStatusById(
                        foundBooking.id,
                        BookingState.CREATED
                      )
                      .then(() => {
                        return res.status(403).send("Payment rejected");
                      });
                  }
                });
            });
        });
    } catch {}
  };

  cancelBooking = (req: express.Request, res: express.Response) => {
    try {
      return this.bookingService
        .getBookingById(req.params["id"])
        .then((foundBooking) => {
          if (!foundBooking) return res.status(404);
          return this.bookingService
            .updateBookingStatusById(foundBooking.id, BookingState.CANCELED)
            .then((booking) => {
              return res.status(200).json(booking);
            });
        });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  };

  getBooking = (req: express.Request, res: express.Response) => {
    try {
      return this.bookingService
        .getBookingById(req.params["id"])
        .then((foundBooking) => {
          if (!foundBooking) return res.status(404);
          return res.status(200).json(foundBooking);
        });
    } catch (error) {
      console.error(error);
      return res.status(500);
    }
  };

  getBookings = (req: express.Request, res: express.Response) => {
    return this.bookingService.getBookings().then((result) => {
      return res.json(result);
    });
  };

  removeBookings = (req: express.Request, res: express.Response) => {
    return this.bookingService
      .deleteBookings()
      .then(() => {
        return res.status(200);
      })
      .catch((err) => {
        console.error(err);
        return res.status(500);
      });
  };
}

export default BookingController;
