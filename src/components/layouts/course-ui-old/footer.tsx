import Button from "@/components/ui/button/index";
import { ArrowIcon, OclockIcon, MapsIcon, SubmitIcon, MenuIcon, CloseIcon } from "@/components/icons/index";
import { useState, useEffect, useRef } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import { useParams } from "react-router-dom";
import { convertTimeToFormat } from "@/services/helper";
import { useAuth } from "@/hook/auth";
import { amplitudeSendTrack, getTypeByUrl } from "@/services/amplitude";
const Footer = ({
  isLimited,
  startTime,
  isContinuteTime,
  indexPart,
  timeUp,
  inputValue,
  isStart,
  partNumberState,
  getPartNumber,
  part,
  quiz,
  action,
  typeChanged,
  data,
  listAnswer,
}: any) => {
  let intervalRef: any = useRef(null);
  let refTime: any = useRef(0);
  const { quizId } = useParams();
  let urlParams = new URLSearchParams(window.location.search);
  const typeStatus = urlParams.get("type");

  const isReview = location.pathname.includes("/review") || typeStatus == "review";

  const [isQuestIndex, showQuestIndex] = useState(false);
  const [ref, setRef]: any = useState(null) as any;
  const [listData, setData] = useState([]);
  const [num, setNum]: any = useState(0);
  const [orderState, setOrder]: any = useState(0);

  var partNumber = partNumberState;

  const isNotNullValue = inputValue?.[partNumber]?.answer?.length >= 1;
  const isDisble = data?.data?.data?.length - 1 == partNumberState;
  let setPauseTime = 0;
  function countdown(minutes: any) {
    let seconds = minutes * 60 - 1;
    intervalRef.current = setInterval(() => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = (seconds % 60).toString().padStart(2, "0");
      const countdownOutput = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
      const timeLeftId = window.document.getElementById("time-left")!;

      if (isReview) {
        clearInterval(intervalRef.current);
      } else if (timeLeftId !== null && countdownOutput && countdownOutput !== "NaN:NaN:NaN" && !isReview) {
        if (timeLeftId) {
          refTime.current = seconds / 60;
          timeLeftId.innerHTML = countdownOutput;
        }
      }
      if (seconds === 0 || isReview) {
        const timeUpElm: any = document.getElementById("time-up");
        timeUpElm.click();
        clearInterval(intervalRef.current);
      }
      seconds--;
    }, 1000);
  }
  const convertArray = (obj: any): any => {
    const result = Object.keys(obj || {}).reduce((arr: any, key: any) => {
      const item = obj[key] || [];
      return [...arr, ...item];
    }, []);
    return result;
  };
  const listAnswerMerge = convertArray(listAnswer);
  const listQuestions = quiz?.parts?.flatMap((item: any) => item.questions);
  useEffect(() => {
    let newData: any = [listAnswerMerge];
    listAnswerMerge?.map((elm: any, index: any) => {
      if (elm.type === "MULTIPLE-TYPE") {
        elm.answer.title.map((item: any, indexArr: any) => {
          item.location = elm.location + indexArr;
          newData.push(item);
        });
      } else {
        newData.push(elm);
      }
    });
    setData(newData);
  }, [listAnswer]);

  useEffect(() => {
    if (part === "speaking") {
      if (quiz && !isReview && !isStart && startTime && !isContinuteTime) {
        clearInterval(intervalRef.current);
        countdown(quiz.time);
      } else {
        if (isContinuteTime && startTime && part === "speaking") {
          clearInterval(intervalRef.current);
          countdown(refTime.current);
        }
      }
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [quiz.id, startTime, isContinuteTime]);

  useEffect(() => {
    if (part !== "speaking") {
      if (quiz && !isReview && !isStart) {
        clearInterval(intervalRef.current);
        countdown(quiz.time);
      } else {
        const timeLeftId = window.document.getElementById("time-default")!;
        if (timeLeftId) {
          timeLeftId.innerHTML = "00:00:00";
        }
      }
    }
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [quiz.id, isReview, isStart]);
  let order = orderState;
  useEffect(() => {
    if (listQuestions && part !== "writing") {
      let newData = [...listQuestions];
      newData?.map((item: any, index: any) => {
        if (item.type === "FILL-IN-THE-BLANK") {
          const regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
          var matches = [...item.gap_fill_in_blank.matchAll(regex)];
          matches.map((elm: any, index: any) => {
            order = order + 1;
            setOrder(order);
          });
        } else if (item.type === "MULTIPLE") {
          const getAnswer = item.mutilple_choice;
          const getCorrectAnswer = getAnswer.filter((elm: any) => elm.correct);
          getCorrectAnswer.map((elm: any, indexAnswer: any) => {
            order = order + 1;
            setOrder(order);
          });
        } else {
          order = order + 1;
          setOrder(order);
        }
      });
    }
  }, []);

  const clickPart = (status: any) => {
    if (status === "next") {
      if (isNotNullValue) {
        if (partNumber < data?.data?.data?.length - 1) partNumber++;
        getPartNumber(partNumber);
      }
    } else {
      if (partNumber > 0) {
        partNumber--;
        getPartNumber(partNumber);
      }
    }
  };
  const closeScreen = () => {
    window.close();
  };

  const { profile } = useAuth();
  const { classId, sectionId, ...papa } = useParams();

  const onSubmit = (type) => {
    const typeQuiz = getTypeByUrl();
    amplitudeSendTrack(`[${typeQuiz}] Submit Quiz`, {
      class: classId,
      section: sectionId,
      quiz: quizId,
      user: profile.id,
      type: typeQuiz,
    });
    action(type);
  };

  return (
    <div className="absolute left-0 bottom-0 w-full z-[1111]">
      <a id="time-up" onClick={timeUp}></a>
      <div className="header-part bg-primary1 lg:px-[39px] px-[15px] py-[15px]">
        <div
          className={` ${part == "writing" ? "lg:flex block flex-row-reverse items-end" : "flex items-center justify-between"} ${
            part !== "listening" || (isReview && part === "listening") ? "justify-between" : "justify-end"
          }`}
        >
          {part === "reading" || part === "listening" ? (
            <div>
              <div className={`flex items-center cursor-pointer ${part == "listening" ? "lg:hidden" : "flex"}`} onClick={() => showQuestIndex(!isQuestIndex)}>
                <MenuIcon className="mr-[15px]" />
                <p className="hidden lg:block headline1 text-white  whitespace-nowrap">Question palette</p>
              </div>
              {isQuestIndex && (
                <div className="absolute left-0 bottom-[70px] bg-neu1 lg:w-[50%] w-full lg:px-[49px] px-[20px] py-[18px] rounded-tr-[40px]">
                  <div className="flex items-center text-white">
                    <div className="flex mr-[36px] items-center">
                      <div className="p-[3px] rounded-full bg-green1 w-[30px] h-[30px]"></div>
                      <p className="lg:body1 body3 ml-[12px]">Answered</p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <div className="p-[3px] rounded-full w-[30px] h-[30px] bg-white"></div>
                        <p className="lg:body1 body3 ml-[12px]">Unanswered</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-y-[10px] items-center mt-[12px] body3 pb-[5px]">
                    {new Array(orderState).fill(null)?.map((_, index: any) => {
                      const isSelected: any = listData?.find((elm: any) => (elm.location || elm.question) === index + 1);
                      return (
                        <div
                          key={index + "-elm"}
                          className={`${
                            (isSelected?.answer?.title !== undefined && isSelected?.answer?.title.length > 0 && isSelected?.answer?.title[0] !== "") ||
                            (isSelected && isSelected?.type !== "FILL_IN_THE_BLANK")
                              ? "bg-green1 text-white"
                              : "bg-white text-black"
                          } cursor-pointer p-[3px] rounded-full  w-[30px] h-[30px] mr-[15px] flex items-center justify-center`}
                        >
                          {index + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            ""
          )}
          <div className={`flex justify-between items-center ${part == "speaking" && "w-full"}`}>
            {part == "writing" && !isReview && (
              <div className="lg:absolute left-[45%] w-fit lg:flex items-center justify-center text-center">
                <OclockIcon className="hidden lg:block h-5 w-5 mr-[15px]" />
                <p className="text-white lg:headline1 headline2" id={`${!isReview ? "time-left" : "time-default"}`}>
                  00:00:00
                </p>
              </div>
            )}
            {part == "reading" && !isReview && (
              <div className="lg:absolute left-[45%] w-fit lg:flex items-center justify-center text-center">
                <OclockIcon className="hidden lg:block h-5 w-5 mr-[15px]" />
                <p className="text-white lg:headline1 headline2" id={`${!isReview ? "time-left" : "time-default"}`}>
                  00:00:00
                </p>
              </div>
            )}
            {part == "listening" && !isReview && (
              <div className="lg:absolute left-[45%] w-fit lg:hidden flex items-center justify-center text-center">
                <OclockIcon className="hidden lg:block h-5 w-5 mr-[15px]" />
                <p className="text-white lg:headline1 headline2" id={`${!isReview ? "time-left" : "time-default"}`}>
                  00:00:00
                </p>
              </div>
            )}
            {part == "speaking" && (
              <div className="w-full flex items-center justify-center text-center">
                <OclockIcon className="h-5 w-5 mr-[15px]" />
                <p className="text-white lg:headline1 headline2" id={`${!isReview ? "time-left" : "time-default"}`}>
                  {convertTimeToFormat(quiz.time)}
                </p>
              </div>
            )}

            {part === "writing" ? (
              <Button
                onClick={() => isDisble && !isLimited && onSubmit(isReview ? "retake" : isNotNullValue && "submit")}
                className={`${isNotNullValue && isDisble && !isLimited ? "bg-primary2 text-white" : "bg-neu6 text-black cursor-not-allowed"}  lg:mr-[12px]`}
              >
                <div className="flex items-center">
                  <SubmitIcon fill={isNotNullValue && isDisble && !isLimited ? "white" : "black"} />
                  <p className="neu6 ml-[8px] pl-[12px]">{isReview ? "Retake" : "Submit"}</p>
                </div>
              </Button>
            ) : (
              <div className="w-[130px] hidden"></div>
            )}
          </div>

          <div className="flex items-center justify-between relative z-[11]">
            {(part === "writing" && data?.data?.data?.length > 1 && (
              <div className="flex items-center lg:justify-end justify-between w-full lg:mt-0 mt-[12px]">
                <div
                  onClick={() => clickPart("prev")}
                  className={`${
                    partNumberState <= data?.data?.data?.length - 1 && partNumberState !== 0 ? "bg-primary2 text-white" : "bg-neu4 text-black cursor-not-allowed"
                  } mr-[8px]] mr-[6px] cursor-pointer h-[40px] px-[30px] w-fit rounded-full flex items-center`}
                >
                  <div className="flex items-center">
                    <ArrowIcon className="h-5 w-5" fill={partNumberState <= data?.data?.data?.length - 1 && partNumberState !== 0 ? "white" : "black"} />
                    <p className="neu2 ml-[12px] lg:body3 caption">Previous part</p>
                  </div>
                </div>
                <div
                  onClick={() => clickPart("next")}
                  className={`cursor-pointer h-[40px] px-[30px] w-fit rounded-full flex items-center ${
                    isNotNullValue && !isDisble ? "bg-primary2 text-white " : "bg-neu4 text-black"
                  }`}
                >
                  <div className="flex items-center">
                    <p className="neu6 lg:body3 caption">Next part</p>
                    <ArrowIcon className="rotate-180 h-5 w-5 ml-[12px]" fill={isNotNullValue && !isDisble ? "white" : "black"} />
                  </div>
                </div>
              </div>
            )) || <div> </div>}
            {part === "reading" || part === "listening" ? (
              <div className="flex items-center">
                <Button
                  onClick={() => (isLimited ? null : onSubmit(isReview ? "retake" : "submit"))}
                  className={`bg-primary2 text-white mr-[12px] ${isLimited && "cursor-not-allowed"}`}
                >
                  <div className="flex items-center">
                    <SubmitIcon />
                    <p className="neu6 ml-[8px] pl-[12px]">{isReview ? "Retake" : "Submit"}</p>
                  </div>
                </Button>
                {isReview ? (
                  <Button onClick={() => closeScreen()} className=" bg-primary2 text-white">
                    <div className="flex items-center">
                      <CloseIcon className="w-[18px]" />
                      <p className="neu6 ml-[8px] pl-[12px]">Close</p>
                    </div>
                  </Button>
                ) : (
                  <Button onClick={() => onSubmit("review")} className="lg:flex hidden bg-primary2 text-white">
                    <div className="flex items-center">
                      <MapsIcon />
                      <p className="neu6 ml-[8px] pl-[12px]">Review</p>
                    </div>
                  </Button>
                )}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
