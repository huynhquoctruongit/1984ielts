import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import useClass from "./helper/use-class";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import SearchModal from "./search";
import { useEffect, useRef } from "react";
import { renderImageById } from "@/services/helper";
import ButtonEntranceTest from "@/pages/course/section/components/entrance-test";

export const Progress = ({ value = 10 }) => {
  return (
    <div className="h-2 overflow-hidden bg w-full bg-neutral-06 rounded-full relative">
      <motion.div style={{ left: value - 100 + "%" }} className="absolute top-0 w-full h-full rounded-xl bg-primary-01"></motion.div>
    </div>
  );
};

const Circle = ({ value = 20, className = "" }) => {
  if (value === 0) return null;
  return (
    <svg width={23} height={23} viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <motion.rect x="4" initial={{ pathLength: 0 }} animate={{ pathLength: value / 100 }} y="4" width={23} height={23} rx="11.5" strokeWidth={7} className="duration-1000" />
    </svg>
  );
};

const Sketon = () => {
  return (
    <div>
      <div className="h-full w-3/12 md:w-[374px]">
        <div className="w-full  border-x border-neutral-06 bg-white h-[calc(100vh-72px)] overflow-hidden">
          <div className="p-10 px-5">
            <div className="w-full md:w-[170px] aspect-[172/119] animate-purple bg-slate-50 rounded-md" />
            <div className="h6 text-primary-09 mt-4 h-6 animate-purple bg-slate-50 rounded-md"></div>
            <div className="mt-2 flex items-center gap-3 animate-purple h-5 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
            <div className="mt-4 flex items-center gap-3 animate-purple h-16 bg-slate-50 rounded-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SideSection = (props: any) => {
  const params = useParams()["*"].split("/");
  const classId = params[1];
  const navigate = useNavigate();
  const [query, _] = useSearchParams();
  const { cls, isLoading, menus, current, statistic } = useClass(classId);
  const sectionId = query.get("section") || params[4];
  const ref = useRef(null);

  const total = statistic.reduce((count, item) => count + item.total, 0);
  const done = statistic.reduce((count, item) => count + item.processCount, 0);
  const percentage = Math.floor((done / total) * 100);

  useEffect(() => {
    const element = document.getElementById("menu" + sectionId);
    if (!element) return;
    ref.current.scrollTo({
      top: Math.floor(element.offsetTop - 100),
      behavior: "smooth",
    });
  }, [params]);
  if (!isLoading && !cls) return null;
  if (isLoading) return <Sketon />;

  return (
    <div className="h-[calc(100vh-72px)] ">
      <div className="h-full overflow-auto w-3/12 md:w-[374px]">
        <div ref={ref} className="top-0 sticky left-0 border-x border-neutral-06 bg-white h-[calc(100vh-72px)] py-10 overflow-y-scroll scrollbar-hidden">
          <div>
            <div className="px-5">
              {cls.thumbnail && (
                <div className="w-full md:w-[170px]">
                  <img className="w-full object-cover" src={renderImageById(cls.thumbnail)} alt="" />
                </div>
              )}
              <div className="h6 text-primary-09 mt-4">{cls.title}</div>
              <div className="mt-2 flex items-center gap-3">
                <Progress value={percentage} />
                <div className="w-fit text-pastel-01 body-1">{percentage}%</div>
              </div>
            </div>
            <div className="h-[1px] w-full bg-[#E5E5EA] my-6"></div>
            <div className="px-5">
              <SearchModal />
              <div className="h8 text-light-00">Chương trình học</div>
              {/* <div className="mt-1 text-teritary-06 caption-2 rounded-full bg-teritary-06/10 w-fit py-1 px-2">Hoàn thành: 1/4 tuần</div> */}
              <div className="flex flex-col mt-4">
                {menus.map((menu, index) => {
                  const activeMenu = menu.id == current.section?.id;
                  const statistic = menu.statistic || {};
                  return (
                    <div
                      id={"menu" + menu.id}
                      key={menu.id}
                      onClick={() => {
                        navigate("/class/" + classId + "?section=" + menu.id);
                      }}
                      className={cn("w-full rounded-xl p-4 pl-8 flex items-center group duration-200 cursor-pointer hover:bg-primary-01/5", {
                        "bg-background-01 hover:bg-background-01": activeMenu,
                      })}
                    >
                      <div>
                        <ProgressItem percentage={statistic.percentage || 0} />
                      </div>
                      <div className={cn("ml-2 h9 text-light-01 ")}>{menu.title}</div>
                    </div>
                  );
                })}
              </div>
              <ButtonEntranceTest classUser={cls} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProgressItem = ({ percentage }) => {
  if (percentage === 100) return <CheckCircleIcon className="w-6 h-6 text-pastel-09" />;
  if (percentage > 0)
    return (
      <div className="relative w-6 h-6">
        <Circle
          value={100}
          className={cn("absolute w-full h-full stroke-[#57CD96]/10", {
            "stroke-[#57CD96]/10": percentage > 0,
          })}
        />
        <Circle value={percentage || 0} className="absolute w-full h-full top-0 stroke-teritary-03" />
      </div>
    );
  if (percentage === 0 || !percentage) return <div className="w-[24px] h-[24px] rounded-full border border-[#57CD96]"></div>;
};

export default SideSection;
