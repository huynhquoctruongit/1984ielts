import React, { useEffect, useState, useRef } from "react";
import { MicroIcon, PlayIcon, NextIcon, SubmitIcon, RefeshIcon } from "@/components/icons/index";
import Button from "@/components/ui/button/index";
import CustomPlayer from "../../listening/customPlayer";
import axiosClient, { AxiosAPI } from "@/libs/api/axios-client.ts";
import { useParams, useNavigate } from "react-router-dom";
import ThinkPass from "@/components/layouts/modal/skip-think/index";
import Modal from "@/components/layouts/modal/template";
import Start from "@/components/layouts/modal/start/index";
import FooterUI from "@/components/layouts/course-ui/footer";
import { convertTimeToFormat } from "@/services/helper";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { Spin } from "antd";
import AudioRecorder from "audio-recorder-polyfill";
import mpegEncoder from "audio-recorder-polyfill/mpeg-encoder";
import LimitSubmitPopup from "@/components/layouts/modal/limit-submit/index";
import { LimitSubmit } from "@/components/system/check-limit-submit";
import { useToast } from "@/context/toast";
import { useAuth } from "@/hook/auth";

AudioRecorder.encoder = mpegEncoder;
AudioRecorder.prototype.mimeType = "audio/mpeg";
window.MediaRecorder = AudioRecorder;

