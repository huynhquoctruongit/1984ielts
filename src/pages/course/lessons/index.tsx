import { RenderIUByMedia } from "@/hook/use-responsive";
import LessonMobile from "./screen/mobile";
import { useParams } from "react-router-dom";
import useClass from "@/components/layouts/menu/helper/use-class";
import useMyCourse from "./helper/use-order";
import useItem from "./helper/use-item";
import PaymentScreen from "./components/payment";
import LessonDeskTop from "./screen/desktop";

const Skeleton = () => {
  return (
    <div className="w-full lg:px-12 px-5">
      <div className="mt-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="h-20 rounded-md w-full bg-slate-100 animate-pulse"></div>
          <div className="h-20 rounded-md w-full bg-slate-100 animate-pulse "></div>
        </div>
        <div className="h-80 rounded-md w-full bg-slate-100 animate-pulse mt-4"></div>
        <div className="h-10 rounded-md w-full bg-slate-100 animate-pulse mt-10"></div>
        <div className="h-10 rounded-md w-full bg-slate-100 animate-pulse mt-2"></div>
        <div className="h-10 rounded-md w-full bg-slate-100 animate-pulse mt-2"></div>
        <div className="h-10 rounded-md w-full bg-slate-100 animate-pulse mt-2"></div>
        <div className="h-10 rounded-md w-full bg-slate-100 animate-pulse mt-2"></div>
      </div>
    </div>
  );
};

const SectionWrap = () => {
  const { type, id, classId, sectionId } = useParams();
  const collection = location.pathname.includes("quiz") ? "quiz" : "lesson";
  const { isLoading: isLoadingMyCourse, classIsPaid }: any = useMyCourse();
  const isPaid = classIsPaid(classId);
  const { listItem, isLoading } = useClass(classId);
  const itemInClass = listItem.find((item) => item.item_id == id && item.section == sectionId && item?.collection == collection);
  const isLock = !itemInClass?.is_allow_trial && !isPaid;
  const { data: result, isLoading: isLoadingItem } = useItem(isLock ? null : id, type);
  const data = result?.data?.data || {};
  const loading = isLoadingMyCourse || isLoading || isLoadingItem;

  return (
    <RenderIUByMedia isLoading={loading} skeleton={<Skeleton />} md={<LessonMobile isLoading={isLoading} isLock={isLock} data={data} />}>
      <div className="flex w-full h-full">
        {isLock && <PaymentScreen />}
        {!isLock && <LessonDeskTop data={data} />}
      </div>
    </RenderIUByMedia>
  );
};

export default SectionWrap;
