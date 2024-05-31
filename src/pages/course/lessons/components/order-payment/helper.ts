import { AxiosAPI } from "@/libs/api/axios-client";

const createOrder = async (payload: any) => {
  const order: any = await AxiosAPI.post("v1/orders/creates", payload);
  return order?.data?.data
};

const makePayment = async (id: string, return_url: any) => {
  const infoPayment: any = await AxiosAPI.post(`/v1/orders/${id}/payment`, { return_url: return_url });
  return infoPayment?.data?.data?.payment_data;
};

const paymentHelper = {
  createOrder,
  makePayment,
};

export default paymentHelper;
