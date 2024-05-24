import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon, ChatBubbleBottomCenterTextIcon } from "@heroicons/react/24/outline";
import useOnClickOutside from "@/hook/outside";
import useSWR from "swr";
import { Spin } from "antd";
import { Tabs, Tab, Card, CardBody, Avatar } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { FaceFrownIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { AudioPlayerId } from "@/components/ui/audio";
import { Play2Icon, PlusIcon, MinusIcon, EyeIcon, LockedIcon } from "@/components/icons";
import { convertSecondToTime } from "@/services/helper";
import { useAuth } from "@/hook/auth";
import dayjs from "dayjs";

function ReviewSpeaking({ answer = {}, quiz, quizId, updateAnswer = () => {} }: any) {
  const [ui, setClose]: any = useState();

  const domain = import.meta.env.VITE_CMS;
  const { profile } = useAuth();

  const inputTime = answer?.date_created;
  const formattedTime = dayjs(inputTime).locale("en").format("DD MMM - YYYY hh:mm:ss A");

  const review = answer?.review?.date_created;
  const reviewedTime = dayjs(review).locale("en").format("DD MMM - YYYY hh:mm:ss A");

  const closeUI = (type: any, status: any) => {
    setClose({
      ...ui,
      [type]: !status,
    });
  };
  if (!quizId || !quiz)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );

  return (
    <>
      <div className="md:p-10 p-[20px] bg-slate-50 min-h-screen zoomin-content overflow-y-hidden">
        <div className="flex items-center w-full">
          {(profile.avatar && <img className="rounded-full w-[110px] h-[110px] object-cover" src={`${domain + "/assets/" + profile.avatar}`} />) || (
            <img src="/images/result-2.png" className="rounded-full w-[80px] h-[80px] md:w-[110px] md:h-[110px] object-cover" />
          )}
          <div className="ml-[15px] w-full">
            <p className="text-primary1 headline1">{profile?.fullname || profile?.email?.replace("@gmail.com", "")}</p>
            <div className="md:flex items-center justify-between w-full">
              <div className="md:flex items-center">
                <p className="text-primary1 body1">{quiz?.title}</p>
                <span className="body5 md:ml-[9px]">[ {formattedTime} ]</span>
              </div>
              <div className="md:mt-0 mt-[20px] text-right">
                {(answer?.review && answer?.review?.date_created && (
                  <div className="mb-[12px]">
                    <Button className="body4 bg-green1 text-white md:ml-auto mb-[7px]">Reviewed</Button>
                    <p className="body5"> Revision time [ {reviewedTime} ]</p>
                  </div>
                )) || (
                  <div>
                    <Button className="body4 bg-neu4 text-black md:ml-auto mb-[7px]">Under review</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {(quiz.parts &&
          quiz.parts?.map((item: any, index: any) => {
            return (
              <div className="mt-[50px]">
                <div className="bg-primary1 text-white rounded-[10px] px-[28px] py-[18px]">
                  <p className="headline2">Task {index + 1}</p>
                </div>
                <div className="ml-[12px]">
                  <div className="flex items-center relative">
                    <div className="bg-black-border bg-neu4 mt-[14px] rounded-[10px] p-[20px] w-full">
                      <div className="flex justify-between items-center">
                        <p className="body1">Question</p>
                        <div
                          onClick={() => closeUI(`question-${index}`, ui?.[`question-${index}`])}
                          className="bg-neu4 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white"
                        >
                          {ui?.[`question-${index}`] ? <PlusIcon /> : <MinusIcon />}
                        </div>
                      </div>
                      <p className={ui?.[`question-${index}`] ? "hidden mt-[20px]" : "block mt-[20px]"}>
                        <div className="content-cms" dangerouslySetInnerHTML={{ __html: item?.content }}></div>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center relative">
                    <div className="bg-black-border bg-neu4 mt-[14px] rounded-[10px] md:p-[20px] p-[10px]  w-full">
                      <div className="flex justify-between items-center">
                        <div className="flex">
                          <p className="mr-[12px] body1">Answer</p>
                        </div>
                        <div
                          onClick={() => closeUI(`answer-${index}`, ui?.[`answer-${index}`])}
                          className="bg-neu4 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white"
                        >
                          {ui?.[`answer-${index}`] ? <PlusIcon /> : <MinusIcon />}
                        </div>
                      </div>
                      <div className={`flex w-full flex-col relative ${ui?.[`answer-${index}`] ? "hidden mt-[20px]" : "block mt-[20px]"}`}>
                        <ContentRenderPart parts={quiz.parts} answer={answer} indexPart={index} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })) || <p className="w-full m-auto text-center mt-[100px] body3 text-[gray]">Không có dữ liệu</p>}
        <div className="my-[40px] flex items-center relative">
          <div className="w-full">
            <div className="flex justify-between items-center bg-primary1 text-white rounded-[10px] px-[28px] py-[18px] mb-[12px]">
              <p className="body1">Review</p>
              <div className="flex">
                {(answer?.review && (
                  <div
                    onClick={() => closeUI(`review-${answer?.id}`, ui?.[`review-${answer?.id}`])}
                    className="bg-green1 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white"
                  >
                    <EyeIcon />
                  </div>
                )) || (
                  <div className="ml-[8px] bg-neu4 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white">
                    <LockedIcon />
                  </div>
                )}
              </div>
            </div>
            {answer?.review && (
              <div className="relative ml-[12px]">
                {answer?.review?.details[0]?.voice && <AudioPlayerId id={answer?.review?.details[0]?.voice} />}
                <div className="md:flex bg-black-border mt-[14px] rounded-[10px] w-full">
                  <div className="md:mr-[10px] w-full bg-neu4 rounded-[10px] p-[20px] md:mb-0 mb-[14px]">
                    <p className="md:mr-[12px] body1 mb-[20px]">Scores</p>
                    <div className="shadow-card border-small rounded-small p-6 bg-white">
                      <p>
                        Fluency and Coherence : <span className="body3">{answer?.review?.fluency_and_coherence}</span>
                      </p>
                      <p>
                        Pronunciation : <span className="body3">{answer?.review?.pronunciation}</span>
                      </p>
                      <p>
                        Lexical resource : <span className="body3">{answer?.review?.lexical_resource}</span>
                      </p>
                      <p>
                        Grammatical range and Accuracy GRA : <span className="body3">{answer?.review?.grammatical_range_and_accuracy_GRA}</span>
                      </p>
                    </div>
                  </div>
                  <div className="md:ml-[10px] w-full bg-neu4 rounded-[10px] p-[20px]">
                    <p className="md:mr-[12px] body1 mb-[20px]">Note</p>
                    <div className="min-h-[146px] shadow-card border-small rounded-small p-6 bg-white">
                      <div className="flex">
                        <span className="mr-[4px] whitespace-nowrap"></span>{" "}
                        <div className="content-cms" dangerouslySetInnerHTML={{ __html: answer?.review?.details[0]?.note || answer?.review?.note }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ReviewSpeaking;

const ContentRenderPart = ({ answer, parts, indexPart }: any) => {
  const [select, setSelect] = useState(0);
  const [play, setPlay] = useState(-1);
  const stop = useRef(false);

  const part = parts[indexPart];
  const questions = part?.questions;
  const detailAnswer = (answer.detail || []).find((item: any) => item?.answer?.part_id == part.id)?.answer || {};
  const answerOfQuestion = detailAnswer.questions || {};
  const review = answer?.review;
  const reviewDetail = (review?.details || []).find((item: any) => item.part_id == part.id) || {};
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
  useEffect(() => {
    if (part?.id && detailAnswer) {
      setTimeout(() => {
        const duraTime: any = document.getElementById(`duraTime-${part?.id}`);
        const lastTimeDuration: any = document.getElementById(`lastTimeDuration-${part?.id}`);
        if (duraTime?.innerHTML && lastTimeDuration) {
          lastTimeDuration.innerHTML = duraTime?.innerHTML;
        }
      }, 1000);
    }
  }, [part, detailAnswer]);

  return (
    <div className="content-exam">
      <div className="md:flex gap-x-3">
        <div className="flex-1">
          {!detailAnswer?.file_id && (
            <div className="bg-white shadow-card border-small rounded-small py-10 flex-col flex items-center justify-center font-semibold uppercase">
              <FaceFrownIcon className="w-10 h-10 fill-yellow-600" />
              <span className="mt-4 text-yellow-600">Học sinh chưa trả lời</span>
            </div>
          )}
          {detailAnswer?.file_id && (
            <div className="mt-[20px] shadow-card border-small rounded-small md:p-6 p-[10px] bg-white">
              <div className="mt-0">
                <AudioPlayerId onPause={onPause} onPlay={onPlay} refAudio={refAudio} id={detailAnswer?.file_id} partId={part?.id} />
              </div>

              <div className="mt-10">
                {questions?.map((elm, index) => {
                  const active = index === play;
                  const { time_start, time_finish, title } = answerOfQuestion[elm.id];
                  return (
                    <div
                      onClick={() => playSections(index, time_start)}
                      className="flex items-center justify-between my-4 cursor-pointer hover:text-blue-900"
                      key={index + "question"}
                    >
                      <div className="flex items-center">
                        <div className="relative w-[30px] h-10 flex items-center justify-left">
                          {active ? (
                            <img src="/images/icon-voicing.gif" className="shrink w-[45px] h-[45px] object-cover absolute" />
                          ) : (
                            <PlayCircleIcon className="w-8 h-8 fill-primary1" />
                          )}
                        </div>
                        <span className="font-medium md:text-lg body5 line-clamp-2 mx-[4px]">{elm.title}</span>
                      </div>
                      <div>
                        {part?.id && (
                          <span className="float-right md:ml-auto md:mr-[unset] mr-auto md:body5 caption text-right time-question">
                            {convertSecondToTime(time_start)} -{" "}
                            <span id={questions?.length - 1 == index ? `lastTimeDuration-${part?.id}` : ""}>{convertSecondToTime(time_finish)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};