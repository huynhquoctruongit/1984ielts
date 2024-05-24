import { useEffect, useState } from "react";
import HeaderUI from "@/components/layouts/course-ui/header";
import FooterUI from "@/components/layouts/course-ui/footer";
import Modal from "@/components/layouts/modal/template";
import Start from "@/components/layouts/modal/start/index";
import Submit from "@/components/layouts/modal/submit/index";
import QuestionUI from "@/components/layouts/question-ui/index";
import useSWR from "swr";
import axiosClient from "@/libs/api/axios-client.ts";
import AxiosController from "@/libs/api/axios-controller.ts";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { wordCountFunc } from "@/services/helper";
import { Spin } from "antd";
import { LimitSubmit } from "@/components/system/check-limit-submit";
import LimitSubmitPopup from "@/components/layouts/modal/limit-submit/index";
import { useAuth } from "@/hook/auth";
import * as amplitude from "@amplitude/analytics-browser";
import { amplitudeSendTrack, getTypeByUrl } from "@/services/amplitude";

const Reading = ({ getLayout }: any) => {
  const [isStart, setStart] = useState(false);
  const [isSubmit, setSubmit] = useState(false);
  const [isLimited, setLimited]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [isLimitedPopup, setLimitedPopup]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [quiz, setQuiz]: any = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [partNumber, setPartNumber] = useState(0);
  const { classId, courseId, sectionId, quizId }: any = useParams();
  const [wordCount, setWordCount] = useState(0);
  const navigate = useNavigate();
  let urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const [writingInput, setWritingInput]: any = useState();
  const [loading, setLoading] = useState(true);
  const [isWaitSubmit, setWaitSubmit]: any = useState(false)

  const { profile } = useAuth();

  const { data: question } = useSWR(`/items/question?fields=*,quiz.*&sort=id&filter[quiz].id=${quizId}`);
  const data = question?.data?.data || [];
  useEffect(() => {
    axiosClient.get(`/items/quiz/${quizId}?fields=*,source.*`).then((res: any) => {
      setQuiz(res?.data?.data || []);
      getLimit(res?.data?.data?.limit_submit || "unlimit");
    });
  }, [loading]);
  const getLimit = async (number: any) => {
    if (number !== "unlimit") {
      const limited = await LimitSubmit(quizId, number);
      setLimited(limited);
      setLimitedPopup(limited);
    } else {
      setLimitedPopup({ isLimit: "unlimit" });
    }
  };
  useEffect(() => {
    axiosClient.get(`/items/class?filter[students][directus_users_id][_eq]=$CURRENT_USER`).then((res: any) => {
      const isHave = res?.data?.data?.some((item: any) => item.id == classId);
      if (isHave) {
        setLoading(false);
      } else {
        AxiosController.get(`/items/class-test/join/${classId}`)
          .then((res: any) => {
            if (res) {
              setLoading(false);
            }
          })
          .catch((err: any) => {
            if (profile?.role?.name == "Teacher") {
              navigate("/teacher");
            } else {
              navigate("/home");
            }
          });
      }
    });
  }, []);
  useEffect(() => {
    getLayout(false);
    if (type !== "review" && (isLimited.isLimit !== null || isLimitedPopup.isLimit == "unlimit")) {
      setStart(true);
    }
  }, [type, isLimited, isLimitedPopup]);
  const onStart = async () => {
    const typeQuiz = getTypeByUrl();
    amplitudeSendTrack(`[${typeQuiz}] Start Quiz`, { class: classId, section: sectionId, quiz: quizId, type: getTypeByUrl() });
    setStart(false);
  };
  const timeUp = () => {
    onSubmit();
  };
  const onSubmit = async () => {
    if (!isWaitSubmit) {
      setWaitSubmit(true)
      const questionRes = await axiosClient.post(`items/answer`, {
        writing: Object.values(writingInput || {}),
        quiz: quizId * 1,
        type: quiz.type * 1,
        class: classId * 1,
        section: sectionId * 1,
        status: "completed",
        summary: {
          left_time: document.getElementById("time-left")?.innerHTML,
        },
      });
      if (questionRes) {
        setWaitSubmit(false)
        const id = questionRes?.data?.data?.id;
        navigate(`${window.location.pathname}/result/${id}`);
      }
    }
  };
  const action = (type: any) => {
    if (type === "submit") {
      setSubmit(true);
    } else if (type === "retake") {
    } else {
    }
  };

  let timeoutId: any = null;
  const handleInputChange = (e: any) => {
    let value = e.target.value;
    clearTimeout(timeoutId);
    setWritingInput({
      ...writingInput,
      [partNumber]: {
        answer: value,
        id: data?.[partNumber]?.id,
      },
    });

    timeoutId = setTimeout(() => {
      setInputValue(value);
    }, 300);
  };
  const getPartNumber = (number: any) => {
    setPartNumber(number);
  };
  useEffect(() => {
    const count = wordCountFunc(writingInput?.[partNumber]?.answer);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setWordCount(count);
    }, 300);
  }, [partNumber, writingInput]);

  quiz["content"] = quiz?.content_writing?.[partNumber]?.part;

  if (!data || data?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center mt-[25%]">
          <Spin />
        </div>
      ) : (
        <div className="w-full content-exam">
          <Modal open={isLimitedPopup.isLimit == "unlimit" ? false : isLimitedPopup.isLimit}>
            <LimitSubmitPopup
              onClose={() => {
                setLimitedPopup({ isLimit: false });
              }}
            />
          </Modal>
          <Modal open={isStart && (!isLimited.isLimit || isLimitedPopup.isLimit == "unlimit")}>
            <Start
              isLimitedPopup={isLimitedPopup}
              isLimited={isLimited}
              onSubmit={onStart}
              onClose={() => {
                setStart(false);
              }}
            />
          </Modal>
          <Modal open={isSubmit}>
            <Submit
              isWaitSubmit={isWaitSubmit}
              onSubmit={onSubmit}
              onClose={() => {
                setSubmit(false);
              }}
            />
          </Modal>
          <HeaderUI part="Writing" title={quiz?.title} />
          <div
            className={`zoomin-content overflow-y-hidden lg:flex items-center  ${quiz?.questions?.length > 1 ? "lg:h-[calc(100vh-133px)] h-[calc(100vh-187px)]" : "h-[calc(100vh-135px)]"
              }`}
          >
            <div className="relative lg:w-[50%] lg:h-[calc(100vh-133px)] h-[50%] overflow-y-scroll">
              <div className="h-[calc(100%-108px)] py-[35px] px-[50px]">
                <QuestionUI data={{ content: data?.[partNumber]?.content_writing }} />
              </div>
            </div>
            <div className="lg:border-[0px] border-[2px] border-neu5 lg:w-[50%] bg-neu7 lg:h-full h-[50%] py-[35px] px-[50px] overflow-y-scroll">
              <p className="headline1 text-primary1">{data?.[partNumber]?.title}</p>
              <p className="body5 mt-[12px]">You have {quiz?.time} minutes to complete this task. The essay will be sent automatically when the time expires.</p>
              {/* <div className="body5 mt-[12px]" dangerouslySetInnerHTML={{ __html: data?.[partNumber]?.description }}></div> */}
              <textarea
                value={writingInput?.[partNumber]?.answer || ""}
                onChange={(e) => handleInputChange(e)}
                className="p-[20px] bg-white w-full h-[350px] rounded-[20px] my-[40px] text-area"
              ></textarea>
              <p className="body3">Word count: {wordCount || 0}.</p>
            </div>
          </div>

          <FooterUI
            timeUp={timeUp}
            inputValue={writingInput}
            isStart={isStart}
            data={question}
            partNumberState={partNumber}
            getPartNumber={getPartNumber}
            part="writing"
            quiz={quiz}
            action={action}
            isLimited={isLimited.isLimit}
          />
        </div>
      )}
    </div>
  );
};
export default Reading;
