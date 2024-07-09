import { HomeIcon, LockIcon, ChevronDown } from "@/components/icons";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";
import { RenderIUByMedia } from "@/hook/use-responsive";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { Progress } from "@/components/layouts/menu/section";
import SketonSection from "../components/sketon";
import SearchModal from "@/components/layouts/menu/search";
import CustomSelect from "../components/select";
import useClass from "@/components/layouts/menu/helper/use-class";
import Button from "@/components/ui/button";
import useMyCourse from "../../lessons/helper/use-order";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import useLearned from "@/components/layouts/menu/helper/use-learned";
import { TypeSkill, EnumCollection, EnumQuizType } from "@/pages/course/helper/enum-icon";
import { renderImageById } from "@/services/helper";


const variant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};
const SectionWrap = () => {
  const params = useParams();
  const { isLoading, cls } = useClass(params.classId);
  const navigate = useNavigate();
  const { isLoading: isLoadingMyCourse }: any = useMyCourse();
  if (isLoading || isLoadingMyCourse) return <SketonSection />;
  if (!isLoading && !cls)
    return (
      <div className="h-screen md:h-[calc(100vh-60px)] w-screen relative top-0 left-1/2 -translate-x-1/2 flex items-center justify-center bg-gradient-to-b from-slate-50 to-primary-01/20">
        <div>
          <div className="flex justify-center">
            <img className="w-64" src="/images/not-exist.png" alt="" />
          </div>
          <div className="text-2xl font-bold mt-10 text-neutral-02 w-2/3 mx-auto text-center text-slate-800">
            Hiện tại khóa học chưa khả dụng bạn vui lòng chọn khóa học khác nhé
          </div>
          <div className=" flex items-center flex-col">
            <Button onClick={() => navigate("/home")} className="bg-primary-01 text-white mt-10">
              Quay lại
            </Button>
            <Button onClick={() => (location.href = "https://youpass.vn/")} className="flex items-center gap-2 mt-4 hover:bg-slate-50">
              <HomeIcon className="w-4 h-4  fill-black flex justify-center gap-2"></HomeIcon> Quay lại trang chủ
            </Button>
          </div>
        </div>
      </div>
    );

  return (
    <RenderIUByMedia md={<SectionMobile />}>
      <Section />
    </RenderIUByMedia>
  );
};

const Section = () => {
  const params = useParams();
  const { isLoading } = useClass(params.classId);
  if (isLoading) return null;
  else return <SectionContent />;
};