export const Exam = ({ quiz, isReady }: any) => {
  const [isLimited, setLimited]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [isLimitedPopup, setLimitedPopup]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const { classId, courseId, sectionId, quizId }: any = useParams();
  const [time, setTime]: any = useState(null) as any;
  const [isThinkPass, setThinkPass]: any = useState(false) as any;
  const [timeDown, setTimeDown]: any = useState(0) as any;
  const [timeDownPart, setTimeDownPart]: any = useState(0) as any;
  const [waitSubmit, setWaitSubmit]: any = useState(false) as any;
  const [audioResult, setAudioResult]: any = useState(null) as any;
  const [isTimeUp, setTimeUp]: any = useState(true) as any;
  const [isRec, setRec]: any = useState(null) as any;
  const [audioUrl, setAudioUrl]: any = useState(null);
  const [isStart, setStart] = useState(true);
  const { profile } = useAuth();
  const [questionQuiz, setQuestion]: any = useState({
    questionNumber: 0,
  });
  const [part, setPart]: any = useState({
    status: false,
    partNumber: 0,
  });
  const { fail }: any = useToast()

  const getPart = quiz?.parts?.[part.partNumber];
  const getQuestion = getPart?.questions?.[questionQuiz.questionNumber];

  const isNextQuestion = questionQuiz?.questionNumber < getPart?.questions?.length && isTimeUp;
  const isNextPart = questionQuiz?.questionNumber + 1 > getPart?.questions?.length || !isTimeUp;
  const isSubmit = quiz?.parts?.length == part.partNumber + 1;
  const isResume = questionQuiz.questionNumber !== 0;
  const isContinuteTime = questionQuiz.questionNumber !== 0;

  const navigate = useNavigate();
  const intervalRef: any = useRef(null);
  const refCount: any = useRef(null);
  const refCurrentTime: any = useRef(null);
  let recorder: any = useRef(null);

  function countdownToThink() {
    let seconds = getQuestion?.time_to_think || 5;
    let secondsMinus = seconds - 1;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const hours = Math.floor(secondsMinus / 3600);
      const minutes = Math.floor((secondsMinus % 3600) / 60);
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = (secondsMinus % 60).toString().padStart(2, "0");
      const countdownOutput = `${formattedMinutes}:${formattedSeconds}`;
      const timeLeftId = window.document.getElementById("countdown-time")!;

      if (timeLeftId !== null && countdownOutput && countdownOutput !== "NaN:NaN") {
        if (timeLeftId) {
          timeLeftId.innerHTML = countdownOutput;
        }
      }
      if (secondsMinus === 0) {
        clearInterval(intervalRef.current);
        setRec(true);
        setThinkPass(false);
      }

      secondsMinus--;
    }, 1000);
  }
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      (stream) => {
        recorder.current = new MediaRecorder(stream);
        recorder.current.addEventListener("dataavailable", (e) => {
          const blob = new Blob([e.data], { type: "audio/mpeg" });
          setAudioResult(blob);
        });
        recorder?.current?.start();
      },
      (e) => {
        setPart({
          ...part,
          status: false,
        });
        setRec(false);
        clearInterval(intervalRef.current);
        recorder?.current?.stop();
      },
    );
  };

  const pauseRecording = () => {
    recorder?.current?.pause();
  };
  const resumeRecording = () => {
    recorder?.current?.resume();
  };
  const stopRecording = () => {
    recorder?.current?.stop();
    recorder?.current?.stream.getTracks().forEach((i) => i.stop());
  };
  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);
  useEffect(() => {
    getLimit(quiz?.limit_submit || "unlimit");
  }, [quiz]);
  const getLimit = async (number: any) => {
    if (number !== "unlimit") {
      const limited = await LimitSubmit(quizId, number);
      setLimited(limited);
      setLimitedPopup(limited);
    } else {
      setLimitedPopup({ isLimit: "unlimit" });
    }
  };

  const sendTracking = (type: any) => {
    const params: any = {
      "object_id": quizId * 1,
      "object_type": 2,
      "action_type": type === "view" ? 1 : 4,
      "data": {
        "skill": "speaking"
      }
    }
    AxiosAPI.post(`/v1/students/${profile?.id}/activities`, params).then((res: any) => {
    });
  }

  const returnTime = (temp: any) => {
    const output: any = {};
    quiz?.parts?.map((dataItem) => {
      let newArr = [...dataItem?.questions];
      newArr.map((elm) => {
       
        return (elm["time_start"] = temp[elm.id]);
      });
      let cumulativeTimeStart = 0;
      let cumulativeTimeEnd = 0;

      newArr.map((elm) => {
        if (!temp[elm.id]) return
        const timeData = elm;
        const timeStart = cumulativeTimeEnd;
        const timeEnd = timeStart + timeData?.time_start?.time_start;

        output[elm.id] = {
          time_start: timeStart + 1,
          time_finish: timeEnd,
        };

        cumulativeTimeStart = timeStart;
        cumulativeTimeEnd = timeEnd;
      });

    })
    return output;
  };
  const onSubmit = async () => {
    if (waitSubmit == true) return;
    if (typeof (audioUrl) == "object") {
      setWaitSubmit(true);
      sendTracking("submit")
      const filePosts = await Promise.all(
        Object.keys(audioUrl).map(async (elm, index) => {
          const formData = new FormData();
          formData.append("folder", "2551f0a9-a9e5-42eb-9fe1-283a445f0b61");
          formData.append("file", audioUrl[elm]?.blob);
          const response = await axiosClient.post("/files", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response?.data?.data?.id;
        }),
      );

      if (filePosts?.length > 0) {
        const params: any = [];
        Object.keys(time).forEach(function (key, index) {
          const arrayTime = returnTime(time[key]);
          const anwser = {
            answer: { file_id: filePosts[index], part_id: quiz?.parts?.[index]?.id, questions: arrayTime, question: quiz?.title },
          };
          params.push(anwser);
        });
        const questionRes = await axiosClient.post(`items/answer`, {
          detail: params,
          type: quiz.type * 1,
          status: "completed",
          quiz: quizId * 1,
          class: classId * 1,
          section: sectionId * 1,
        });

        if (questionRes) {
          const id = questionRes?.data?.data?.id;
          setWaitSubmit(false);
          navigate(`${window.location.pathname}/result/${id}`);
        }
      }
    } else {
      fail("Hệ thống không ghi nhận được file ghi âm của bạn. Vui lòng kiểm tra lại phân quyền micro và sử dụng trình duyệt Chrome để có trải nghiệm tốt nhất!")
    }
  };

  const onNextPart = () => {
    setQuestion({ questionNumber: 0 });
    setPart({
      status: false,
      partNumber: part.partNumber + 1,
    });
    setTimeout(() => {
      setRec(false);
    }, 100);
  };
  let indexQuestion = questionQuiz.questionNumber;
  const onNextQuestion = () => {
    setRec(false);
    indexQuestion = indexQuestion + 1;
    setQuestion({
      questionNumber: indexQuestion,
    });

    if (indexQuestion != getPart?.questions?.length) {
      setTimeout(() => {
        setRec(false);
        countdownToThink();
      }, 100);
    }
  };
  useEffect(() => {
    if (isRec) {
      setTime({
        ...time,
        [part.partNumber]: {
          ...(time?.[part.partNumber] || {}),
          [getQuestion?.id]: {
            time_start: timeDown,
          },
        },
      });
    }
  }, [questionQuiz, part, isRec, timeDown, getQuestion]);

  useEffect(() => {
    if (isRec) {
      if (isResume) {
        resumeRecording();
      } else {
        startRecording();
      }
    } else {
      if (isNextQuestion) {
        pauseRecording();
      } else {
        stopRecording();
      }
    }
  }, [isRec, isNextQuestion, isResume]);
  const transBlobFile = async (url: any) => {
    if (url) {
      try {
        const response = await fetch(url);
        const blobData = await response.blob();
        return blobData;
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    }
    return null; // Trả về null nếu không có URL hoặc có lỗi
  };
  useEffect(() => {
    if (audioResult) {
      setAudioUrl({
        ...audioUrl,
        [part.partNumber]: {
          blob: audioResult,
        },
      });
    }
  }, [audioResult]);

  useEffect(() => {
    var timeCount = 0;
    let countdown = getPart?.time * 60 || 30;
    if (isRec) {
      refCount.current = setInterval(function () {
        countdown = --countdown <= 0 ? countdown : countdown;
        timeCount = ++timeCount;
        refCurrentTime.current = countdown;
        setTimeDown(timeCount);
        if (countdown === 1) {
          stopRecording();
          clearInterval(refCount.current);
        }
      }, 1000);
    } else {
      clearInterval(refCount.current);
    }
    setTimeDownPart(countdown);
    return () => {
      clearInterval(refCount.current);
    };
  }, [getPart?.time, isRec]);
  const urlAudio = audioUrl?.[part.partNumber]?.blob && URL.createObjectURL(audioUrl?.[part.partNumber]?.blob);
  const sizeInBytes = audioUrl?.[part.partNumber]?.blob.size;
  const onSkip = () => {
    clearInterval(intervalRef.current);
    setRec(true);
    setThinkPass(false);
  };

  const timeUp = () => {
    setTimeUp(false);
    setRec(false);
    clearInterval(refCount.current);
    clearInterval(intervalRef.current);
  };

  const partTime = {
    id: getPart?.id,
    time: getPart?.time,
  };

  const onResetPart = () => {
    const leftTime = document.getElementById("time-left") as any;
    if (leftTime) {
      leftTime.innerHTML = convertTimeToFormat(getPart?.time);
    }
    setQuestion({ questionNumber: 0 });
    setPart({
      status: false,
      partNumber: part.partNumber,
    });
    setAudioUrl({
      ...audioUrl,
      [part.partNumber]: {
        blob: "",
      },
    });
  };

  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  if (waitSubmit)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  return (
    <div className="lg:p-0 p-[20px]">
      <Modal open={isStart && isLimited.isLimit == false}>
        <Start
          isLimited={isLimited}
          onSubmit={() => {
            setStart(false);
          }}
          onClose={() => {
            setStart(false);
          }}
        />
      </Modal>
      <Modal open={isLimitedPopup.isLimit == "unlimit" ? false : isLimitedPopup.isLimit}>
        <LimitSubmitPopup
          onClose={() => {
            setLimitedPopup({ isLimit: false });
          }}
        />
      </Modal>
      <Modal open={isThinkPass}>
        <ThinkPass
          onSubmit={() => onSkip()}
          onClose={() => {
            setThinkPass(false);
          }}
        />
      </Modal>
      <div className="max-w-[800px] m-auto text-left lg:mt-[50px] zoomin-content overflow-y-hidden h-[calc(100vh-147px)] md:h-[calc(100vh-173px)]">
        {part?.status == false ? (
          <div>
            <div className="bg-primary1 rounded-[20px] h-[63px] relative flex items-center justify-between">
              <p className="lg:body1 caption font-bold w-fit text-white m-auto mx-[15px] lg:my-0 my-[5px] pl-[15px]">{getPart?.title}</p>
              <div className="relative z-[1] h-full flex items-center justify-end text-center mr-[12px]">
                <div
                  onClick={() => {
                    !isLimited.isLimit && isReady && countdownToThink();
                    !isLimited.isLimit &&
                      isReady &&
                      setPart({
                        ...part,
                        status: true,
                      });
                    !isLimited.isLimit && isReady && setTimeUp(true);
                  }}
                  className={`${isLimited.isLimit && !isReady ? "cursor-not-allowed" : "cursor-pointer"
                    } bg-primary2 text-white h-[40px] px-[20px] w-fit rounded-full flex items-center whitespace-nowrap body3`}
                >
                  Start now <PlayIcon className="ml-[8px]"></PlayIcon>
                </div>
              </div>
            </div>
            <div className="bg-neu7 block md:flex justify-center items-center min-h-[400px] max-h-[60vh] box-border rounded-[20px] mt-[11px] p-[50px] overflow-auto">
              <div className="content-cms" dangerouslySetInnerHTML={{ __html: getPart?.content }}></div>
            </div>
          </div>
        ) : (
          <div>
            <div
              className={`bg-primary1 rounded-[20px] h-[63px] relative flex ${isNextPart && urlAudio && sizeInBytes ? "flex items-center justify-between" : "flex items-center justify-between"
                }`}
            >
              {isNextPart && urlAudio && sizeInBytes && (
                <div
                  className="relative z-[1] hidden bg-primary2 text-white cursor-pointer h-[40px] ml-[12px] px-[20px] w-fit rounded-full lg:flex items-center whitespace-nowrap body3"
                  onClick={() => onResetPart()}
                >
                  <span className="mr-[5px]">Reset this part</span>
                  <RefeshIcon className="ml-[5px] w-[18px]" />
                </div>
              )}
              <div className={`${isNextPart && urlAudio && sizeInBytes ? "w-full flex items-center" : "w-fit"} lg:h-full my-auto top-[20px] left-0`}>
                <p
                  style={{ margin: `${isNextPart && urlAudio && sizeInBytes ? "auto" : "0 15px 0 15px"}` }}
                  className={`${isNextPart && urlAudio && sizeInBytes
                    ? "lg:body1 caption font-bold max-w-[400px] text-center line-clamp-1"
                    : "text-left lg:body1 caption font-bold ml-[15px] flex lg:items-center h-full"
                    } text-white lg:mr-0 mr-[5px]`}
                >
                  {getPart?.title}
                </p>
              </div>
              {/* <p className="lg:h-full w-full lg:headline2 body5 font-bold text-white lg:text-center lg:absolute m-auto text-left  m-auto top-[18px] ml-[15px] lg:ml-0">{getPart?.title}</p> */}
              <div className="relative z-[1] h-full flex items-center ml-auto justify-end text-center mr-[12px]">
                <Button className="bg-primary2 text-white cursor-pointer h-[40px] px-[20px] w-fit rounded-full flex items-center whitespace-nowrap body3">
                  <div className="">
                    {!isRec && !isNextPart && (
                      <div onClick={() => setThinkPass(true)}>
                        <span className="mr-[5px] lg:body3 caption">Time to think</span>
                        <span className="font-bold">(</span>
                        <span className="font-bold" id="countdown-time">
                          00:00
                        </span>
                        <span className="font-bold">)</span>
                      </div>
                    )}
                    {isNextQuestion && isRec && (
                      <div className="flex items-center" onClick={() => onNextQuestion()}>
                        <span className="mr-[5px] lg:body3 caption">Next question</span>
                        <NextIcon />
                      </div>
                    )}
                  </div>
                  {/* && audioUrl && Object.keys(audioUrl)?.length != data?.length && */}
                  {isNextPart && !isRec && !isSubmit && (
                    <div onClick={() => onNextPart()} className="flex items-center">
                      <span className="mr-[5px]">Next part</span>
                      <NextIcon />
                    </div>
                  )}
                  {isSubmit && !isRec && !isNextQuestion && (
                    <div onClick={onSubmit} className="flex items-center">
                      <span className="mr-[5px]">Submit test</span>
                      <SubmitIcon />
                    </div>
                  )}
                </Button>
              </div>
            </div>
            <div className="relative bg-neu7 min-h-[400px] rounded-[20px] mt-[11px] lg:px-[50px] px-[10px] py-[50px] overflow-auto">
              <audio controls className={`audio-element hide audio-element-block`}></audio>
              {isRec && !audioUrl?.[part]?.blob && (
                <div className="absolute right-[15px] top-[15px] bg-white rounded-[20px] p-[9px] flex items-center">
                  <div className="bg-primary2 w-[20px] h-[20px] rounded-full mr-[12px] blink-rec"></div>
                  <p className="body4 text-primary1">Recording</p>
                </div>
              )}
              {isNextPart && urlAudio && sizeInBytes ? (
                <div>
                  <p className="lg:headline1 body1 text-primary2 mb-[20px] text-center">It’s the end of part {part.partNumber + 1}</p>
                  <p className="lg:body2 body5 text-center">You can review your recording by clicking the Play button below</p>
                </div>
              ) : (
                <p className="lg:headline1 body1 text-primary2 my-[12px] text-center">Question {questionQuiz.questionNumber + 1}</p>
              )}
              <div className="lg:body1 body3 text-center content-cms" dangerouslySetInnerHTML={{ __html: getQuestion?.title }}></div>
              <div className="my-[20px] content-cms" dangerouslySetInnerHTML={{ __html: getQuestion?.description }}></div>
              {(isNextPart && urlAudio && sizeInBytes && (
                <div className="bg-white w-full m-auto bg-neu7 lg:px-[35px] px-[12px] py-[22px] rounded-[20px]">
                  <CustomPlayer type="review" className="audio-speaking" isStart={isRec} size={sizeInBytes} src={urlAudio} />
                </div>
              )) || (
                  <div id="countdown" className={`flex justify-center ${isRec ? "pulse" : ""}`}>
                    <CountdownCircleTimer size={90} strokeWidth={6} duration={timeDownPart} isPlaying={isRec} colors={brand ? "#164675" : "#164675"}>
                      {({ remainingTime }) => <MicroIcon className="fill-primary1" fill={brand ? "#164675" : "#164675"} />}
                    </CountdownCircleTimer>
                  </div>
                )}
              {isNextPart && urlAudio && sizeInBytes && (
                <div>
                  <div className="mt-[20px]">
                    <p className="lg:body2 body5 text-center">
                      You can click <strong>Next part</strong> to finish the test <br /> or <strong>Reset this part</strong> to record again
                    </p>
                  </div>
                  <div
                    className="mx-auto my-[20px] text-center lg:hidden bg-primary2 text-white cursor-pointer h-[40px] px-[20px] w-fit rounded-full flex items-center justify-center whitespace-nowrap body3"
                    onClick={() => onResetPart()}
                  >
                    <span className="mr-[5px]">Reset this part</span>
                    <RefeshIcon className="ml-[5px] w-[18px]" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <FooterUI startTime={isRec} timeUp={timeUp} isContinuteTime={isContinuteTime} part="speaking" quiz={partTime} />
    </div>
  );
};

