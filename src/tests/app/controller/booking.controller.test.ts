import { IBooking } from "./../../../db/model/booking.interface";
import BookingController from "../../../app/controller/booking.controller";
import { stubInterface } from "ts-sinon";
import { IBookingService } from "../../../app/service/booking.service";
import IPaymentService from "../../../app/service/payment.service.inteface";
import { BookingState } from "../../../db/model/booking.interface";
import { mockResponse, mockRequest } from "mock-req-res";
import chai from "chai";
chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));

let expect = chai.expect;

describe("Booking Controller", () => {
  let mockRes = mockResponse();
  let mockReq = mockRequest();
  let mockBookingService = stubInterface<IBookingService>();
  let mockPaymentService = stubInterface<IPaymentService>();
  let booking = new BookingController(mockPaymentService, mockBookingService);

  const setUpBooking = () => {
    mockBookingService.createBooking.resolves(stubBooking);

    mockBookingService.updateBookingStatusById.resolves(stubBooking);

    mockPaymentService.verifyPayment.resolves(true);

    mockReq.body = stubBody;
  };

  let stubBooking: IBooking = {
    id: "1",
    userId: "2",
    bookingStart: "1596083906000",
    bookingEnd: "1596087506000",
    createdAt: "1596008745194",
    state: BookingState.CANCELED,
  };

  let stubBody = {
    bookingInfo: {
      userId: "1",
      time: {
        start: "Wed, 30 Jul 2020 04:38:26 GMT",
        end: "Wed, 30 Jul 2020 05:38:26 GMT",
      },
    },
    paymentInfo: {
      payment_type: "credit card",
    },
  };

  afterEach(() => {
    mockRes.send.resetHistory();
    mockRes.status.resetHistory();
    mockRes.sendStatus.resetHistory();
    mockBookingService.deleteBookings.resetHistory();
    mockBookingService.createBooking.resetHistory();
    mockBookingService.getBookingById.resetHistory();
    mockBookingService.getBookings.resetHistory();
    mockBookingService.updateBookingStatusById.resetHistory();
    mockBookingService.deleteBookings.resetBehavior();
    mockBookingService.createBooking.resetBehavior();
    mockBookingService.getBookingById.resetBehavior();
    mockBookingService.getBookings.resetBehavior();
    mockBookingService.updateBookingStatusById.resetBehavior();
    mockPaymentService.verifyPayment.resetBehavior();
    mockPaymentService.verifyPayment.resetHistory();
  });

  describe("createBooking", () => {
    it("should call bookingService.createBooking once", async () => {
      setUpBooking();

      await booking.createBooking(mockReq, mockRes);

      expect(mockBookingService.createBooking).to.has.been.calledOnce;
    });

    it("should send code 201 and booking id once completed", async () => {
      setUpBooking();

      await booking.createBooking(mockReq, mockRes);

      expect(mockRes.status).to.has.been.calledWith(201);
      expect(mockRes.json).to.has.been.calledWith({ id: stubBooking.id });
    });

    it("should call paymentService.verifyPayment if there's paymentInfo provided in the body", async () => {
      setUpBooking();

      await booking.createBooking(mockReq, mockRes);

      expect(mockPaymentService.verifyPayment).to.have.been.calledOnceWith(
        stubBooking.id,
        stubBody.paymentInfo
      );
      expect(
        mockBookingService.updateBookingStatusById
      ).to.have.been.calledWith(stubBooking.id, BookingState.CONFIRMED);
      expect(
        mockBookingService.updateBookingStatusById
      ).to.have.been.calledWith(stubBooking.id, BookingState.AWAITING_PAYMENT);
    });

    it("should not call paymentService.verifyPayment if there's no paymentInfo provided in the body and state shouldn't be updated", async () => {
      setUpBooking();

      mockReq.body = {
        bookingInfo: stubBody.bookingInfo,
      };

      await booking.createBooking(mockReq, mockRes);

      expect(mockPaymentService.verifyPayment).to.have.not.been.called;
      expect(mockBookingService.updateBookingStatusById).to.have.not.been
        .called;
    });

    it("should update the state to comfirmed if verifyPayment return true", async () => {
      setUpBooking();

      await booking.createBooking(mockReq, mockRes);

      expect(
        mockBookingService.updateBookingStatusById
      ).to.have.been.calledWith(stubBooking.id, BookingState.CONFIRMED);
    });

    it("should update the state back to created and send status 201, return payment_status if verifyPayment return false", async () => {
      setUpBooking();

      mockPaymentService.verifyPayment.resolves(false);

      await booking.createBooking(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(201);
      expect(mockBookingService.updateBookingStatusById).have.been.calledWith(
        stubBooking.id,
        BookingState.CREATED
      );
      expect(mockRes.json).to.have.been.calledWith({
        id: stubBooking.id,
        payment_status: "Payment rejected",
      });
    });
  });
  describe("processPayment", () => {
    it("should return status 403 if no paymentInfo is provided", async () => {
      setUpBooking();

      mockReq.params["id"] = "1";

      mockReq.body = {};

      await booking.processPayment(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(403);
    });

    it("should return 404 if id doesn't exist in the db", async () => {
      setUpBooking();

      mockReq.params["id"] = "1";

      mockBookingService.getBookingById.resolves(null);

      await booking.processPayment(mockReq, mockRes);

      expect(mockRes.sendStatus).to.have.been.calledWith(404);
    });

    it("should return 403 if booking state is awaiting payment", async () => {
      setUpBooking();

      mockReq.params["id"] = "1";

      mockBookingService.getBookingById.resolves({
        ...stubBooking,
        state: BookingState.AWAITING_PAYMENT,
      });

      await booking.processPayment(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(403);
    });

    it("should return 403 if booking status is not created", async () => {
      setUpBooking();

      mockReq.params["id"] = "1";

      mockBookingService.getBookingById.resolves({
        ...stubBooking,
        state: BookingState.CONFIRMED,
      });

      await booking.processPayment(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(403);
    });

    it("should update the state to confirmed if verifyPayment returns true", async () => {
      setUpBooking();

      mockBookingService.getBookingById.resolves({
        ...stubBooking,
        state: BookingState.CREATED,
      });

      mockReq.params["id"] = "1";

      await booking.processPayment(mockReq, mockRes);

      expect(
        mockBookingService.updateBookingStatusById
      ).to.have.been.calledWith(stubBooking.id, BookingState.CONFIRMED);
    });

    it("should send code 200 once completed", async () => {
      setUpBooking();

      mockBookingService.getBookingById.resolves({
        ...stubBooking,
        state: BookingState.CREATED,
      });

      mockReq.params["id"] = "1";

      await booking.processPayment(mockReq, mockRes);

      expect(mockRes.sendStatus).to.have.been.calledOnceWith(200);
    });

    it("should update the state back to created and send status 403 if verifyPayment return false", async () => {
      setUpBooking();
      mockBookingService.getBookingById.resolves({
        ...stubBooking,
        state: BookingState.CREATED,
      });
      mockReq.params["id"] = "1";

      mockPaymentService.verifyPayment.resolves(false);

      await booking.processPayment(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledOnceWith(403);
      expect(mockBookingService.updateBookingStatusById).have.been.calledWith(
        stubBooking.id,
        BookingState.CREATED
      );
    });
  });
  describe("cancelBooking", () => {
    it("should return 404 if id doesn't exist in the db", async () => {
      mockBookingService.getBookingById.withArgs("2").resolves(null);

      mockReq.params["id"] = "2";

      await booking.cancelBooking(mockReq, mockRes);

      expect(mockBookingService.updateBookingStatusById).have.not.been.called;
      expect(mockRes.sendStatus).to.have.been.calledWith(404);
    });

    it("should return the booking with state canceled", async () => {
      mockBookingService.getBookingById.withArgs("1").resolves(stubBooking);

      mockBookingService.updateBookingStatusById
        .withArgs("1", BookingState.CANCELED)
        .resolves({ ...stubBooking, state: BookingState.CANCELED });
      mockReq.params["id"] = "1";

      await booking.cancelBooking(mockReq, mockRes);

      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.json).to.have.been.calledWith({
        ...stubBooking,
        state: BookingState.CANCELED,
      });
    });
  });
  describe("getBooking", () => {
    it("should return 404 if id doesn't exist in the db", async () => {
      mockBookingService.getBookingById.withArgs("2").resolves(null);
      mockReq.params["id"] = "2";

      await booking.getBooking(mockReq, mockRes);

      expect(mockRes.sendStatus).to.have.been.calledWith(404);
    });
    it("should return status 200 and booking with the correct id", async () => {
      //Arrange
      mockBookingService.getBookingById.withArgs("1").resolves(stubBooking);
      mockReq.params["id"] = "1";

      //Act
      await booking.getBooking(mockReq, mockRes);

      //Assert
      expect(mockRes.status).to.have.been.calledWith(200);
      expect(mockRes.json).to.have.been.calledWith(stubBooking);
    });
  });
  describe("getBookings", () => {
    it("should return list of bookings", async () => {
      mockBookingService.getBookings.resolves([stubBooking]);

      await booking.getBookings(mockReq, mockRes);

      expect(mockRes.json).to.have.been.calledWith([stubBooking]);
    });
  });
  describe("removeBookings", () => {
    it("should call bookingService.deleteBooks once and response with status 200", async () => {
      mockBookingService.deleteBookings.resolves();

      await booking.removeBookings(mockReq, mockRes);

      expect(
        mockBookingService.deleteBookings
      ).to.have.been.calledOnceWithExactly();
      expect(mockRes.sendStatus).to.have.been.calledWith(200);
    });
  });
});
