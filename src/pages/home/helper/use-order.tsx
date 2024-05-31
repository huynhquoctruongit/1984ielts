import { useAuth } from "@/hook/auth";
import { center } from "@/services/config";
import { source } from "@/services/enum";
import useSWR from "swr";

const useMyCourse = () => {
  const { isLogin } = useAuth();
  const { data, isLoading } = useSWR(isLogin ? "/v1/e-learning/user/class/payment-status" : null);
  const myClass = data?.data?.data || [];
  const classIsPaid = (id: number) => {
    if (center === source.ielts1984) return true;
    if (id && myClass && data) {
      return myClass.find((item: any) => item.class_id === Number(id) && item.payment_status === 1) ? true : false;
    } else {
      return null;
    }
  };
  return { myClass, classIsPaid, isLoading };
};

export default useMyCourse;
