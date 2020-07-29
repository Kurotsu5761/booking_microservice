export default interface IPaymentService {
  verifyPayment(id: any, paymentInfo: any): Promise<boolean>;
}
