import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { SideBarDetailSection } from "../section/screen";
import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Arrow_CaretRightIcon, ArrowRight01SharpIcon, Home06Icon } from "@/components/icons";
import useRedirectLesson from "@/components/layouts/menu/helper/use-arrow";
import useClass from "@/components/layouts/menu/helper/use-class";
import Button from "@/components/ui/button";
import useItem from "./helper/use-item";
import useResponsive from "@/hook/use-responsive";
import OrderPayment from "./components/order-payment";
import { TypeSkill } from "@/services/enum";

const LayoutCourse = memo(() => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };
  const pathname = useLocation().pathname;
  const { isMd } = useResponsive();
  const { classId } = useParams();
  const { cls } = useClass(classId);

  return (
    <div className="flex items-stretch container-full fixed lg:static top-0 left-0 z-[10000]">
      {!isMd && <SideBarDetailSection />}
      <div className="w-full">
        <div className="flex flex-col relative h-screen-mobile lg:h-full">
          <Breadcumb />
          <AnimatePresence>
            <motion.div
              key={pathname}
              className="grow w-screen lg:w-full h-full"
              // transition={{ duration: 0.05 }}
              // variants={variants}
              // exit={"hidden"}
              // animate={"visible"}
              // initial="hidden"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
          {isMd && <Navigation />}
          {cls && <OrderPayment classUser={cls} className="absolute bottom-0 w-full border-t-2 z-10" />}
        </div>
      </div>
    </div>
  );
});
const MemoLayoutCourse = () => {
  const menu = useMemo(() => <LayoutCourse />, []);
  return menu;
};

const Navigation = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [freeze, setFreeze] = useState(false);
  const { getLessonNext, getLessonPrev, isEnd, isStart } = useRedirectLesson(params.classId);
  const onRedirect = (redirect) => {
    const nextItem: any = redirect === "next" ? getLessonNext() : getLessonPrev();
    if (nextItem?.isFinish || freeze) return;
    setFreeze(true);
    const type = TypeSkill[nextItem.type]?.toLowerCase();
    const urlLesson = `/class/${params.classId}/courses/section/${nextItem.section}/lesson/${nextItem.itemId}`;
    const urlQuiz = `/class/${params.classId}/courses/section/${nextItem.section}/quiz/${type}/${nextItem.itemId}`;
    const url = nextItem.collection === "lesson" ? urlLesson : urlQuiz;
    navigate(url);
    setTimeout(() => {
      setFreeze(false);
    }, 600);
  };

  return (
    <div className="bg-white w-full shadow-2xl relative z-10 py-3 px-1">
      <div className="flex justify-between">
        <Button disbaled={isStart || freeze} onClick={() => onRedirect("prev")} className="rounded-full px-3 py-1.5 bg-slate-50/80 active:bg-primary-01/10">
          <ArrowRight01SharpIcon className="h-6 w-6 stroke-primary1 " />
          <p className="h9 text-primary1 pt-[1px] whitespace-nowrap">Bài trước</p>
        </Button>
        <Button disbaled={isEnd || freeze} onClick={() => onRedirect("next")} className="rounded-full px-3 py-1.5 bg-slate-50/80 active:bg-primary-01/10">
          <p className=" h9 text-primary1 pt-[1px] whitespace-nowrap">Bài tiếp theo</p>
          <ArrowRight01SharpIcon className="h-6 w-6 stroke-primary1 rotate-180" />
        </Button>
      </div>
    </div>
  );
};

const Breadcumb = () => {
  const { classId, id, type } = useParams();
  const { data: res } = useItem(id, type);
  const data = res?.data?.data;
  const navigate = useNavigate();
  const { current } = useClass(classId);
  const { isEnd, isStart, onRedirect } = useRedirectLesson(classId);

  return (
    <div className="sticky hidden top-0 left-0 z-10 bg-white lg:flex lg:flex-row flex-col px-6 lg:px-10 py-4 lg:py-4 items-center">
      <div className="flex items-center relative w-full h-full">
        <div className="cursor-pointer" onClick={() => navigate("/home")}>
          <Home06Icon className="h-6 w-6 stroke-light-02/60 stroke-[2px] duration-200 hover:stroke-primary-01" />
        </div>
        <div>
          <Arrow_CaretRightIcon className="h-6 w-6 stroke-light-02/60" />
        </div>
        <p
          onClick={() => navigate(`/class/${classId}?section=` + current?.section?.id)}
          className="body02 text-light-02/60 whitespace-nowrap truncate duration-200 hover:text-primary-01 cursor-pointer max-w-[300px]"
        >
          {current?.section?.title}
        </p>
        <div>
          <Arrow_CaretRightIcon className="h-6 w-6 stroke-light-02/60" />
        </div>
        <p className="body01 text-primary1 line-clamp-1 max-w-[300px]"> {data?.title}</p>
      </div>
      <div className="lg:ml-auto flex lg:pt-0 gap-x-2 pt-4 pl-4">
        <Button
          disbaled={isStart}
          onClick={() => onRedirect("prev")}
          className="xl:!h-10  !h-8 flex gap-1 items-center xl:!pl-3 xl:!pr-6 !px-2 hover:bg-[#3c3c430d] group duration-300"
        >
          <ArrowRight01SharpIcon className="h-6 w-6 stroke-primary1 " />
          <p className=" h9 text-primary1 pt-[1px] whitespace-nowrap">Bài trước</p>
        </Button>
        <Button
          disbaled={isEnd}
          onClick={() => onRedirect("next")}
          className="xl:!h-10 !h-8  flex gap-1 items-center xl:!pr-3 xl:!pl-6 !px-2 hover:bg-[#3c3c430d] group duration-300"
        >
          <p className=" h9 text-primary1 pt-[1px] whitespace-nowrap">Bài tiếp theo</p>
          <ArrowRight01SharpIcon className="h-6 w-6 stroke-primary1 rotate-180" />
        </Button>
      </div>
    </div>
  );
};

export default MemoLayoutCourse;
