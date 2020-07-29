import { BookingModel } from "../../db/model/booking";
import { BookingState, IBooking } from "../../db/model/booking.interface";
import { _validateExist, _validateDate } from "../util";

export interface IBookingService {
  createBooking(bookingInfo: any): Promise<IBooking>;
  getBookings(): Promise<IBooking[]>;
  getBookingById(id: string): Promise<IBooking | null>;
  deleteBookings(): Promise<any>;
  updateBookingStatusById(
    id: string,
    state: BookingState
  ): Promise<IBooking | null>;
}

export class BookingService implements IBookingService {
  createBooking = async (bookingInfo: any) => {
    try {
      let _bookingInfo = new BookingInfo(bookingInfo);
      this._checkBoookingClash(
        _bookingInfo.bookingStart,
        _bookingInfo.bookingEnd
      );
      let newBooking = new BookingModel(_bookingInfo);
      return await newBooking.save().then((docs) => docs);
    } catch (err) {
      throw Error(err);
    }
  };
  getBookings = async () => {
    try {
      return await BookingModel.find({});
    } catch (err) {
      throw Error(err);
    }
  };
  getBookingById = async (id: string) => {
    try {
      return await BookingModel.findById(id);
    } catch (err) {
      throw Error(err);
    }
  };
  deleteBookings = async () => {
    try {
      return await BookingModel.deleteMany({});
    } catch (err) {
      throw Error(err);
    }
  };
  updateBookingStatusById = async (id: string, state: BookingState) => {
    let booking = await BookingModel.findByIdAndUpdate(
      id,
      { state },
      { new: true, useFindAndModify: false }
    );
    if (!booking) {
      throw Error("booking not found");
    }
    return booking;
  };

  private _checkBoookingClash = (start: string, end: string) => {};
}

export class BookingInfo {
  userId: number;
  bookingStart: string;
  bookingEnd: string;
  createdAt: string;
  state: BookingState;

  constructor(info: any) {
    _validateExist(info, "userId");
    _validateExist(info, "time");
    _validateExist(info.time, "start");
    _validateExist(info.time, "end");
    _validateDate(info.time.start);

    this.userId = info["id"];
    this.bookingStart = Date.parse(info.time.start).toString();
    this.bookingEnd = Date.parse(info.time.end).toString();
    this.createdAt = Date.now().toString();
    this.state = BookingState.CREATED;
  }
}
