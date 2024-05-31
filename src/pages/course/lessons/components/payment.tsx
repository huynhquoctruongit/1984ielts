import Button from "@/components/ui/button";
import usePayment from "./order-payment/use-payment";

const PaymentScreen = () => {
  const setOpenPayment = usePayment((state: any) => state.setOpenPayment);
  return (
    <div className="w-full p-10">
      <div className="flex flex-col xl:flex-row items-center gap-8 justify-center">
        <img className="w-[20rem] aspect-[320/258]" src="/images/premium-min.png" alt="payment" />
        <div className="flex flex-col items-center">
          <div className="h8 text-light-01 max-w-[20rem] text-center mt-10">Bạn cần phải mua khoá học để có thể truy cập bài học trên</div>
          <Button variant="primary" className="mt-8" onClick={() => setOpenPayment(true)}>
            Mua ngay
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;
