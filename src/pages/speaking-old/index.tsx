import { useEffect, useState } from "react";
import HeaderUI from "@/components/layouts/course-ui/header";
import { Instructions, TestMicro, Exam, Question } from "./step";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient, { AxiosAPI } from "@/libs/api/axios-client.ts";
import Modal from "@/components/layouts/modal/template";
import WarningMicro from "@/components/layouts/modal/warning-micro/index";
import AxiosController from "@/libs/api/axios-controller";
import { Spin } from "antd";
import { useAuth } from "@/hook/auth";
const Speaking = ({ getLayout }: any) => {
  const [quiz, setQuiz]: any = useState([]);
  const [isReady, setReady]: any = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  let urlParams = new URLSearchParams(window.location.search);
  const stepURL: any = urlParams.get("step");
  const { quizId, classId } = useParams();
  const { profile } = useAuth();

  useEffect(() => {
    AxiosAPI.get(`/v1/quizzes/${quizId}${classId ? "?class_id=" + classId : ""}`).then((res: any) => {
      setQuiz(res?.data?.data || []);
    });
  }, [loading]);
  useEffect(() => {
    getLayout(false);
    if (stepURL !== "instructions") {
      navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(
        (stream) => {
          setReady(true);
        },
        (e) => {
          setReady(false);
        },
      );
    } else {
      setReady(true);
    }
  }, [stepURL]);
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
  const Step: any = {
    instructions: <Instructions quiz={quiz} />,
    testmicro: <TestMicro />,
    question: <Question quiz={quiz} />,
    exam: <Exam quiz={quiz} isReady={isReady} />,
  };

  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center mt-[25%]">
          <Spin />
        </div>
      ) : (
        <div className="content-exam">
          <Modal open={isReady == false}>
            <WarningMicro />
          </Modal>
          <HeaderUI part="Speaking" title={quiz?.title} />
          <div className={`overflow-x-hidden overflow-y-auto ${stepURL === "instructions" || stepURL == "testmicro" ? "" : "h-[calc(100vh-133px)]"}`}>{Step[stepURL]}</div>
        </div>
      )}
    </div>
  );
};
export default Speaking;
