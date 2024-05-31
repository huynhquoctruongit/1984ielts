import { CloseIcon, SectionsIcon, TimelineIcon } from "@/components/icons/index";
import Card from "./card";
import { cn, currency } from "@/lib/utils";
import useSWR from "swr";
import { fullName } from "@/services/helper";
import usePayment from "./use-payment";
import { ChevronLeftIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const PrefixCurrency = ({ className = "" }: any) => {
  return <span className={cn("tex-sm text-inherit", className)}>đ</span>;
};
const variants = {
  init: { opacity: 0, y: 100 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 100 },
};
const OrderPayment = ({ classUser, className = "" }: any) => {
  const domain = import.meta.env.VITE_CMS;
  const { price, original_price, title, thumbnail, course } = classUser;
  const isOpen = usePayment((state: any) => state.isOpen);
  const setOpenPayment = usePayment((state: any) => state.setOpenPayment);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div variants={variants} animate={"animate"} exit="exit" initial={"init"} className={className}>
          <div className="bg-white cursor-pointer h-10 items-center xl:flex justify-center border-t pt-6 hidden " onClick={() => setOpenPayment(false)}>
            <ChevronLeftIcon className="-rotate-90 w-5 h-5" />
          </div>
          <div className="xl:flex bg-white rounded-md py-4">
            <div className="w-full xl:p-[20px] h-full xl:border-r-1 border-neu4 ">
              <div className="flex items-center px-5 xl:px-0">
                <p className="h8 xl:h5 xl:mt-[12px]">{"Khóa học hiện tại"}</p>
                <X onClick={() => setOpenPayment(false)} className="w-5 h-5 fill-light-02/60 ml-auto xl:hidden" />
              </div>
              <div className="border-b-1 border-neutral-06 my-[20px]"></div>
              <div className="px-5 xl:px-0">
                <div className="flex justify-between items-center">
                  <div className="xl:flex items-center justify-center">
                    <div className="aspect-auto w-[140px] h-[90px] mr-[20px] object-cover rounded-[4px] xl:mb-0 mb-[12px]">
                      {thumbnail ? (
                        <img src={domain + "/assets/" + thumbnail} className="h-full w-full rounded-[4px] object-cover"></img>
                      ) : (
                        <img className="h-full w-full rounded-[4px] object-cover" src="/images/imglogo.jpeg"></img>
                      )}
                    </div>
                    <div>
                      <p className="h6">{title}</p>
                      {/* {detailClass?.teacher?.length > 0
                        ? detailClass?.teacher?.map((elm, index) => (
                            <>
                              <span>by </span>
                              <span className="underline">{fullName(elm?.directus_profile)}</span>
                              {detailClass?.teacher?.length - 1 !== index && <span className="underline">, </span>}
                            </>
                          ))
                        : ""} */}
                      <div className="flex items-center mt-[8px] gap-[8px]">
                        <div className="bg-[#007AFF1A] rounded-[20px] px-[8px] py-[8px] caption flex items-center text-[#007AFF]">
                          <SectionsIcon className="mr-[4px]" fill="#007AFF" /> {course?.sections?.length || 0} <span className="text-teritary-06 ml-[4px]">học phần</span>
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
            <div className="mt-5 xl:mt-0">
              <Card infoPayment={classUser} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
export default OrderPayment;