const SectionMobile = () => {
  const params = useParams();
  const navigage = useNavigate();
  const { current, cls, defaultItem, defaultItemNew, listItem } = useClass(params.classId);
  const { section } = current;
  const percentage = current?.statistic?.percentage;
  const collection = location.href.includes("quiz") ? "quiz" : "lesson";
  const itemAcitve = listItem.find((item) => item.item_id == params.id && item.collection == collection);
  return (
    <div className="w-screen h-full top-0 left-0 fixed z-[10000] flex flex-col bg-white">
      <div className="flex items-center py-4 pr-4 bg-white shadow-sm whitespace-nowrap">
        <div className="px-4" onClick={() => navigage("/home")}>
          <XMarkIcon className="w-6 h-6 fill-black" />
        </div>
        <div className="h9">{cls?.title}</div>
      </div>

      <div className="grow relative">
        <div className="absolute w-full h-full top-0 left-0 overflow-y-scroll">
          <div className="mt-5 flex px-5 items-center gap-4">
            <CustomSelect />
            <SearchModal />
          </div>
          <div className="flex items-center px-5 mt-5 gap-4">
            <Progress value={percentage} />
            <span className="text-body1 text-pastel-01 whitespace-nowrap min-w-4">{percentage}% </span>
          </div>
          <div className="pb-5 pt-2 px-5 border-b border-neutral-06">
            <h6 className="h8 text-primary-09">{section?.title}</h6>
            {/* <h6 className="h9 text-primary-00 mt-3">Các dạng biểu đồ cơ bản trong Writing task 1</h6> */}
            {section?.content && <div dangerouslySetInnerHTML={{ __html: section?.content }} className="body-2 mt-3"></div>}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              className="mt-6 flex flex-col gap-5"
              transition={{ duration: 0.2, ease: "easeIn" }}
              variants={variant}
              initial={"hidden"}
              animate="visible"
              exit={"exit"}
              key={current?.section?.id}
            >
              {section?.topics.map((item, index) => (
                <NoName lastTopic={section?.topics[section?.topics?.length - 1]} key={item.id} data={item} section={section} nextLesson={defaultItem} current={current} itemAcitve={itemAcitve} defaultItemNew={defaultItemNew} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SectionContent = () => {
  const [isReadMore, setReadMore]: any = useState(false)
  const params = useParams();
  const { current, defaultItem, defaultItemNew, listItem } = useClass(params.classId);
  const { section } = current;
  const collection = location.href.includes("quiz") ? "quiz" : "lesson";
  const itemAcitve = listItem.find((item) => item.item_id == params.id && item.collection == collection);
  const ref = useRef(null);
  const topic = itemAcitve?.topic;

  useEffect(() => {
    const topicElm = document.getElementById("topic" + topic);
    if (topicElm) {
      ref.current.scrollTo({
        top: topicElm.offsetTop - 100,
        behavior: "smooth",
      });
    }
  }, [topic]);
  useEffect(() => {
    const ElmId = document.getElementById("text-content")
    if (ElmId && ElmId.innerText.length > 150 && isReadMore == false) {
      setReadMore(true)
    } else {
      setReadMore(false)
    }
  }, [section.id])

  return (
    <div ref={ref} className="md:pr-0 md:p-5 lg:p-12  h-[calc(100vh-60px)] w-full overflow-y-scroll scrollbar-hidden mt-6 md:mt-0">
      <div className="border rounded-xl border-neutral-06 xl:w-[692px] pb-10">
        <div id="content" className={`overflow-hidden flex justify-between gap-[20px] border-b-[1px] border-b-neutral-06 p-[20px] min-h-[180px]`}>
          <div className="relative">
            <h6 className="h6 text-primary-09 line-clamp-2">{section?.title} </h6>
            {section?.content && <div className="">
              <div className={`body-2 mt-3 overflow-hidden transition-all ${isReadMore == "collapse" ? "" : "line-clamp-3"}`} id="text-content" dangerouslySetInnerHTML={{ __html: section?.content }}></div>
              {isReadMore !== false && <div className="flex items-center justify-center mt-[12px] cursor-pointer" onClick={() => setReadMore
                (isReadMore == "collapse" ? "see-more" : "collapse")}><p className=" text-center w-fit text-primary1 body-3">{(isReadMore == true || isReadMore == "see-more") ? "Xem thêm" : "Thu gọn"}</p> <ChevronDown className={isReadMore == "collapse" ? "rotate-180" : "rotate-0"} /></div>}
            </div>}
          </div>
          {section?.thumbnail && <div className="object-cover contents h-[150px]"><img width="266px" height="150px" className="h-[150px] object-cover ml-auto aspect-[266/150] rounded-[4px]" src={renderImageById(section?.thumbnail)}></img></div>}
        </div>
        <div className="flex flex-col gap-8 md:px-4 py-[24px]">
          {section?.topics?.map((item) => (
            <NoName lastTopic={section?.topics[section?.topics?.length - 1]} key={item.id} data={item} section={section} nextLesson={defaultItem} current={current} itemAcitve={itemAcitve} defaultItemNew={defaultItemNew} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const NoName = ({ lastTopic, section, data, nextLesson, itemAcitve, defaultItemNew }: any) => {
  // const [active, setActive] = useState(data.id === nextLesson?.topic || itemAcitve?.topic == data.id);
  const [active, setActive] = useState(true);
  const params = useParams();
  const { classIsPaid }: any = useMyCourse();
  const isPaid = classIsPaid(params.classId);
  const { listItem, current } = useClass(params.classId);

  const listTopic = listItem.filter((item) => item.topic == data.id && current?.section?.id == item.section);
  const leared = listTopic.filter((item) => item.learned).length;
  const total = listTopic.length;

  useEffect(() => {
    if (active === false && itemAcitve?.topic == data.id) setActive(true);
  }, [itemAcitve]);

  return (
    <div className="border-b border-neutral-06 md:border-none pb-4 md:pb-0">
      <div className={"px-5"}>
        <div className="flex items-center cursor-pointer" onClick={() => setActive(!active)}>
          <div className="mr-4 hidden md:block">
            <ChevronLeftIcon
              className={cn("w-4 h-4 duration-200 -rotate-90", {
                "rotate-90": active,
              })}
            />
          </div>
          <div>
            <div className="h8 text-light-00">{data.title}</div>
            <div className="mt-2 text-teritary-06 caption-2 rounded-full bg-teritary-06/10 w-fit py-1 px-2">
              Hoàn thành: {leared} / {total} bài
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="overflow-hidden"
        initial={{ height: active ? "auto" : 0, opacity: active ? 1 : 0.5 }}
        animate={{ height: active ? "auto" : 0, opacity: active ? 1 : 0.5 }}
      >
        <div className="px-5 overflow-hidden flex flex-col gap-3 md:gap-0">
          {data.parts?.length > 0 && <div className="h-4"></div>}
          {(data.parts || []).map((item) => (
            <NavItem lastTopic={lastTopic} key={item.id} parts={data.parts} sectionId={data.section_id} section={section} data={item} isPaid={isPaid} nextLesson={nextLesson} defaultItemNew={defaultItemNew} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const NavItem = ({ lastTopic, section, parts, data, sectionId, isPaid, nextLesson, defaultItemNew }: any) => {

  var listLearned = section && { quiz: section?.statistic?.learned?.quiz, lesson: section?.statistic?.learned?.lesson }
  const reverseParts = [...parts]?.reverse()
  let idLastLearned = null
  const listAfter = reverseParts.map(item => {
    const objSearch = listLearned && listLearned[item?.collection]
    return { ...item, learned: objSearch?.find((elm) => elm == item.item_id) }
  })
  listAfter?.map((elm) => {
    if (elm.item_id == lastTopic?.parts[lastTopic?.parts?.length - 1]?.item_id && elm.collection == lastTopic?.parts[lastTopic?.parts?.length - 1]?.collection && elm.learned) {
      return idLastLearned = elm.item_id
    }
  })
  const list = listAfter.find((elm) => elm.learned)
  const findIndex = parts.findIndex((elm) => elm.item_id == list?.item_id && elm.collection == list.collection)
  const navigate: any = useNavigate();
  const itemType = data.collection === "quiz" ? data.quiz_type : data.type;
  const mapContent = EnumCollection[data.collection + "-" + (itemType || 0)] || {};
  const mapQuizType = EnumQuizType[data.collection][itemType]

  const params = useParams();
  const { findLearned } = useLearned(params.classId);
  const learned = findLearned(sectionId, data.collection, data.item_id);

  const onClick = () => {
    if (data.collection === "quiz") navigate(`/class/${params.classId}/courses/section/${sectionId}/${data.collection}/${TypeSkill[data.type]}/${data.item_id}`);
    if (data.collection === "lesson") navigate(`/class/${params.classId}/courses/section/${sectionId}/${data.collection}/${data.item_id}`);
  };
  const valid = isPaid || (!isPaid && data.is_allow_trial === true);
  const time = data?.time || 0;

  const hour = Math.floor(time / 60);
  const minute = time % 60;
  const isDetailPage = location.href.includes("quiz") || location.href.includes("lesson");
  const collection = location.href.includes("quiz") ? "quiz" : "lesson";
  const active = params.id == data.item_id && data.collection === collection;

  const activeData = findIndex !== -1 ? parts[findIndex + 1] : (defaultItemNew || nextLesson)

  const isStart = section?.statistic?.percentage == 0
  const isActive = idLastLearned ? (data?.item_id == idLastLearned) : (activeData?.id === data?.id && activeData?.collection === data?.collection)
  return (
    <div
      onClick={onClick}
      id={"item" + data.collection + data.item_id}
      className={cn("flex relative items-center py-4 border md:border-none px-4 md:pl-8 hover:bg-slate-100 rounded-xl cursor-pointer group duration-200", {
        "opacity-60": !valid,
        "bg-background-01": active,
      })}
    >
      <div>
        <div
          className={cn("w-[23px] h-[23px] rounded-full flex items-center justify-center relative", {
            "rounded-md border-dashed border border-black": !valid,
            "border border-black": valid && !learned,
          })}
        >
          {valid ? learned ? <CheckCircleIcon className="w-6 h-6 text-pastel-09 absolute top-0 left-0 " /> : mapContent.icon : <LockIcon className="w-3" />}
        </div>
      </div>
      <div className="ml-2.5">
        <div className="h9 group-hover:text-light-00 text-light-00">
          <b>{mapQuizType}</b>: <span className="font-medium">{data.title}</span>
        </div>
        <div className="flex items-center gap-2 text-light-02 caption-2 flex-wrap">
          <span>
            {hour !== 0 && hour + " giờ "}
            {minute !== 0 && minute + " phút"}
          </span>
        </div>
      </div>
      {!isDetailPage && isActive && valid && (
        <>
          <div className="rounded-full hidden md:block px-4 py-2 bg-primary-01 button text-center ml-auto text-white whitespace-nowrap">{isStart ? "Bắt đầu học" : "Tiếp tục học"}</div>
          <div className="md:hidden absolute top-1.5 right-1.5">
            <div className="w-3 h-3 rounded-full bg-primary-01"></div>
          </div>
        </>
      )}
    </div>
  );
};

export const SideBarDetailSection = () => {
  const { classId, id } = useParams();
  const collection = location.href.includes("quiz") ? "quiz" : "lesson";
  const { current, cls, isLoading, listItem, defaultItemNew } = useClass(classId);
  const section = current.section;
  const percentage = section?.statistic?.percentage;
  const itemAcitve = listItem.find((item) => item.item_id == id && item.collection == collection);
  const ref = useRef(null);
  useEffect(() => {
    if (!itemAcitve) return;
    setTimeout(() => {
      const topicElm = document.getElementById("item" + collection + itemAcitve.item_id);
      if (topicElm) {
        ref.current.scrollTo({
          top: topicElm.offsetTop - 100,
          behavior: "smooth",
        });
      }
    }, 100);
  }, [itemAcitve]);

  if (isLoading)
    return (
      <div>
        <div className="h-full overflow-auto w-[250px] md:[305px] lg:w-[384px] flex flex-col gap-4 border-r-1 px-4 py-20">
          <div className="h-32 rounded-md bg-slate-50 animate-pulse w-full"></div>
          <div className="h-16 rounded-md bg-slate-50 animate-pulse w-full"></div>
          <div className="h-16 rounded-md bg-slate-50 animate-pulse w-full"></div>
          <div className="h-16 rounded-md bg-slate-50 animate-pulse w-full"></div>
          <div className="h-16 rounded-md bg-slate-50 animate-pulse w-full"></div>
          <div className="h-16 rounded-md bg-slate-50 animate-pulse w-full"></div>
        </div>
      </div>
    );

  return (
    <div className="">
      <div className="h-full overflow-auto w-[250px] md:[305px] lg:w-[384px]">
        <div ref={ref} className="top-0 sticky left-0 border-x border-neutral-06 bg-white h-[calc(100vh-60px)] py-10 overflow-y-scroll scrollbar-hidden">
          <div>
            <div className="px-5">
              <div className="flex items-center mt-4 gap-3">
                <div>
                  <Link
                    to={`/class/${classId}`}
                    className="min-w-6 w-6 h-6 hover:bg-slate-100 duration-200 shadow-lg rounded-full flex items-center justify-center cursor-pointer hover:shadow-xl"
                  >
                    <ChevronLeft className="w-3 h-3 m-auto text-light-01" />
                  </Link>
                </div>
                <div className="h6 text-primary-09">{cls.title}</div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={percentage || 0} />
                <div className="w-fit text-pastel-01 body-1">{percentage || 0}%</div>
              </div>
            </div>
            <div className="h-[1px] w-full bg-[#E5E5EA] my-6"></div>
            <div className="px-5">
              <SearchModal />
              <div className="gap-8 flex flex-col  -mx-5">
                {(section?.topics || []).map((item, index) => (
                  <NoName lastTopic={section?.topics[section?.topics?.length - 1]} key={item.id} data={item} listData={section?.topics} itemAcitve={itemAcitve} current={current} defaultItemNew={defaultItemNew} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionWrap;