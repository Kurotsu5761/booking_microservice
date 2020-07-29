import { BookingService } from "./../../../app/service/booking.service";
import chai from "chai";
import conn from "../../../db";
import mongoose from "mongoose";
import { BookingState } from "../../../db/model/booking.interface";

const expect = chai.expect;
chai.use(require("chai-as-promised"));

process.env.NODE_ENV = "test";

/// Setup to establish in memory mongoose for controlled test
const testSetup = () => {
  before((done) => {
    conn
      .connect()
      .then(() => done())
      .catch((err) => {
        console.log(err);
        done(err);
      });
  });

  after((done) => {
    conn
      .close()
      .then(() => done())
      .catch((err) => done(err));
  });
};

describe("Booking Service", () => {
  testSetup();
  let booking = new BookingService();
  let insertedId: string[] = [];
  let randomID = "" + mongoose.Types.ObjectId();

  describe("createBooking", () => {
    it("should create and return booking object", async () => {
      let now = new Date();
      //Setting up stub info
      let bookingInfo = {
        userId: 1,
        time: {
          start: new Date(now.setDate(now.getDate() + 1)),
          end: new Date(now.setDate(now.getDate() + 2)),
        },
      };

      let object = await booking.createBooking(bookingInfo);
      //Saving for future use
      insertedId.push(object.id);

      expect(object).not.null;
    });
  });

  describe("getBookings", () => {
    it("should return exactly one item in array", async () => {
      let objects = await booking.getBookings();

      //There's exactly 1 item (inserted above);
      expect(objects).to.be.length(1);
    });
  });

  describe("getBookingById", () => {
    it("should return an item with provided ID", async () => {
      let object = await booking.getBookingById(insertedId[0]);
      expect(object!.id).to.equal(insertedId[0]);
    });

    it("should return empty where ID doesn't exist", async () => {
      let object = await booking.getBookingById(randomID);
      expect(object).to.be.null;
    });
  });

  describe("updateBookingStatusById", () => {
    it("should throw error if id not found", async () => {
      await expect(
        booking.updateBookingStatusById(randomID, BookingState.AWAITING_PAYMENT)
      ).to.eventually.rejectedWith(Error);
    });

    it("should return object with updated state", async () => {
      let object = await booking.updateBookingStatusById(
        insertedId[0],
        BookingState.AWAITING_PAYMENT
      );
      expect(object.state).to.equal(BookingState.AWAITING_PAYMENT);
    });
  });

  describe("deleteBooking", () => {
    it("should return empty array calling getBookings", async () => {
      await booking.deleteBookings();
      let objects = await booking.getBookings();
      expect(objects).to.have.lengthOf(0);
    });
  });
});
