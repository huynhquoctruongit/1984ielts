import { useState, useRef } from "react";
import { ChevronRightIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import Modal from "./review";
import { Avatar, Button } from "@nextui-org/react";
import { CheckBadgeIcon, FaceFrownIcon } from "@heroicons/react/20/solid";
import { imageDefault, renderImageById } from "@/services/helper";
import dayjs from "dayjs";
import { useAuth } from "@/hook/auth";
import { InfomationWriting } from "../widget/score";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";
import { useToast } from "@/context/toast";
import { AudioPlayerId } from "@/components/ui/audio";

function ReviewWriting({ answer = {}, quiz = {} }: any) {
  return (
    <>
      <div className="md:p-10 p-2 bg-slate-50 h-[calc(100vh-64px)]">
        <b className="inline-flex w-full h-[50px] text-black/70 font-medium mt-4 md:mt-0">
          Home
          <ChevronRightIcon className="h-4 w-4 mt-1" /> Writing <ChevronRightIcon className="h-4 w-4 mt-1" />
          {quiz?.title}
        </b>

        <div className="flex w-full flex-col ">
          <ContentRenderPart parts={quiz.questions} answer={answer} />
        </div>
      </div>
    </>
  );
}

export default ReviewWriting;

const ContentRenderPart = ({ answer, parts }: any) => {
  const refAudio: any = useRef();
  const [select, setSelect] = useState(0);
  const part = parts[select];
  const detailAnswer = (answer.writing || []).find((item: any) => item?.id == part.id)?.answer;
  const review = answer?.review;
  const reviewDetail = (review?.details || []).find((item: any) => item.part_id == part.id) || {};

  const [open, setOpen]: any = useState(false);
  const { profile } = useAuth();
  const image = profile.avatar ? renderImageById(profile.avatar) : imageDefault;

  let [searchParams, setSearchParams] = useSearchParams();
  const classId = searchParams.get("class");
  const { warning }: any = useToast();

  const { data: classData } = useSWR("/items/class/" + classId + "?fields=students.*");

  const gotoGoogleDoc = () => {
    const data = classData?.data?.data;
    const { link_google_doc } = data?.students.find((st: any) => st.directus_users_id == answer.user_created.id) || {};
    if (!link_google_doc) return warning("You don't have link google doc");
    window.open(link_google_doc, "_blank");
  };
  const idFile = reviewDetail.voice

  return (
    <div className="md:grid md:grid-cols-8 gap-x-3">
      {!open && (
        <div className="col-span-2">
          <div className="lg:p-6 hidden md:flex p-0 bg-white mb-6 rounded-lg flex items-center">
            <div className="aspect-square min-w-[40px]">
              <Avatar size="md" src={image} className="hidden lg:flex "></Avatar>
            </div>
            <div className="lg:ml-3 ml-0 w-full lg:p-0 p-6">
              <div className="font-medium leading-1 text-primary2 text-md truncate">{answer.fullname || "Student"} </div>{" "}
              <div className="font-medium leading-1 text-[12px] text-gray-400 truncate">{answer.user_created?.email}</div>
            </div>
          </div>
          <div className="w-full md:p-4 p-2 bg-white flex flex-col gap-y-1 rounded-small border-default-200 dark:border-default-100">
            {parts.map((item: any, index: number) => {
              const isActive = select === index;
              const bg = !isActive ? "bg-greenpastel" : "bg-orangepastel";
              return (
                <div
                  key={item.id}
                  onClick={() => setSelect(index)}
                  className={"py-5 px-5 my-1 rounded-2xl flex items-center hover:bg-[#caf3d4] duration-100 transition-colors ease-in-out  cursor-pointer " + bg}
                >
                  <div className="min-w-[40px] w-10 h-10 rounded-2xl shadow-sm bg-white flex items-center justify-center font-black text-xl text-primary1">{index + 1}</div>
                  <div className="ml-3 relative h-10 w-full">
                    <div className="absolute top-0 left-0 w-full">
                      <div className="font-medium  truncate block whitespace-nowrap text-[14px] text-black/90">{item.title || "Question " + (index + 1)}</div>
                      <div className="text-xs text-gray-400 font-medium text-[10px] uppercase mt-10.5 truncate">{dayjs(answer.date_created).format("hh:mm:ss A DD/MM/YYYY")}</div>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 ml-2 stroke-[2px] trnasition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className={open ? "col-span-4 overflow-y-scroll h-[calc(100vh-154px)]" : "col-span-6 h-[calc(100vh-154px)]"}>
        <div className="flex-1">
          <div className="bg-white rounded-small md:p-6 p-2">
            <div className="flex flex-wrap md:flex-row gap-4 md:items-center items-start  px-6 py-4 bg-orangepastel  text-primary2 rounded-lg">
              <div className="text-lg font-medium leading-1 mr-3">{part?.title || "Question"}</div>
              <div
                onClick={gotoGoogleDoc}
                className={
                  "bg-warning-400 whitespace-nowrap ml-auto text-white hover:text-white hover:bg-warning-500 px-5 shadow-sm py-2 w-fit rounded-full flex items-center transition-color duration-200 ease-in-out cursor-pointer "
                }
              >
                <span className="font-meidum text-right">Go to Writing file</span>
              </div>

              {profile.roleName !== "Teacher" && (
                <div className={"text-right px-4 rounded-full py-2 bg-white font-medium " + (answer.status === "reviewed" ? "text-green-500" : "text-primary2 ")}>
                  {answer.status === "reviewed" ? "Reviewed" : "Under Review"}
                </div>
              )}

              {profile.roleName === "Teacher" && (
                <div className="">
                  <Button
                    radius="full"
                    onClick={() => {
                      setOpen((open) => !open);
                    }}
                    className="bg-white text-primary2 font-medium "
                  >
                    REVIEW
                  </Button>
                </div>
              )}
            </div>
            <div className="mt-10 font-medium w-fit mb-4 px-4 flex items-center rounded-full text-blurgray bg-bluepastel text-sm uppercase py-2">
              Question <QuestionMarkCircleIcon className="w-4 ml-2" />
            </div>
            <div className="p-10 rounded-2xl bg-gray-100/50" dangerouslySetInnerHTML={{ __html: part?.content_writing }}></div>
            <div className="font-medium w-fit mt-10 mb-4 px-4 flex items-center rounded-full text-success-600 bg-greenpastel text-sm uppercase py-2">
              Answer <CheckBadgeIcon className="w-4 ml-2" />
            </div>
            <div className="p-10 rounded-2xl bg-gray-100/50" dangerouslySetInnerHTML={{ __html: detailAnswer?.replace(/(?:\r\n|\r|\n)/g, "<br>") }}></div>
            {!detailAnswer && (
              <div className="bg-white shadow-sm border-small rounded-small py-10 flex-col flex items-center justify-center font-semibold uppercase">
                <FaceFrownIcon className="w-10 h-10 fill-primary1" />
                <span className="mt-4 text-primary1">Học sinh chưa trả lời</span>
              </div>
            )}
            {review && (
              <div className="flex items-center w-full">
                <div className="overflow-hidden mt-10 w-full">
                  <div className="font-medium w-fit mb-4 px-4 flex items-center rounded-full text-success-600 bg-greenpastel text-sm uppercase py-2">
                    Reviewed <CheckBadgeIcon className="w-4 ml-2" />
                  </div>
                  {idFile &&<AudioPlayerId refAudio={refAudio} className="mb-[20px]" id={idFile} />}
                  <InfomationWriting review={reviewDetail} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{ display: open ? "block" : "none" }}
        className="transition col-span-4 h-[calc(100vh-154px)] duration-300 z-10 ease-in-out modal overflow-y-auto bg-white rounded md:p-10 shadow-xl"
      >
        <Modal key={part.id} open={open} answer={answer} part={part} setOpen={setOpen} title={"title"} />
      </div>
    </div>
  );
};
