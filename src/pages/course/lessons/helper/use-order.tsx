import { useAuth } from "@/hook/auth";
import useSWR from "swr";

const useMyCourse = () => {
  const { isLogin } = useAuth();
  const { data, isLoading } = useSWR(isLogin ? "/v1/e-learning/user/class/payment-status" : null);
  const myClass = data?.data?.data || [];
  const classIsPaid = (id: number) => {
    if (id && myClass && data) {
      return myClass.find((item: any) => item.class_id === Number(id) && item.payment_status === 1) ? true : false;
    } else {
      return null;
    }
  };
  const isJoinClass = (id) => {
    if (id && myClass && data) {
      return myClass.find((item: any) => item.class_id === Number(id)) ? true : false;
    } else {
      return null;
    }
  };
  return { myClass, classIsPaid, isLoading, isJoinClass };
};

export default useMyCourse;
