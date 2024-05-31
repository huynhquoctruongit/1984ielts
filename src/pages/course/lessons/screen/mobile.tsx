import WistiaPlayer from "@/components/system/wistia";
import VimeoVideo from "../components/vimeovideo";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FileAttachIcon } from "@/components/icons";
import { dowloadFile } from "@/services/helper";
import History from "../components/history";
import SketonSection from "../../section/components/sketon";
import HeaderMobile from "@/components/ui/header/mobile";
import Comment from "../components/comment";
import useClass from "@/components/layouts/menu/helper/use-class";
import useMyCourse from "../helper/use-order";
import PaymentScreen from "../components/payment";
import Choose from "../components/choose";
import Button from "@/components/ui/button";
import ButtonFinish from "../components/button-finish";
import useTrackingLesson from "../helper/use-tracking";
import ContentBlock from "../components/content-block";
import useResponsive from "@/hook/use-responsive";

const domain = import.meta.env.VITE_CMS;
const LessonMobile = ({ data, isLoading, isLock }: any) => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const collection = location.pathname.includes("quiz") ? "quiz" : "lesson";
  useTrackingLesson();
  function getIdYoutube(url: any) {
    if (url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return '<iframe width="560" height="515" src="//www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
    }
  }
  const { cls } = useClass(params.classId);
  const typeVideo = data?.video?.includes("youtube") ? "youtube" : data?.video_type;
  const goBack = () => navigate("/class/" + params.classId + "?section=" + params.sectionId);
  const { isLoadingMyCourse }: any = useMyCourse();
  const typeCourse = location.pathname.includes("lesson") ? "lesson" : "quiz";
  const chooses = ["Nội dung bài tập", "Lịch sử bài tập"];
  const [choose, setChoose] = useState(0);
  const { classId, sectionId, type, id } = params;
  const content = typeCourse == "lesson" ? data?.content : data?.description;

  return (
    <motion.div
      initial={{ y: 50, opacity: 0.2, scale: 1 }}
      transition={{ duration: 0.25, type: "tween", ease: "easeInOut" }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 50, opacity: 0.2, scale: 0 }}
      className="h-full w-screen relative"
    >
      <div className="absolute w-full h-full flex flex-col z-0 top-0 left-0">
        <HeaderMobile onBack={goBack} title={data?.title || ""} />
        <AnimatePresence>
          {(isLoading || isLoadingMyCourse) && <SketonSection />}
          {data?.video && !isLock && (
            <div>
              <div className="aspect-video relative">
                <div className="absolute bg-slate-50 animate-pulse w-full h-full top-0 left-0 z-0"></div>
                <div className="relative z-10 h-full">
                  {typeVideo === "youtube" && data?.video && (
                    <div className="content-cms mobile w-full h-full" dangerouslySetInnerHTML={{ __html: getIdYoutube(data?.video || "") as any }}></div>
                  )}
                  {typeVideo === "wistia" && <WistiaPlayer videoId={data?.video} wrapper={"player-wistia"} />}
                  {typeVideo === "vimeo" && <VimeoVideo src={data.video} />}
                </div>
              </div>
            </div>
          )}
          {!isLoading && !isLock && (
            <>
              <div className="grow overflow-y-scroll py-4">
                {collection === "quiz" && (
                  <div className="px-4 lg:mt-5">
                    <Choose choose={choose} chooses={chooses} setChoose={setChoose} />
                  </div>
                )}
                {choose === 1 && (
                  <div className="px-4">
                    <History choose={choose} />
                  </div>
                )}

                {choose === 0 && (
                  <div className="">
                    {content && (
                      <div className="py-6 px-4">
                        <div className="h6 mb-8"> {data.title} </div>
                        <div className="text-body1 content-mobile" dangerouslySetInnerHTML={{ __html: content }}></div>
                      </div>
                    )}
                    {typeCourse === "quiz" && (
                      <Link
                        target={"_blank"}
                        className="w-fit mx-auto block py-10"
                        to={`/class/${classId}/course/${cls?.course?.id}/section/${sectionId}/${type}/${id}${(type == "speaking" && "?step=instructions") || ""}`}
                      >
                        <Button className="bg-primary-01 text-white hover:bg-primary-01/80">Làm bài tập</Button>
                      </Link>
                    )}
                    {typeCourse === "lesson" && (
                      <div className="px-4">
                        {data?.documents?.length > 0 && <div className="text-primary1 headline2 my-[20px]">Tài liệu</div>}
                        {data?.documents?.map((elm: any, index) => {
                          const getType = elm.directus_files_id.filename_disk.split(".").pop();
                          const getSize = (elm.directus_files_id.filesize * 1) / 1024;
                          const link = domain + "/assets/" + elm.directus_files_id.filename_disk;
                          const fileName = elm.directus_files_id.title + "." + getType.toLowerCase();
                          return (
                            <div onClick={() => dowloadFile(link, fileName)} key={"doc" + index}>
                              <div className="cursor-pointer px-[24px] py-[12px] mb-[20px] rounded-lg shadow-xs text-neu1 bg-slate-50 flex items-center">
                                <FileAttachIcon />
                                <div className="bg-neu5 h-[30px] w-[2px] mx-[24px]"></div>
                                <div>
                                  <div className="body1 mb-[12px] opacity-90">{elm.directus_files_id.title}</div>
                                  <div className="flex items-center body5 opacity-60">
                                    <div>{getType.toUpperCase()} File</div>
                                    <div className="w-[2px] h-[20px] bg-neu5 mx-[12px]"></div>
                                    <div>{getSize.toFixed(1)} KB</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        {data.content_blocks && <ContentBlock data={data.content_blocks} />}
                        <ButtonFinish />
                      </div>
                    )}

                    {/* <div className="bg-neu5 w-full h-[2px] my-[20px]"></div>
                    <div className="px-4 mt-4">
                      <Comment classUser={cls} data={data}></Comment>
                    </div> */}
                  </div>
                )}
              </div>
            </>
          )}
          {isLock && <PaymentScreen />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default LessonMobile;
