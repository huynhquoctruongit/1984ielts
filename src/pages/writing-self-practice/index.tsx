import { useEffect, useState } from "react";
import HeaderUI from "@/components/layouts/course-ui/header";
import useSWR from "swr";
import axiosClient, { AxiosAPI } from "@/libs/api/axios-client.ts";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { LimitSubmit } from "@/components/system/check-limit-submit";
import QuestionUI from "./question-ui.tsx";
import Writing from "./writing";
import Result from "./result/index";
import AxiosController from "@/libs/api/axios-controller.ts";
import { useAuth } from "@/hook/auth.tsx";

const WritingSelfPractice = ({ getLayout, classUser }: any) => {
  
  const [isStart, setStart] = useState(false);
  const [isLimited, setLimited]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [isLimitedPopup, setLimitedPopup]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [quiz, setQuiz]: any = useState([]);
  const [loading, setLoading] = useState(true);
  const { classId, courseId, sectionId, quizId }: any = useParams();
  const useLoca = useLocation();
  const { profile } = useAuth();

  const navigate = useNavigate();
  let urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");

  const { data: answerdata, mutate } = useSWR("/items/answer" + "?fields=*,user_created.*,review.*&filter[quiz]=" + quizId + "&filter[user_created][_eq]=$CURRENT_USER");
  const listAnswer = answerdata?.data?.data;

  const { data: question } = useSWR(`/items/question?fields=*,quiz.*&sort=id&filter[quiz].id=${quizId}`);
  const data = question?.data?.data || [];

  useEffect(() => {
    axiosClient.get(`/items/quiz/${quizId}?fields=*,source.*,instruction.*,parts.*`).then((res: any) => {
      setQuiz(res?.data?.data || []);
      getLimit(res?.data?.data?.limit_submit || 1);
    });
  }, [loading]);
  useEffect(() => {
    mutate();
  }, [useLoca.pathname]);
  const getLimit = async (number: any) => {
    const limited = await LimitSubmit(quizId, number);
    setLimited(limited);
    setLimitedPopup(limited);
  };
  useEffect(() => {
    getLayout(false);
    if (type !== "review" && isLimited.isLimit !== null) {
      setStart(true);
    }
  }, [type, isLimited]);

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
  const isResult = location.pathname.indexOf("/result") > -1;

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center mt-[25%]">
          <Spin />
        </div>
      ) : (
        <div className="w-full">
          <HeaderUI classUser={classUser} quiz={quiz} listAnswer={listAnswer} part="WritingPractice" title={quiz?.title} />
          <div className={`zoomin-content overflow-y-hidden lg:flex items-center lg:h-[calc(100vh-58px)]`}>
            <div className="relative lg:w-[50%] lg:h-[calc(100vh-58px)] h-full md:h-[50%]">
              <div className="">
                <QuestionUI data={quiz} />
              </div>
            </div>
            <div className="lg:border-[0px] border-[2px] border-neu5 lg:w-[50%] bg-neu7 lg:h-full h-[50%] py-[20px] px-[20px] md:px-[30px] overflow-y-scroll">
              {isResult ? <Result></Result> : <Writing></Writing>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WritingSelfPractice;
