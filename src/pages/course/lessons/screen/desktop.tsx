import Vimeo from "@u-wave/react-vimeo";
import Modal from "@/components/layouts/modal/template";
import WistiaPlayer from "@/components/system/wistia";
import Comment from "../components/comment";
import useMyCourse from "../helper/use-order";
import BuyPremium from "@/components/layouts/modal/buy-premium";
import Button from "@/components/ui/button";
import History from "../components/history";
import Choose from "../components/choose";
import useClass from "@/components/layouts/menu/helper/use-class";
import { dowloadFile } from "@/services/helper";
import { FileAttachIcon, RightArrowIcon } from "@/components/icons/index";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import OrderPayment from "../components/order-payment";
import ButtonFinish from "../components/button-finish";
import useTrackingLesson from "../helper/use-tracking";
import ContentBlock from "../components/content-block";

const domain = import.meta.env.VITE_CMS;

const LessonDesktop = ({ data, isPayment, openPayment, classUser }: any) => {
  const [choose, setChoose] = useState(0);
  const chooses = ["Nội dung bài tập", "Lịch sử bài tập"];
  const { classId, sectionId, type, id } = useParams();
  const [isLocked, setLocked]: any = useState(false);
  const listExclude = ["/quiz", "/lesson"];
  const typeCourse = listExclude.find((item) => location.pathname.includes(item));

  useTrackingLesson();
  function getIdYoutube(url: any) {
    if (url) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      return '<iframe width="560" height="515" src="//www.youtube.com/embed/' + videoId + '" frameborder="0" allowfullscreen></iframe>';
    }
  }

  const { cls } = useClass(classId);
  const typeVideo = data?.video?.includes("youtube") ? "youtube" : data?.video_type;
  console.log(typeCourse);
  
  return (
    <div className="relative w-full h-full">
      <div className="overflow-y-scroll scrollbar-hide absolute top-0 left-0 w-full h-full">
        <Modal open={isLocked}>
          <BuyPremium
            onClose={() => {
              setLocked(false);
            }}
            onSubmit={() => {
              openPayment(true);
              setLocked(false);
            }}
          />
        </Modal>
        <div className="learndash-content-body">
          <>
            <div className="px-6 md:px-10">
              <div className="md:pt-2 pt-6  mt-5">
                <p className="h5 text-neutral-01">{data?.title}</p>
              </div>
              {typeCourse !== "/lesson" && (
                <div className="sm:pt-0 pt-6 ">
                  <Choose choose={choose} chooses={chooses} setChoose={setChoose} />
                </div>
              )}

              {choose === 0 && (
                <>
                  <div className="mt-[10px] content-lesson">
                    {data?.video && (
                      <div className="relative aspect-video mb-8">
                        <div className="absolute bg-slate-50 animate-pulse w-full h-full top-0 left-0 z-0"></div>
                        <div className="relative z-0 w-full h-full">
                          {typeVideo === "youtube" && data?.video && (
                            <div className="content-cms w-full h-full" dangerouslySetInnerHTML={{ __html: getIdYoutube(data?.video || "") as any }}></div>
                          )}
                          {typeVideo === "wistia" && <WistiaPlayer videoId={data?.video} wrapper={"player-wistia"} />}
                          {typeVideo === "vimeo" && <VimeoVideo src={data.video} />}
                        </div>
                      </div>
                    )}
                    {typeCourse == "/quiz" && (
                      <div className="">
                        <Link
                          target={"_blank"}
                          className="flex items-center justify-center body3 text-center w-fit mx-auto"
                          to={`/class/${classId}/course/${cls?.course?.id}/section/${sectionId}/${type}/${id}${(type == "speaking" && "?step=instructions") || ""}`}
                        >
                          <Button className="bg-primary-01 text-white hover:bg-primary-01/80 my-8">Bắt đầu làm bài</Button>
                        </Link>
                      </div>
                    )}
                    <div className="content-cms" dangerouslySetInnerHTML={{ __html: typeCourse == "/lesson" ? data?.content : data?.description }}></div>
                    {typeCourse == "/lesson" ? (
                      <div className="mb-[100px]">
                        {data?.documents?.length > 0 && <div className="text-primary1 headline2 my-[20px]">Tài liệu</div>}
                        {data?.documents?.map((elm: any) => {
                          const getType = elm.directus_files_id.filename_disk.split(".").pop();
                          const getSize = (elm.directus_files_id.filesize * 1) / 1024;
                          const link = domain + "/assets/" + elm.directus_files_id.filename_disk;
                          const fileName = elm.directus_files_id.title + "." + getType.toLowerCase();
                          return (
                            <div onClick={() => dowloadFile(link, fileName)}>
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
                        <ButtonFinish className="mt-10" />
                        <div className="bg-neu5 w-full h-[2px] my-10"></div>
                      </div>
                    ) : null}
                  </div>
                  {/* <Comment classUser={classUser} data={data}></Comment> */}
                </>
              )}
              {choose === 1 && data.id && <History choose={choose} />}
            </div>
          </>
          {isPayment && (
            <div className="absolute z-[100] bottom-0 w-full bg-white border-t-[1px] border-neu4">
              <div className="flex justify-center items-center w-full cursor-pointer pt-[12px]">
                <RightArrowIcon onClick={openPayment} className="rotate-90" fill="#3C3C4399" />
              </div>
              <OrderPayment classUser={classUser} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LessonDesktop;

const VimeoVideo = ({ src }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  const height = Math.floor((width * 9) / 16);
  useEffect(() => {
    setWidth(Math.floor(ref?.current?.offsetWidth || 0));
  }, []);
  return (
    <div className="w-full aspect-video rounded-md overflow-hidden" ref={ref} id="vimeo-video">
      {width > 0 && <Vimeo video={src} width={width} height={height} />}
    </div>
  );
};
