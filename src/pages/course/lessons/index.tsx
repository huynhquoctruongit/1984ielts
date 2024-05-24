import { CheckedIcon, FileAttachIcon, RightArrowIcon } from "@/components/icons/index";
import { Link, useParams, useNavigate } from "react-router-dom";
import * as amplitude from "@amplitude/analytics-browser";
import { useEffect, useState } from "react";
import axiosClient from "@/libs/api/axios-client.ts";
import Vimeo from "@u-wave/react-vimeo";
import AxiosController from "@/libs/api/axios-controller.ts";
import useSWR from "swr";
import dayjs from "dayjs";
import NextLesson from "@/components/layouts/modal/next-lesson/index";
import Locked from "@/components/layouts/modal/locked/index";
import Modal from "@/components/layouts/modal/template";
import WistiaPlayer from "@/components/system/wistia";
import { useAuth } from "@/hook/auth";
import { Spin } from "antd";
import Comment from "./comment";
import { amplitudeSendTrack } from "@/services/amplitude";
import ContentBlock from "./content-block"

const domain = import.meta.env.VITE_CMS;
const Lesson = ({ getLayout, openNav }: any) => {
  const { classId, sectionId, type, id } = useParams();

  const { data: classList } = useSWR(`/items/class?filter[students][directus_users_id][_eq]=$CURRENT_USER`);
  const classCurrent = classList?.data?.data;
  const getClassId = classCurrent?.map((elm: any) => elm.id);

  const { data: classData } = useSWR(
    `/items/class/${classId || getClassId?.[0]
    }?fields=*,course.*,course.sections.*,course.sections.parts.*,parts.*,course.sections.parts.item.*,course.sections.parts.item.type.*&filter[students][directus_users_id][_eq]=$CURRENT_USER`,
  );

  const navigate = useNavigate();
  const { profile } = useAuth();

  const [data, setData]: any = useState(null);
  const [isNextLesson, setNextLesson]: any = useState(null);
  const [isLocked, setLocked]: any = useState(false);
  const [indexElm, setIndex]: any = useState(0);
  const [dataMenu, setDataMenu]: any = useState([]);

  const classUser = classData?.data?.data;

  const course = classUser?.course;
  const section = classUser?.course?.sections;

  const userId = profile?.id;
  const listExclude = ["/quiz", "/lesson"];
  const typeCourse = listExclude.find((item) => location.pathname.includes(item));
  let indexLesson = indexElm;

  const learnedList = dataMenu?.find((elm: any) => elm.sectionId == sectionId);
  const lessonLearned = learnedList?.learned.lesson;
  const checkLearned = lessonLearned?.find((elm: any) => elm == id);

  useEffect(() => {
    const link = `/classroom/statistic/${classId}/${userId}`;
    AxiosController.get(link).then((res: any) => {
      setDataMenu(res.data);
    });
    const type = typeCourse.replaceAll("/", "");

    const time = 5 * 60 * 60;
    const timming = setTimeout(() => {
      amplitudeSendTrack(type.toUpperCase() + " Viewed", { user_id: profile.id, type: type, id: id });
    }, time);
    return () => {
      clearTimeout(timming);
    };
  }, [classId]);
  useEffect(() => {
    if (id) {
      let getType = type === "writing-self-practice" ? "Writing Self Practice" : type;
      const quizLink = getType && `/items/quiz/${id}?fields=*,source.*,type.*&filter[type][title]=${getType.charAt(0).toUpperCase() + getType.slice(1)}`;
      const lessonLink = `/items/lesson/${id}?fields=*,documents.*,documents.directus_files_id.*`;
      const link: any = typeCourse == "/lesson" ? lessonLink : quizLink;
      const lessonFile = `/items/lesson_files/${id}?fields=*,directus_files_id.title,directus_files_id.id`;
      axiosClient.get(link).then((res: any) => {
        setData(res?.data?.data || []);
      });
    }
    getLayout(true);
  }, [type, id, classUser]);

  const processing = (percent: any) => {
    if (percent === 100) {
      return (
        <div className="bg-primary1 rounded-full p-[5px]">
          <CheckedIcon fill="white" className="w-[12px] h-[12px]" />
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-full p-[5px] border-[2px] border-neu4">
          <CheckedIcon fill="white" className="w-[12px] h-[12px]" />
        </div>
      );
    }
  };

  const clickNav = (status: any) => {
    let sectionList = section?.flatMap((item: any) => item.parts);
    sectionList?.some((elm: any, index: any) => {
      if (elm?.item?.id == id && "/" + elm?.collection === typeCourse) {
        if (status === "next") {
          indexLesson = index + 1;
          setIndex(indexLesson);
          if (indexLesson < sectionList.length) {
            const lock = section?.filter((menuItem: any, indexItem: any) => {
              if (sectionList[indexLesson]?.section_id == menuItem.id) {
                return checkTime(course?.timestamp?.[indexItem]?.unlock);
              }
            });
            if (lock.length === 0) {
              if (sectionList[indexLesson]?.section_id) {
                if (sectionList[indexLesson]?.collection === "quiz") {
                  navigate(
                    `/class/${classId}/courses/section/${sectionList[indexLesson]?.section_id}/quiz/${sectionList[indexLesson]?.item?.type?.title.toLowerCase()}/${sectionList[indexLesson]?.item?.id
                    }`,
                  );
                } else {
                  navigate(`/class/${classId}/courses/section/${sectionList[indexLesson]?.section_id}/lesson/${sectionList[indexLesson]?.item?.id}`);
                }
              }
            } else {
              setLocked(true);
            }
          }
        } else {
          indexLesson = index - 1;
          setIndex(indexLesson);
          if (sectionList[indexLesson]?.section_id) {
            if (sectionList[indexLesson]?.collection === "quiz") {
              navigate(
                `/class/${classId}/courses/section/${sectionList[indexLesson]?.section_id}/quiz/${sectionList[indexLesson]?.item?.type?.title.toLowerCase()}/${sectionList[indexLesson]?.item?.id
                }`,
              );
            } else {
              navigate(`/class/${classId}/courses/section/${sectionList[indexLesson]?.section_id}/lesson/${sectionList[indexLesson]?.item?.id}`);
            }
          }
        }
        return true;
      }
      return false;
    });
  };
  const onNextLesson = async () => {
    clickNav("next");
    const params = {
      type: "lesson",
      class: classUser?.id,
      lesson: id,
    };
    await axiosClient.post("/items/tracking", params);
  };
  function getIdYoutube(url: any) {
    if (url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return '<iframe width="560" height="515" src="//www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
    }
  }

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
  const dowloadFile = (url: any, fileName: any) => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.blob();
      })
      .then((pdfBlob) => {
        const url = window.URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = fileName.replace(" ", "");
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };
  if (!classCurrent || classCurrent?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  const itemCourse = course?.sections.findIndex((elm: any, index: any) => elm.id == sectionId);
  const isLock = checkTime(course?.timestamp?.[itemCourse]?.unlock);

  if (!data)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );

  return (
    <div className="zoomin-content-low content-exam">
      <Modal open={isNextLesson}>
        <NextLesson
          onSubmit={onNextLesson}
          onClose={() => {
            setNextLesson(false);
          }}
        />
      </Modal>
      <Modal open={isLocked}>
        <Locked
          onClose={() => {
            setLocked(false);
          }}
        />
      </Modal>
      <div className="py-[10px] px-[20px] md:px-[80px] lg:px-[100px] learndash-content-body overflow-scroll h-[calc(100vh-64px)]">
        <div className="md:w-[70%] mx-auto">
          <div onClick={openNav} className="mb-[20px] lg:hidden bg-primary1 text-white w-fit pr-[10px]  pl-[2px] rounded-[4px] flex items-center">
            <RightArrowIcon className="rotate-180" fill="white" />
            <p>Menu</p>
          </div>
          <div className="lg:flex justify-between min-h-[80px]">
            <p className="flex items-center text-primary1 lg:headline1 headline2 lg:mb-0 mb-[20px] lg:min-h-[50px] min-h-[80px]">{data?.title}</p>
            <div className="flex items-center justify-center">
              <div className="flex mt-[8px] body1 cursor-pointer navigate-lesson active:text-neu8 items-center" onClick={() => clickNav("prev")}>
                <RightArrowIcon className="rotate-180 navigate-lesson" />
                <p className="ml-[5px] active:text-neu8 whitespace-nowrap">Quay lại</p>
              </div>
              <div className="bg-neu5 h-[24px] w-[2px] mx-[24px]"></div>
              <div className="flex mt-[8px] body1 cursor-pointer navigate-lesson active:text-neu8 items-center" onClick={() => clickNav("next")}>
                <p className="mr-[5px] whitespace-nowrap">Tiếp theo</p>
                <RightArrowIcon className="navigate-lesson" />
              </div>
            </div>
          </div>
        </div>
        {typeCourse == "/quiz" && <div className="mb-[20px]">
          {id && <div className="bg-neu5 w-full h-[2px] my-[20px]"></div>}
          <div className="flex items-center justify-center body3 text-center">
            <Link
              target={isLock ? "" : "_blank"}
              to={isLock ? "#" : `/class/${classId}/course/${classUser?.course?.id}/section/${sectionId}/${type}/${id}${(type == "speaking" && "?step=instructions") || ""}`}
            >
              <div
                className={`box-shadow px-[12px] py-[8px] mr-[20px] rounded-[10px] w-[200px] ${isLock ? "bg-neu5 text-black cursor-not-allowed" : "bg-primary1 text-white cursor-pointer"
                  }`}
              >
                Bắt đầu làm bài
              </div>
            </Link>
          </div>
        </div>}
        <div className="mt-[10px] content-lesson">
          {data?.video?.includes("youtube") && data?.video && <div className="content-cms" dangerouslySetInnerHTML={{ __html: getIdYoutube(data?.video || "") as any }}></div>}
          {(data?.video_type === "wistia" || !data?.video_type) && data?.video && <WistiaPlayer videoId={data?.video} wrapper={"player-wistia"} />}
          {data?.video_type === "vimeo" && data?.video && <VimeoVideo src={data.video} />}
          <div className="content-cms" dangerouslySetInnerHTML={{ __html: typeCourse == "/lesson" ? data?.content : data?.description }}></div>
          {data?.content_blocks?.map((elm) => (
                <div className="mt-[30px]">
                  <ContentBlock data={elm} />
                </div>
              ))}
          {typeCourse == "/lesson" && (
            <div className="mb-[100px]">
              {data?.documents?.length > 0 && <div className="text-primary1 headline2 my-[20px]">Tài liệu</div>}
              {data?.documents?.map((elm: any) => {
                const getType = elm.directus_files_id.filename_disk.split(".").pop();
                const getSize = (elm.directus_files_id.filesize * 1) / 1024;
                const link = domain + "/assets/" + elm.directus_files_id.filename_disk;
                const fileName = elm.directus_files_id.title + "." + getType.toLowerCase();

                return (
                  <div onClick={() => dowloadFile(link, fileName)}>
                    <div className="cursor-pointer px-[24px] py-[12px] mb-[20px] rounded-[20px] text-neu1 box-shadow flex items-center">
                      <FileAttachIcon />
                      <div className="bg-neu5 h-[30px] w-[2px] mx-[24px]"></div>
                      <div>
                        <div className="body1 mb-[12px]">{elm.directus_files_id.title}</div>
                        <div className="flex items-center body4">
                          <div>{getType.toUpperCase()} File</div>
                          <div className="w-[2px] h-[20px] bg-neu5 mx-[12px]"></div>
                          <div>{getSize.toFixed(1)} KB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="bg-neu5 w-full h-[2px] my-[20px]"></div>
              <div className="flex items-center body3 justify-center" onClick={() => !checkLearned && !isLock && setNextLesson(!isNextLesson)}>
                <div
                  className={`box-shadow px-[12px] py-[8px] rounded-[10px] px-[50px]  ${checkLearned || isLock ? "bg-neu5 cursor-not-allowed" : "cursor-pointer bg-primary1 text-white"
                    }`}
                >
                  {checkLearned ? "Đã hoàn thành" : "Đánh dấu là đã hoàn thành"}
                </div>
              </div>
            </div>
          )}
        </div>
        {/* <Comment classUser={classUser}></Comment> */}
      </div>
    </div>
  );
};
export default Lesson;

const VimeoVideo = ({ src }) => {
  const [w, setWidth] = useState(0);
  useEffect(() => {
    const el: any = document.getElementById("vimeo-video");
    setWidth(el.offsetWidth);
  }, []);

  const width = Math.floor(w);
  const height = Math.floor((width * 9) / 16);

  return (
    <div className="w-full aspect-video rounded-md overflow-hidden" id="vimeo-video">
      {width && <Vimeo video={src} width={width} height={height} />}
    </div>
  );
};
