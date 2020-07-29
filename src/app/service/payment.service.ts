import IPaymentService from "./payment.service.inteface";
const base_uri: string =
  process.env.PAYMENT_SERVICE_URI || "localhost:8001/payment";

class PaymentService implements IPaymentService {
  async verifyPayment(id: any, paymentInfo: any): Promise<boolean> {
    return fetch(`${base_uri}/verify`, {
      body: JSON.stringify({ id, paymentInfo }),
      method: "POST",
    })
      .then((res) => res.json())
      .then((res) => res.result)
      .catch((err) => {
        throw Error(err);
      });
  }
}

export default PaymentService;
