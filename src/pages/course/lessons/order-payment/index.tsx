import { HeadphoneIcon, SectionsIcon, TimelineIcon } from "@/components/icons/index";
import { cn, currency, sleep } from "@/lib/utils";
import useSWR from "swr";
import { minutesToHours, fullName } from "@/services/helper";
import Card from "../components/order-payment/card";
const PrefixCurrency = ({ className = "" }: any) => {
  return <span className={cn("tex-sm text-inherit", className)}>đ</span>;
};
const OrderPayment = ({ classUser }) => {
  const domain = import.meta.env.VITE_CMS;
  const { id, price, original_price, title, thumbnail, duration, course } = classUser || {};
  const { data: infoClass } = useSWR(`/v1/e-learning/class/${id}`);
  const detailClass = infoClass?.data?.data;

  return (
    <div className="md:flex md:mx-10 mb-[20px]">
      <div className="w-full p-[20px] h-full border-r-[1px] border-neu4">
        <p className="h5 mt-[12px]">Khoá học hiện tại</p>
        <div className="border-[1px] border-neu4 my-[20px]"></div>
        <div className="">
          <div className="flex justify-between items-center">
            <div className="md:flex items-center justify-center">
              <div className="aspect-auto w-[140px] h-[90px] mr-[20px] object-cover rounded-[4px] md:mb-0 mb-[12px]">
                {thumbnail ? (
                  <img src={domain + "/assets/" + thumbnail} className="h-full w-full rounded-[4px] object-cover"></img>
                ) : (
                  <img className="h-full w-full rounded-[4px] object-cover" src="/images/imglogo.jpeg"></img>
                )}
              </div>
              <div>
                <p className="h6">{detailClass?.title}</p>

                {detailClass?.teacher?.length > 0
                  ? detailClass?.teacher?.map((elm, index) => (
                      <>
                        <span>by </span>
                        <span className="underline">{fullName(elm?.directus_profile)}</span>
                        {detailClass?.teacher?.length - 1 !== index && <span className="underline">, </span>}
                      </>
                    ))
                  : ""}
                <div className="flex items-center mt-[8px] gap-[8px]">
                  {/* <div className="bg-[#FF95001A] border-primary1 border-[1px] rounded-[20px] px-[8px] py-[8px] caption flex items-center"><HeadphoneIcon className="w-[16px] h-[16px]" fill="#FF9500" /> <p className="ml-[4px] text-primary1">Listening</p></div> */}
                  <div className="bg-[#007AFF1A] rounded-[20px] px-[8px] py-[8px] caption flex items-center text-[#007AFF]">
                    <SectionsIcon className="mr-[4px]" fill="#007AFF" /> {course?.sections?.length || 0} <span className="text-teritary-06 ml-[4px]">học phần</span>
                  </div>
                  <div className="bg-[#34C7591A] rounded-[20px] px-[8px] py-[8px] caption text-[#34C759] flex items-center">
                    <TimelineIcon className="mr-[4px]" />
                    <p className="text-teritary-03">{minutesToHours(duration)} tổng thời gian</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="h5 text-primary1">
                {currency(price)}
                <PrefixCurrency />
              </p>
              <p className="text-[#3C3C4399] line-through">
                {currency(original_price)}
                <PrefixCurrency />
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Card infoPayment={classUser} />
      </div>
    </div>
  );
};
export default OrderPayment;
