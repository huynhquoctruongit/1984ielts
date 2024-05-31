import { useEffect, useState, useRef } from "react";
import { RightArrowIcon, ExamIcon, LockIcon, BookMenuIcon, OpenBookMenuIcon, WebinarIcon, HeadphoneIcon, MicroMenuIcon, StudyIcon } from "@/components/icons/index";
import axiosClient, { fetcherClient } from "@/libs/api/axios-client.ts";
import AxiosController from "@/libs/api/axios-controller.ts";
import useSWR from "swr";
import { useAuth } from "@/hook/auth";
import dayjs from "dayjs";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { Progress, Accordion, AccordionItem, Skeleton } from "@nextui-org/react";
import { Spin } from "antd";
import ButtonEntranceTest from "../../../pages/course/section/components/entrance-test";

const Menu = ({ className, openNav }: any) => {
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [parentTab, setParentTab] = useState({});
  const { profile } = useAuth();

  const { sectionId, type, id } = useParams();
  const url: any = location.pathname;

  const { data: classList } = useSWR(`/items/class?filter[students][directus_users_id][_eq]=$CURRENT_USER`);
  const classCurrent = classList?.data?.data;

  const queryString = location.search;
  const parts = queryString.split("=");
  const classIdParam = parts[1];

  const getClassId = classCurrent?.find((elm: any) => elm.id == classIdParam);

  const checkClass: any = parseInt(url.match(/\d+/), 10) || getClassId?.id;
  
  const classId = checkClass;

  const { data: classData } = useSWR(
    `/items/class/${classId}?fields=*,course.*,course.sections.*,course.sections.parts.*,students.*,parts.*,course.sections.parts.item.*,course.sections.parts.item.type.*&filter[students][directus_users_id][_eq]=$CURRENT_USER`,
  );
  const { data: tracking } = useSWR(`/items/tracking?fields=*&filter[user_created][_eq]=$CURRENT_USER&sort=date_created`);
  const classUser = classData?.data?.data;
  const getDateJoin = classUser?.students?.find((elm) => elm.directus_users_id === profile?.id);

  const course = classUser?.course;
  const section = classUser?.course?.sections;
  const trackingData = tracking?.data?.data;
  const [extendWeek, setExtendWeek]: any = useState(null);
  const [active, setActive]: any = useState(location.pathname);
  const [dataMenu, setDataMenu]: any = useState([]);

  const onExtendWeek = (lock: any, id: any, type: any) => {
    if (!lock && id) {
      if (type === "nav") {
        setExtendWeek({
          ...extendWeek,
          [id]: true,
        });
      } else {
        setExtendWeek({
          ...extendWeek,
          [id]: !extendWeek?.[id],
        });
      }
    }
  };

  const getParentTab = (id: any) => {
    setExtendWeek({
      ...extendWeek,
      [id]: !extendWeek?.[id],
    });
    const partname = document.getElementById(id);
    if (partname) {
      setTimeout(() => {
        partname.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
  };
  useEffect(() => {
    setActive(location.pathname);
    const userId = profile?.id;
    if (classId && userId) {
      const link = `/classroom/statistic/${classId}/${userId}`;
      setTimeout(() => {
        AxiosController.get(link).then((res: any) => {
          if (res) {
            setDataMenu(res);
          }
        });
      }, 1000);
    }
  }, [location.pathname, classId]);

  useEffect(() => {
    const parts = location.pathname.split("/");
    const number = classIdParam || parts[5];
    
    if (number !== undefined) {
      onExtendWeek(false, `week-${number}`, "nav");
    }
    setTimeout(() => {
      const partname = document.getElementsByClassName(location.pathname)[0];
      if (partname) {
        partname.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 200);
  }, [location.pathname, trackingData]);

  useEffect(() => {
    if (location.pathname === "/" && dataMenu?.data?.length > 0) {
      const combinedArray: any = [];

      dataMenu?.data?.forEach((item: any) => {
        combinedArray.push(...item.learned.lesson, ...item.learned.quiz);
      });
      if (trackingData) {
        let sectionList = section?.flatMap((item: any) => item.parts);
        const result = sectionList?.find((item: any) => !combinedArray.includes(item?.item?.id)) || sectionList?.[0];
        if (result) {
          if (result.collection === "lesson") {
            navigate(`/class/${classId}/courses/section/${result?.section_id}/lesson/${result?.item?.id}`);
          } else {
            const getType = result.item.type.title == "Writing Self Practice" ? "writing-self-practice" : result?.item?.type?.title;
            navigate(`/class/${classId}/courses/section/${result?.section_id}/quiz/${getType.toLowerCase()}/${result?.item?.id}`);
          }
        }
      }
    }
  }, [dataMenu, classId]);

  return (
    <div
      className={`px-[20px] lg:px-[20px] lg:bg-[#F6F8F9] overflow-scroll h-[calc(100vh-64px)] py-[15px] ${className}`}
      style={{ boxShadow: "inset -36px 0 40px -32px rgba(0,0,0,.05)" }}
    >
      <div className="">
        <p className="font-bold mt-[20px] body1 text-primary1">{classUser?.title}</p>
        <p className="body3 text-neu1 mt-[12px]">Danh sách bài học</p>
      </div>
      <ListMenu
        classUser={classUser}
        course={course}
        setActive={setActive}
        active={active}
        section={section}
        extendWeek={extendWeek}
        setExtendWeek={setExtendWeek}
        dataMenu={dataMenu}
        openNav={openNav}
        classId={classId}
        getParentTab={getParentTab}
        getDateJoin={getDateJoin}
      />
      {classUser?.is_entrance_test && <ButtonEntranceTest classUser={classUser} />}
    </div>
  );
};

const ListMenu = ({ getDateJoin, getParentTab, openNav, dataMenu, classUser, course, section, setExtendWeek, extendWeek, setActive, active, classId }: any) => {
  const type = ["Reading", "Speaking", "Listening", "Writing"];
  function checkArray(arr: any) {
    if (arr) {
      if (arr.includes(false)) {
        return false;
      } else if (arr.includes(true) && !arr.includes(false)) {
        return true;
      } else {
        return undefined;
      }
    }
  }

  const processing = (percent: any) => {
    if (percent === "active") {
      return <ExamIcon fill="#F99D1C" className="fill-primary1 w-[15px] h-[15px]" />;
    }
    if (percent === 100) {
      return <ExamIcon fill="#23AF6E" className="w-[15px] h-[15px]" />;
    } else {
      return <ExamIcon fill="#B2B7BC" className="w-[15px] h-[15px]" />;
    }
  };
  const Icon = (type: any, status: any) => {
    const isStatus: any = {
      active: "#F99D1C",
      100: "#23AF6E",
      0: "#B2B7BC",
    };
    if (type === "Reading") {
      return <OpenBookMenuIcon fill={isStatus[status]} className={`w-[22px] h-[22px] ${status == "active" && "fill-primary1"}`} />;
    }
    if (type === "Listening") {
      return <HeadphoneIcon fill={isStatus[status]} className={`w-[22px] h-[22px] ${status == "active" && "fill-primary1"}`} />;
    }
    if (type === "Writing") {
      return <BookMenuIcon fill={isStatus[status]} className={`w-[28px] h-[28px] ${status == "active" && "fill-primary1"}`} />;
    }
    if (type === "Speaking") {
      return <MicroMenuIcon fill={isStatus[status]} className={`w-[22px] h-[22px] ${status == "active" && "fill-primary1"}`} />;
    }
    if (type === "writing-self-practice") {
      return <StudyIcon fill={isStatus[status]} className={`w-[22px] h-[22px] ${status == "active" && "fill-primary1"}`} />;
    }
    if (type === "lesson") {
      return <WebinarIcon fill={isStatus[status]} className={`w-[25px] h-[25px] ${status == "active" && "fill-primary1"}`} />;
    }
  };

  const checkTime = (time: any) => {
    const currentDate: any = dayjs();
    const startDay: any = dayjs(classUser?.date_start);
    const newDate: any = startDay.add(time, "day");
    const isFutureDate: any = newDate.isAfter(currentDate);
    const shouldReturnTrue: any = isFutureDate;

    if (time === 0 || !time) {
      return false;
    } else {
      return shouldReturnTrue;
    }
  };

  return (
    <div className="mt-[10px]">
      {section?.map((menuItem: any, index: any) => {
        const isAvailable = checkTime(course?.timestamp?.[index]?.unlock);
        const weekId = `week-${menuItem?.id}`;
        const percent = dataMenu?.data?.filter((elm: any) => elm.sectionId == menuItem.id);
        const percentage = percent?.[0]?.percentage;
        const learnedList = percent?.[0]?.learned;
        let keyActive = extendWeek && Object.keys(extendWeek);
        console.log(keyActive,'keyActive');
        

        if (!keyActive?.[0])
          return (
            <Skeleton className="rounded-lg mb-[20px] mt-[32px] mx-2">
              <div className="h-[79px] rounded-lg bg-default-300"></div>
            </Skeleton>
          );
        return (
          <div id={weekId} className={`tab-menu tab cursor-pointer ${isAvailable && "disable-tab cursor-not-allowed"}`} key={index}>
            <Accordion className="w-full px-0" defaultExpandedKeys={isAvailable ? "" : [keyActive?.[0]]}>
              <AccordionItem
                onClick={() => {
                  getParentTab(weekId);
                }}
                className={weekId}
                key={`week-${menuItem.id}`}
                aria-label="Accordion 1"
                indicator=" "
                startContent={
                  <div className={`w-full p-[12px] rounded-[12px]`} style={{ boxShadow: "0px 2px 10px 0px #0046FB33" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap font-bold text-[18px] overflow-hidden">
                        <span className="body3 text-primary1 whitespace-nowrap truncate">
                          {menuItem.title}
                          <span className="mx-[5px]">:</span>
                        </span>
                        <span className="body5 content-cms" dangerouslySetInnerHTML={{ __html: menuItem.content }}></span>
                      </div>
                      <div className="flex items-center">
                        <RightArrowIcon className={`ease-in-out duration-300 ${extendWeek?.[`week-${menuItem.id}`] ? "rotate-90" : "rotate-0"}`} />
                        <div className={`${percentage == 100 ? "text-green1" : "text-primary1"} ml-[6px] caption`}>{isAvailable ? <LockIcon /> : (percentage || 0) + "%"}</div>
                      </div>
                    </div>
                    <div className="relative w-full bg-neu5 h-[0.25rem] rounded-full mt-[12px]">
                      {isAvailable ? (
                        <div className="absolute bg-primary1 h-[2px] rounded-full w-0"></div>
                      ) : (
                        <Progress size="sm" aria-label="Loading..." color="warning" value={percentage} className="w-full my-[15px]" />
                      )}
                    </div>
                  </div>
                }
              >
                <div className="tab-container">
                  <div id={`week-${menuItem.id}`}>
                    {menuItem.parts?.map((examItem: any, indexExam: any) => {
                      const getType = examItem?.item?.type?.title == "Writing Self Practice" ? "writing-self-practice" : examItem?.item?.type?.title;
                      const quizLink = getType ? `/class/${classId}/courses/section/${examItem?.section_id}/quiz/${getType.toLowerCase()}/${examItem?.item?.id}` : "";
                      const lessonLink = `/class/${classId}/courses/section/${examItem?.section_id}/lesson/${examItem?.item?.id}`;
                      const keyLink = examItem?.collection === "quiz" ? quizLink : lessonLink;
                      const activeLink = active === keyLink;
                      const learned = learnedList?.[examItem?.collection].filter((elm: any) => elm == examItem?.item?.id);
                      const typeIcon = examItem?.collection === "lesson" ? "lesson" : getType;

                      return (
                        examItem.section_id == menuItem.id && (
                          <Link
                            key={keyLink}
                            className={keyLink}
                            onClick={() => {
                              if (!isAvailable) {
                                setActive(keyLink);
                                openNav();
                              }
                            }}
                            to={isAvailable ? "#" : keyLink}
                          >
                            <div
                              key={indexExam}
                              className={`${
                                isAvailable ? "cursor-not-allowed" : "cursor-pointer"
                              } flex items-center justify-between w-full py-[15px] pr-[30px] pl-[12px] text-black hover:bg-[rgba(146,164,183,0.1)] ${
                                activeLink ? "bg-[rgba(146,164,183,0.1)] active-subtab" : ""
                              }`}
                            >
                              <div className="flex items-center w-full">
                                <div className="mr-[12px]">{Icon(typeIcon, activeLink ? "active" : learned?.length > 0 ? 100 : 0)}</div>
                                <p className="body5">{examItem?.item?.title}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      );
                    })}
                  </div>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        );
      })}
    </div>
  );
};
export default Menu;
