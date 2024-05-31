// import Button from "@/components/common/button";
import { cn, currency, sleep } from "@/lib/utils";
import { AxiosAPI } from "@/libs/api/axios-client";
import { useRef, useState } from "react";
import { useToast } from "@/context/toast";
import { useNavigate } from "react-router-dom";
import paymentHelper from "./helper";
import { sendEvent } from "@/libs/tracking";
import { useLocalStorage } from "usehooks-ts";

interface IProps {
  infoPayment: any;
}

const Card = ({ infoPayment }: IProps) => {
  const { fail, success }: any = useToast();
  const [_, setTrackingPayment] = useLocalStorage("trackingPayment", false);
  const [loading, setLoading] = useState(false);
  const [resCode, setResCode] = useState<any>(null);
  const [isLoading, setLoadingButton] = useState(false);
  const oldText = useRef("");
  const navigate = useNavigate();

  const percent = Math.ceil((infoPayment.price / infoPayment.original_price) * 100);

  const price = infoPayment.price || 0;
  const percentApplyVoucher = resCode ? Math.ceil((resCode?.discount_amount / resCode?.sub_total_price) * 100) : 0;
  const priceAfterVoucher = resCode?.total_price >= 0 ? resCode?.total_price : price;

  const handleBuy = async (payload: any) => {
    try {
      const { order_id, status }: any = await paymentHelper.createOrder(payload);
      if (status == "paid") {
        sendEvent("Purchase", { order_id, item_id: infoPayment.id, value: 0, currency: "VND" });
        navigate(`/result-payment?status=PAID&orderCode=${infoPayment.id}`);
        return;
      }
      const payment_url = await paymentHelper.makePayment(order_id, window.location.origin + "/result-payment");
      setResCode(null);
      window.location.href = payment_url;
    } catch (error: any) {
      console.log("[error]", error.response?.data?.message);
      fail(error.response?.data?.message);
    }
    setLoadingButton(false);
  };

  const onBuy = async () => {
    sendEvent("InitiateCheckout");
    setTrackingPayment(true);
    if (!isLoading) {
      setLoadingButton(true);
      const payload: any = {
        item_type: "class",
        item_id: infoPayment.id,
        total_price: parseInt(priceAfterVoucher),
        payment_method: "qr",
      };
      if (resCode?.voucher_code) payload.discount_code = resCode?.voucher_code;
      handleBuy(payload);
    }
  };

  const onSubmit = async (text: string) => {
    if (text === "") return setResCode({ voucher_code: text, error_details: "Nhập mã khuyến mãi ở đây bạn nhé." });
    if (loading || oldText.current === text) return;
    const payload = {
      item_type: "class",
      item_id: infoPayment.id,
      discount_code: text,
    };
    setLoading(true);
    try {
      const res = await AxiosAPI.post("/v1/orders/estimates", payload);
      oldText.current = text;
      setResCode({ ...res.data?.data, voucher_code: text });
      setLoading(false);
    } catch (error: any) {
      setResCode({ voucher_code: text, error_details: error?.response?.data?.message });
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="px-6">
        <Input onSubmit={onSubmit} loading={loading} />
        {resCode?.error_details && <div className="text-[#FF4266] text-sm mt-2">{resCode?.error_details}</div>}
        <div className="border-[1px] border-neu4 my-[24px]"></div>
        {resCode?.discount_amount > 0 && (
          <div className="flex justify-between items-center text-primary1 body-1 mt-3">
            <div>
              {resCode.voucher_code} ({percentApplyVoucher}%)
            </div>
            <div>
              -{currency(resCode?.discount_amount)}
              <PrefixCurrency />
            </div>
          </div>
        )}
        <div className="flex justify-between body-1 mt-3">
          <div className="text-primary-06">Tổng đơn hàng</div>
          <div>
            <div className="h4 text-primary1">
              {currency(priceAfterVoucher)}
              <PrefixCurrency />
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 flex flex-col gap-2 mt-[22px]">
        <button
          onClick={onBuy}
          className={`${isLoading ? "opacity-[0.5] cursor-not-allowed" : "opacity-[1] cursor-pointer"} bg-primary1 rounded-[8px] w-full py-4 text-white text-button`}
        >
          {isLoading ? "Vui lòng đợi ..." : "Thanh toán"}
        </button>
      </div>
    </div>
  );
};
// isLoading
const PrefixCurrency = ({ className = "" }: any) => {
  return <span className={cn("tex-sm text-inherit", className)}>đ</span>;
};

const Input = ({ onSubmit = () => {}, loading }: any) => {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-md flex items-stregth">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Nhập mã khuyến mãi"
        className="placeholder:text-light-04 py-[12px] px-[24px] border border-r-0 rounded-l-md flex-1 text-body-1 md:font-bold bg-white"
        type="text"
      />
      <button
        onClick={() => onSubmit(value)}
        className="py-4 px-6 rounded-r-md flex items-cente border-l-0 justify-center w-[90px] bg-neutral-06 hover:bg-neu3 hover:border-neu3 duration-200 border border-neutral-06 text-light-01 text-button"
      >
        {loading ? "Loading..." : "Nhập"}
      </button>
    </div>
  );
};

export default Card;
