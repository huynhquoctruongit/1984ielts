import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { wordCountFunc } from "@/services/helper";
import axiosClient, { AxiosAPI } from "@/libs/api/axios-client.ts";
import AxiosController from "@/libs/api/axios-controller.ts";

const Writing = () => {
  const [writingInput, setWritingInput]: any = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isWaiting, setWaiting] = useState(false);
  const navigate = useNavigate();
  let timeoutId: any = null;
  const { classId, courseId, sectionId, quizId }: any = useParams();

  const handleInputChange = (e: any) => {
    let value = e.target.value;
    setWritingInput({
      ...writingInput,
      [0]: {
        answer: value,
        id: 0,
      },
    });
    const count = wordCountFunc(value);
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setWordCount(count);
    }, 300);
  };

  const getLink = `/class/${classId}/course/${courseId}/section/${sectionId}/writing-self-practice/${quizId}`;

  let waitSubmit = true;
  const onSubmit = async () => {
    if (waitSubmit && writingInput[0]?.answer) {
      waitSubmit = false;
      const questionRes = await axiosClient.post(`items/answer`, {
        writing: Object.values(writingInput || {}),
        quiz: quizId * 1,
        type: 5,
        class: classId * 1,
        section: sectionId * 1,
        status: "completed",
        summary: {
          left_time: document.getElementById("time-left")?.innerHTML,
        },
      });
      if (questionRes) {
        const questionResChatGPT = await AxiosController.post(`writing/assistant`, {
          answer_id: questionRes?.data?.data?.id,
          writing: Object.values(writingInput || {}),
          quiz: quizId * 1,
          type: 5,
          class: classId * 1,
          section: sectionId * 1,
          status: "completed",
          summary: {
            left_time: document.getElementById("time-left")?.innerHTML,
          },
        });
        checkListAndNavigate(questionRes, questionResChatGPT);
      }
    }
  };
  function checkListAndNavigate(questionRes, questionResChatGPT) {
    if (questionRes && questionResChatGPT) {
      const id = questionRes?.data?.data?.id;
      let timeoutId;
      setWaiting(true);
      function checkAndNavigate() {
        axiosClient.get(`items/answer?limit=1&filter[quiz].id=${quizId}&filter[id]=${id}&fields=*,user_created.*,review.*&sort=-date_created`).then((res: any) => {
          const data = res?.data?.data?.[0];
          if (data.chatgpt) {
            setWaiting(false);
            navigate(`${getLink}/result/${id}`);
            clearTimeout(timeoutId);
          } else {
            setWaiting(true);
            timeoutId = setTimeout(checkAndNavigate, 3000);
          }
        });
      }
      timeoutId = setTimeout(checkAndNavigate, 3000);
    }
  }
  return (
    <div className="h-[94%]">
      <textarea
        value={writingInput[0]?.answer || ""}
        onChange={(e) => handleInputChange(e)}
        className="p-[20px] bg-white w-full h-[150px] md:h-[70%] rounded-[20px] my-[20px] text-area"
        placeholder="Type your essay here...."
      ></textarea>
      <p className="body3">Word count: {wordCount || 0}.</p>
      <div
        onClick={onSubmit}
        className={`${
          isWaiting ? "bg-white cursor-not-allowed" : writingInput[0]?.answer ? "bg-primary1 cursor-pointer" : "bg-neu3 cursor-not-allowed"
        } w-full mt-[30px] px-[12px] py-[8px] body3 rounded-[10px] text-white text-center mr-[12px]`}
      >
        {isWaiting ? (
          <div className="body3 text-primary1 flex items-center mx-auto text-center justify-center">
            <span className="mr-[12px] text-primary1">Loading</span> <img width="30px" src="/images/loading.svg" />
          </div>
        ) : (
          "Submit"
        )}
      </div>
    </div>
  );
};
export default Writing;
