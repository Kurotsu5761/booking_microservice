export interface IBooking {
  id: string;
  state: BookingState;
  createdAt: string;
  bookingStart: string;
  bookingEnd: string;
  userId: string;
}

export enum BookingState {
  CREATED = "created",
  AWAITING_PAYMENT = "awaiting payment",
  CONFIRMED = "confirmed",
  CANCELED = "canceled",
}
