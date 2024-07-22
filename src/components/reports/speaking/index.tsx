import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import Modal from "./review";
import useOnClickOutside from "@/hook/outside";
import useSWR from "swr";
import { Spin } from "antd";
import { Avatar } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { FaceFrownIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { AudioPlayerId } from "@/components/ui/audio";
import { convertSecondToTime, imageDefault, renderImageById } from "@/services/helper";
import dayjs from "dayjs";
import { InfomationSpeaking } from "../widget/score";
import { useAuth } from "@/hook/auth";

function ReviewSpeaking({ answer = {}, updateAnswer = () => { } }: any) {
  const quizId = answer?.quiz;
  const { data: quizData } = useSWR(quizId ? `/v1/quizzes/${quizId}` : null);
  const quiz = quizData?.data?.data;

  if (!quizId || !quiz)
    return (
      <div className="flex items-center">
        <Spin />
      </div>
    );
  return (
    <>
      <div className="zoomin-content lg:p-10 p-2 !pt-8 bg-slate-50 min-h-screen">
        <b className="inline-flex w-full h-[50px] text-black/70 font-medium">
          Home <ChevronRightIcon className="h-4 w-4 mt-1" /> Speaking <ChevronRightIcon className="h-4 w-4 mt-1" />
          {quiz?.title}
        </b>

        <div className="flex w-full flex-col relative">
          <ContentRenderPart parts={quiz.parts} answer={answer} />
        </div>
      </div>
    </>
  );
}

export default ReviewSpeaking;

const ContentRenderPart = ({ answer, parts }: any) => {
  const [select, setSelect] = useState(0);
  const [play, setPlay] = useState(-1);
  const stop = useRef(false);

  const part = parts[select];
  const questions = part?.questions;
  const detailAnswer = (answer.detail || []).find((item: any) => item?.answer?.part_id == part?.id)?.answer || {};
  const answerOfQuestion = detailAnswer.questions || {};
  const review = answer?.review;
  const reviewList = review?.details || []

  const reviewDetail = reviewList?.find((item: any) => item?.part_id == part?.id) || {};
  const [open, setOpen]: any = useState(false);
  const ref: any = useRef();
  useOnClickOutside(ref, () => setOpen(false));

  const playSections = (index: number, time: number) => {
    if (play === index) {
      setPlay(-1);
      stop.current = true;
      refAudio.current.pause();
      setTimeout(() => {
        stop.current = false;
      }, 1000);
    } else {
      setPlay(index);
      setTime(time);
    }
  };

  const refAudio: any = useRef();
  const setTime = (time: number) => {
    refAudio.current.currentTime = time;
    refAudio.current.play();
  };

  const onPlay = (e: any) => {
    const index = questions.find((item: any) => {
      const { time_start, time_finish } = answerOfQuestion[item.id] || {};
      return refAudio.current.currentTime > time_start && refAudio.current.currentTime <= time_finish;
    });
    if (index < -1) return setPlay(-1);
    if (index && index !== play && !stop.current) return setPlay(questions.indexOf(index));
  };

  const onPause = () => {
    setPlay(-1);
  };
  const { profile } = useAuth();
  return (
    <div className="md:grid md:grid-cols-8 gap-x-3">
      {!open && (
        <div className="w-full col-span-2">
          <div className="md:p-6 hidden md:flex p-0 bg-white mb-6 rounded-lg flex items-center w-full">
            <div className="aspect-square md:min-w-[40px] hidden lg:flex min-w-[0px]">
              <Avatar size="md" src={renderImageById(answer?.user_created?.image) || imageDefault} className=" "></Avatar>
            </div>
            <div className="lg:ml-2 ml-0 w-full">
              <div className="font-medium leading-1 text-primary2 text-md">{answer.fullname || answer.user_created?.email.slice(0, 5)} </div>{" "}
              <div className="font-medium leading-1 text-[12px] text-gray-400 truncate lg:mr-6 lg:pr-4 mr-0 pr-0">{answer.user_created?.email}</div>
            </div>
          </div>
          <div className="w-full md:p-4 p-2 bg-white shadow-ms flex flex-col gap-y-1 rounded-small ">
            {parts.map((item: any, index: number) => {
              const isActive = select === index;
              const bg = !isActive ? "bg-greenpastel" : "bg-orangepastel";
              return (
                <div
                  key={item.id}
                  onClick={() => setSelect(index)}
                  className={"py-5 px-5 my-1 rounded-2xl flex items-center hover:bg-[#caf3d4] duration-100 transition-colors ease-in-out  cursor-pointer " + bg}
                >
                  <div className=" min-w-[40px] w-10 h-10 rounded-2xl shadow-sm bg-white flex items-center justify-center font-black text-xl text-primary1">{index + 1}</div>
                  <div className="ml-3 relative w-full h-5">
                    <div className="font-medium absolute top-0 w-full truncate left-0 block whitespace-nowrap text-[14px] text-black/90">
                      {item.title || "Question " + (index + 1)}
                    </div>
                  </div>
                  <ChevronRightIcon className="w-4 ml-auto stroke-[2px] trnasition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className={open ? "col-span-4 overflow-y-scroll h-[calc(100vh-154px)]" : "col-span-6"}>
        <div className="flex-1 ">
          {!detailAnswer?.file_id && (
            <div className="bg-white shadow-card border-small rounded-small py-10 flex-col flex items-center justify-center font-semibold uppercase">
              <FaceFrownIcon className="w-10 h-10 fill-yellow-600" />
              <span className="mt-4 text-yellow-600">Học sinh chưa trả lời</span>
            </div>
          )}
          {detailAnswer?.file_id && (
            <div className="shadow-card border-small rounded-small md:p-6 p-2 bg-white">
              <div className="flex items-center px-6 py-4 bg-orangepastel text-primary2 rounded-lg">
                <div className="text-lg font-medium leading-1">{part?.title}</div>
                <div className="ml-auto">
                  {profile.roleName !== "Teacher" && (
                    <div className={"ml-auto px-4 rounded-full py-2 bg-white font-medium " + (answer.status === "reviewed" ? "text-green-500" : "text-primary2 ")}>
                      {answer.status === "reviewed" ? "Reviewed" : "Under Review"}
                    </div>
                  )}
                  {profile.roleName === "Teacher" && (
                    <Button
                      color={"primary"}
                      radius="sm"
                      onClick={() => {
                        setOpen((open) => !open);
                      }}
                    >
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                      REVIEW
                    </Button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                <AudioPlayerId onPause={onPause} onPlay={onPlay} refAudio={refAudio} className="rounded-t-none" id={detailAnswer?.file_id} />
              </div>
              <div className="mt-10">
                {questions.map((ques: any, index: number) => {
                  const active = index === play;
                  const { time_start, time_finish } = answerOfQuestion[ques.id] || {};
                  return (
                    <div
                      onClick={() => playSections(index, time_start)}
                      className="relative md:flex gap-4 items-start my-4 cursor-pointer hover:text-blue-900"
                      key={ques.id + "question"}
                    >
                      <div className="flex items-center">
                        <div className="relative min-w-[48px] w-12 h-10 flex items-center justify-center">
                          {active ? (
                            <img src="/images/icon-voicing.gif" className="shrink w-16 h-16 object-cover absolute" />
                          ) : (
                            <PlayCircleIcon className="w-8 h-8 fill-primary1" />
                          )}
                        </div>
                        <p className="font-medium md:text-lg body3 pl-3 md:pl-0">{ques.title}</p>
                      </div>
                      <p className="md:relative md:absolute top-2 md:top-0 right-0 ml-auto whitespace-nowrap text-right text-sm md:text-md md:mt-2.5 mt-0 mr-4 md:mr-0">
                        {convertSecondToTime(answerOfQuestion[ques.id]?.time_start)} - {convertSecondToTime(answerOfQuestion[ques.id]?.time_finish)}
                      </p>
                    </div>
                  );
                })}
              </div>
              {review && (
                <div className="overflow-hidden mt-10">
                  <div className="font-semibold text-xl py-2"> Reviewed</div>
                  <InfomationSpeaking review={reviewDetail} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div
        style={{ display: open ? "block" : "none" }}
        className="transition col-span-4 duration-300 z-10 h-[calc(100vh-154px)] ease-in-out modal overflow-y-auto bg-white rounded md:p-10 shadow-xl"
      >
        <Modal key={part?.id} open={open} answer={answer} part={part} setOpen={setOpen} title={"title"} />
      </div>
    </div>
  );
};
