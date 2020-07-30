import IPaymentService from "./payment.service.inteface";
import { default as axios } from "axios";
const base_uri: string =
  process.env.PAYMENT_SERVICE_URI || "http://localhost:8001/payment";

const PAYMENT_SERVICE_SECRET = "verysecretiveindeed";

class PaymentService implements IPaymentService {
  async verifyPayment(id: any, paymentInfo: any): Promise<boolean> {
    return axios(`${base_uri}/verify`, {
      method: "POST",
      data: paymentInfo,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYMENT_SERVICE_SECRET}`,
      },
    })
      .then((res) => {
        return res.data.result;
      })
      .catch((err) => {
        throw Error(err);
      });
  }
}

export default PaymentService;
