import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { MenuIcon, HomeIcon, DocumentIcon, RightArrowIcon } from "@/components/icons/svg";
import { Link, useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper/modules";
import axiosClient from "@/libs/api/axios-client.ts";
import AxiosController from "@/libs/api/axios-controller.ts";
import useSWR from "swr";
import { useAuth } from "@/hook/auth";
import dayjs from "dayjs";
import { Image } from "@nextui-org/react";
import { Spin } from "antd";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { tabContentVariants } from "@/services/motion";
import { Progress } from "@nextui-org/react";
import Slider from "react-slick";
import { getClassesValid } from "@/services/helper-data";
import { redirectWriting } from "@/services/helper"


const domain = import.meta.env.VITE_CMS;
const Homepage = ({ getLayout }: any) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: classData } = useSWR(
    `/items/class?fields=*,course.*,course.sections.*,students.*,course.sections.parts.quiz.*,banner.*,course.sections.parts.*,parts.*,course.sections.parts.item.*,course.sections.parts.item.type.*&filter[students][directus_users_id][_eq]=$CURRENT_USER&filter[course][center][_eq]=ielts1984&filter[students][payment_status][_eq]=1&filter[students][status][_eq]=1`,
  );

  const { data: answerWorkDone } = useSWR("/items/answer?limit=50&fields=*,quiz.*,section.*,type.*,review.*&sort=-date_created&filter[user_created][id][_eq]=$CURRENT_USER");
  const { data: answerReviewed } = useSWR(
    "/items/answer?limit=50&fields=*,quiz.*,section.*,type.*,review.*&sort=-date_created&filter[user_created][id][_eq]=$CURRENT_USER&filter[status][_eq]=reviewed",
  );
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth >= 768 && screenWidth <= 1024;
  const isDestop = screenWidth >= 1024 && screenWidth <= 1280;
  const isDestopBig = screenWidth >= 1280;

  const userId = profile?.id;

  const [isUnfinished, setUnfinished] = useState(true);
  const [isFinished, setFinished] = useState(true);
  const [isNav, openNav] = useState(true);
  const [active, setActive] = useState("home");
  const [percent, setPercent]: any = useState([]);
  const [homework, setHomework]: any = useState(null);
  const [banners, setBanners]: any = useState(null);
  const [mouseMoved, setMouseMoved] = useState(false);

  const classList = classData?.data?.data;
  const listWorkDone = answerWorkDone?.data?.data;
  const listReviewed = answerReviewed?.data?.data;

  const classListValid = useMemo(() => getClassesValid(classList, userId), [classList]);

  var settings = {
    infinite: false,
    autoplay: true,
    arrows: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const handleClick = (link: any) => {
    if (!mouseMoved) {
      navigate(link);
    }
  };

  useEffect(() => {
    const root: any = document.getElementById("root");
    if (root && root.style && root.style.overflowX && isDestopBig) {
      root.style.overflowX = "hidden";
      root.style.overflowY = "hidden";
    } else {
      root.style.overflowX = "revert";
      root.style.overflowY = "revert";
    }
    return () => {
      if (root && root.style && root.style.overflowX) {
        root.style.overflowX = "auto";
        root.style.overflowY = "auto";
      }
    };
  }, [screenWidth]);
  const handleWindowResize = useCallback((event: any) => {
    setScreenWidth(window.innerWidth);
  }, []);
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);

  useEffect(() => {
    if (isDestop) {
      openNav(false);
    } else if (isDestopBig) {
      openNav(true);
    }
  }, [isDestop]);
  useEffect(() => {
    if (classListValid) {
      const getClassId = classListValid?.map((elm: any) => elm.id);
      axiosClient.get(`/items/banner?filter[class][_in]=${getClassId}`).then((res: any) => {
        setBanners(res?.data?.data);
      });
    }
  }, [classListValid]);

  useEffect(() => {
    if (userId) {
      const link = `/student/statistic/${userId}`;
      const linkStudy = `/student/homework/${userId}`;
      AxiosController.get(link).then((res: any) => {
        if (JSON.stringify(res as any) !== "{}") {
          setPercent(res);
        }
      });
      AxiosController.get(linkStudy).then((res: any) => {
        let needDo: any = [];
        let outDate: any = [];
        if (JSON.stringify(res as any) !== "{}") {
          res?.map((item: any) => {
            item?.out_of_date?.map((elm: any) => {
              elm["class_id"] = item?.class_id;
            });
            outDate.push(item.out_of_date);

            item?.need_to_do?.map((elm: any) => {
              elm["class_id"] = item?.class_id;
            });
            needDo.push(item.need_to_do);

            const needDoList: any = [].concat(...needDo);
            const outDateList: any = [].concat(...outDate);

            needDoList.sort((a: any, b: any) => (dayjs(a?.deadline, "DD/MM/YYYY").isAfter(dayjs(b?.deadline, "DD/MM/YYYY")) ? 1 : -1));
            outDateList.sort((a: any, b: any) => (dayjs(a?.deadline, "DD/MM/YYYY").isBefore(dayjs(b?.deadline, "DD/MM/YYYY")) ? 1 : -1));

            setHomework({
              list1: needDoList,
              list2: outDateList,
            });
          });
        }
      });
    }
  }, [userId]);

  useEffect(() => {
    getLayout(true);
  }, []);

  const getLinkResult = (item: any) => {
    if (item) {
      const getTypeQuiz = item?.type?.title == "Writing Self Practice" ? "writing-self-practice" : item?.type?.title?.toLowerCase();
      const link = `/class/${item?.class}/course/${item?.section?.course}/section/${item?.section?.id}/${getTypeQuiz}/${item?.quiz?.id}`;
      switch (getTypeQuiz) {
        case "reading":
          return link + `?answerId=${item?.id}&type=review`;
          break;
        case "listening":
          return link + `/review?answerId=${item?.id}`;
          break;
        case "writing":
          return redirectWriting(item);
          break;
        case "writing-self-practice":
          return link + `/result/${item?.id}`;
          break;
        case "speaking":
          return link + `/result/${item?.id}`;
          break;
        default:
          break;
      }
    }
  };

  const getType = (id: any) => {
    switch (id) {
      case 1:
        return "reading";
        break;
      case 2:
        return "listening";
        break;
      case 3:
        return "writing";
        break;
      case 4:
        return "speaking";
        break;
      case 5:
        return "writing-self-practice";
        break;
      default:
        break;
    }
  };

  const checkTime = (time: any, classUser: any) => {
    const currentDate: any = dayjs();
    if (time) {
      const joinDate = dayjs(time);
      const endDate = dayjs(classUser?.date_end);
      const plusDay: any = joinDate.add(classUser?.duration, "day");
      const isFutureDate: any = plusDay.isAfter(currentDate) && endDate.isAfter(currentDate) && endDate.isAfter(plusDay);
      return isFutureDate;
    }
  };

  const listHomework = isUnfinished ? homework?.list1 : homework?.list2;
  const getList2 = isFinished ? listReviewed : listWorkDone;

  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  const emptyImg = brand ? "/images/empty-1984.png" : "/images/patato.png";

  if (!classListValid || banners?.length == undefined)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  return (
    <div className="zoomin-content">
      <div className="flex">
        <div
          className={`transition-all p-[20px] lg:h-auto h-[calc(100vh-64px)] relative bg-[#F6F8F9] hidden lg:flex ${isNav ? "lg:w-[15%] w-full" : "lg:flex w-0 lg:w-[1%] nav-opened"
            }`}
        >
          <div
            onClick={() => openNav(!isNav)}
            className="bg-white lg:top-[-24px] top-[20px] right-[20px] lg:right-[-24px] bg-white p-[12px] absolute lg:z-[1111] rounded-full cursor-pointer w-fit box-shadow"
          >
            {isNav ? <RightArrowIcon className="rotate-180" /> : <MenuIcon fill="black" />}
          </div>
          <div className="mt-[63px] w-full">
            {isNav && (
              <div>
                <div className={`whitespace-nowrap transtion-nav cursor-pointer flex items-center px-[24px] py-[8px] mb-[16px] rounded-[80px] body5 bg-primary1 text-white`}>
                  <HomeIcon fill="white" className="w-[20px] h-[20px]" />
                  <p className="ml-[12px]">Trang chủ</p>
                </div>
                <Link to="/student" target="_blank">
                  <div className={`whitespace-nowrap transtion-nav cursor-pointer flex items-center px-[24px] py-[8px] mb-[16px] rounded-[80px] body5`}>
                    <DocumentIcon fill="#B2B7BC" className="w-[20px] h-[20px]" />
                    <p className="ml-[12px] text-[#B2B7BC]">Quá trình học</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
        <div
          className={`transition-all xl:h-[calc(100vh-64px)] ${!isNav ? "w-full lg:w-[calc(100%-40px)]" : "xl:flex lg:w-[85%] w-0 w-full nav-closed"
            } lg:py-[30px] lg:px-[40px] p-[20px] xl:flex`}
        >
          <div className="xl:w-[75%] w-full lg:overflow-y-auto lg:overflow-x-hidden xl:pr-[20px]">
            <div className="w-full rounded-[8px] overflow-hidden">
              <Swiper
                modules={[Autoplay, Navigation, Pagination, Scrollbar, A11y]}
                pagination={true}
                autoplay={{
                  delay: 2500,
                  disableOnInteraction: false,
                }}
                slidesPerView={1}
                navigation={true}
                scrollbar={{ draggable: true }}
              >
                {banners?.length > 0 ? (
                  banners?.map((elm: any) => (
                    <SwiperSlide className="aspect-[800/200] w-full mx-auto">
                      <Image
                        loading="lazy"
                        removeWrapper={true}
                        className="w-full object-cover h-full"
                        height={200}
                        width={120}
                        src={elm?.thumbnail ? domain + "/assets/" + elm?.thumbnail : "/images/banner.png"}
                        alt="Banner"
                      />
                    </SwiperSlide>
                  ))
                ) : (
                  <img src="/images/banner.png" />
                )}
              </Swiper>
            </div>
            <p className="py-[20px] body1">Tiến trình học của tôi</p>
            <div>
              {classListValid?.map((elm: any) => {
                const getDateJoin = elm.students?.find((data) => data.directus_users_id === profile?.id);
                const isStartDate = getDateJoin?.date_join == null ? true : checkTime(getDateJoin?.date_join, elm);
                const flatMap: any = elm.course.sections?.flatMap((item: any) => item?.parts);
                const listLesson: any = flatMap?.filter((item: any) => item?.collection == "lesson");
                const getPercent: any = percent?.find((item: any) => item?.class_id == elm?.id);
                // if (!isStartDate) return;
                return (
                  <div className="flex mb-[20px]">
                    <div className="w-[25%] min-w-[200px] max-w-[200px] hidden lg:flex cursor-pointer" onClick={() => navigate(`/class/${elm.id}`)}>
                      <div className="mx-auto border-[1px] border-gray rounded-[13px] h-full">
                        <Image
                          loading="lazy"
                          removeWrapper={true}
                          className="w-full object-cover h-full rounded-[13px]"
                          src={elm?.thumbnail ? domain + "/assets/" + elm?.thumbnail : "/images/thumb.png"}
                          alt="Thumbnail"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-[85%] lg:ml-[20px] overflow-hidden p-[3px]">
                      <div className="lg:w-[100%] lesson-slider box-shadow rounded-[8px] lg:px-[20px] px-[12px] py-[12px] h-full">
                        <div className="cursor-pointer" onClick={() => navigate(`/class/${elm.id}`)}>
                          <p className="body3">{elm?.title}</p>
                          <p className="mb-[8px] caption mt-[4px]">
                            <span className="mr-[4px]">Ngày bắt đầu:</span>
                            {dayjs(elm?.date_start).format("DD/MM/YYYY")}
                          </p>
                          <div className="flex items-center">
                            <Progress size="sm" aria-label="Loading..." color="warning" value={getPercent?.percentage} className="w-full my-[10px]" />
                            <p className="ml-[12px] text-primary1">{getPercent?.percentage || 0}%</p>
                          </div>
                        </div>
                        <Slider {...settings}>
                          {listLesson?.slice(0, 10).map((item: any, index: any) => (
                            <div
                              onMouseMove={() => setMouseMoved(true)}
                              onMouseDown={() => setMouseMoved(false)}
                              onMouseUp={() => handleClick(`/class/${elm?.id}/courses/section/${item?.section_id}/lesson/${item?.item?.id}`)}
                              className="m-auto px-[5px] cursor-pointer"
                              key={item?.id}
                            >
                              <div className="aspect-[3/2] mx-auto overflow-hidden border-[1px] border-[#e7e5e1] rounded-[4px]">
                                <Image
                                  loading="lazy"
                                  removeWrapper={true}
                                  className="rounded-[4px] object-cover w-full h-full"
                                  height={60}
                                  width={90}
                                  src={item?.item?.thumbnail ? domain + "/assets/" + item?.item?.thumbnail : "/images/thumb-source.png"}
                                  alt="Thumbnail"
                                />
                              </div>
                              <p className="caption mt-[4px] line-clamp-2">{item?.item?.title}</p>
                            </div>
                          ))}
                        </Slider>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full xl:w-[25%] lg:mt-[0] mt-[50px] xl:pl-[10px]">
            <div className="xl:h-[45%] h-[400px]">
              <div className="flex items-start 2xl:items-center justify-between mb-[10px]">
                <p className="body3 text-[18px] font-bold ml-[10px] mr-[3px]">Bài tập cần làm</p>
                <div className="flex bg-neu5 p-[3px] rounded-[4px]">
                  <div
                    className={`whitespace-nowrap cursor-pointer mr-[4px] rounded-[4px] px-[12px] body5 flex items-center ${isUnfinished ? "bg-primary1 text-white" : "bg-white"}`}
                    onClick={() => setUnfinished(!isUnfinished)}
                  >
                    Chưa làm
                  </div>
                  <div
                    className={`whitespace-nowrap cursor-pointer rounded-[4px] px-[12px] body5 flex items-center ${!isUnfinished ? "bg-primary1 text-white" : "bg-white"}`}
                    onClick={() => setUnfinished(!isUnfinished)}
                  >
                    Quá hạn
                  </div>
                </div>
              </div>
              <div className="h-[92%] overflow-scroll overflow-x-hidden mt-[12px] overflow-scroll pl-[10px] pt-[10px] pr-[10px] lg:pr-[20px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isUnfinished ? "animation" : "empty"}
                    variants={tabContentVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    className="h-full"
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    {listHomework?.length > 0 ? (
                      listHomework.map((item: any, index: any) => {
                        const { class_id, section_id, quiz_id, course_id, quiz_type, quiz_name, section_name, deadline }: any = item;
                        const type = getType(quiz_type);
                        const link = `/class/${class_id}/courses/section/${section_id}/quiz/${type}/${quiz_id}`;
                        return (
                          <Link key={index} to={isUnfinished ? link : ""}>
                            <div className="mb-[8px] rounded-[8px] px-[16px] py-[12px] bg-white box-shadow">
                              <p className="body3 lg:text-[16px] font-bold">{quiz_name}</p>
                              <p className="mt-[4px] lg:headline5 body5">
                                {section_name} / {quiz_name}
                              </p>
                              <p className="mt-[4px] body5 px-[10px] w-fit rounded-[4px] bg-[rgba(249,157,28,0.20)]">Hạn nộp : {deadline}</p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div>
                          <img src={emptyImg} className="w-[100px] m-auto mb-[20px]" />
                          <p className="body3">Yay! Bạn đã làm hết bài tập rồi!</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="my-[24px] bg-neu3 h-[1px] w-[95%] text-center mx-auto flex items-center justify-center"></div>
            <div className="lg:h-[50%] h-[400px]">
              <div className="flex items-start 2xl:items-center justify-between mb-[10px]">
                <p className="body3 font-bold ml-[10px] text-[18px]">Bài tập đã làm</p>
                <div className="flex bg-neu5 p-[3px] rounded-[4px]">
                  <div
                    className={`whitespace-nowrap cursor-pointer mr-[4px] rounded-[4px] px-[12px] body5 flex items-center ${isFinished ? "bg-primary1 text-white" : "bg-white"}`}
                    onClick={() => setFinished(!isFinished)}
                  >
                    Đã chấm
                  </div>
                  <div
                    className={`whitespace-nowrap cursor-pointer rounded-[4px] px-[12px] body5 flex items-center ${!isFinished ? "bg-primary1 text-white" : "bg-white"}`}
                    onClick={() => setFinished(!isFinished)}
                  >
                    Đã làm
                  </div>
                </div>
              </div>
              <div className="h-[90%] overflow-scroll overflow-x-hidden mt-[12px] pl-[10px] pt-[10px] pr-[20px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isFinished ? "animation-tabs" : "empty-tabs"}
                    variants={tabContentVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    {getList2?.length > 0 ? (
                      getList2?.map((item: any) => {
                        const link: any = getLinkResult(item);
                        return (
                          <Link target="_blank" to={link}>
                            <div className="mb-[8px] rounded-[8px] px-[16px] py-[12px] bg-white box-shadow">
                              <p className="body3 lg:text-[16px] font-bold">{item?.quiz?.title}</p>
                              <p className="mt-[4px] lg:headline5 body5">
                                {item?.section?.title} / {item?.quiz?.title}
                              </p>
                              <p className="mt-[4px] body5 px-[10px] w-fit rounded-[4px] bg-[rgba(249,157,28,0.20)]">Ngày nộp : {dayjs(item?.date_created).format("DD/MM/YYYY")}</p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div>
                          <img src={emptyImg} className="w-[100px] m-auto mb-[20px]" />
                          <p className="body3">Không có bài nào</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Homepage;
