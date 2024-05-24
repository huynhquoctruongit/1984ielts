import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderUI from "@/components/layouts/course-ui/header";
import { StartIcon, GraduateIcon, TimeLeftIcon } from "@/components/icons/index";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import useSWR from "swr";
import axiosClient, { fetcherClient } from "@/libs/api/axios-client.ts";
import { Spin } from "antd";

const Result = ({ getLayout, classUser }: any) => {
  const { quizId } = useParams();
  const { data: question } = useSWR(`/items/question?fields=*,quiz.*&sort=id&filter[quiz].id=${quizId}`);
  const { data: quizRes } = useSWR(`/items/quiz/${quizId}?fields=*,source.*,parts.*,parts.questions.*`);
  const data = question?.data?.data || [];
  const quiz = quizRes?.data?.data;
  const [dataState, setData]: any = useState();
  const [answerListStore, setListAnswerStore]: any = useState([]);
  useEffect(() => {
    getLayout(false);
    axiosClient.get(`items/answer?limit=1&filter[quiz].id=${quizId}&sort=-date_created`).then((res: any) => {
      setListAnswerStore(res?.data?.data || []);
    });
  }, []);
  const answer = answerListStore[0];
  const time = answerListStore[0]?.summary?.left_time;

  let listParts: any = [];
  answer?.detail &&
    Object.keys(answer?.detail).forEach(function (key, index) {
      answer?.detail[key].map((item: any) => {
        listParts.push(item);
      });
    });
  var correct = 0;
  const numberCorrect = listParts?.map((item: any) => {
    if (item.correct === true && item.type !== "MULTIPLE-TYPE") {
      correct = correct + 1;
    }
    if (item.type === "MULTIPLE-TYPE") {
      item?.answer?.title?.map((elm: any) => {
        if (elm.correct === true) {
          correct = correct + 1;
        }
      });
    }
  });
  var time1 = "00:" + quiz?.time + ":00" || "00:20:00";
  var time2 = "00:" + time || "00:20:00";

  const format = "HH:mm:ss";
  const start = dayjs(`1970-01-01T${time1}`);
  const end = dayjs(`1970-01-01T${time2}`);

  let durationObj;

  if (end.isBefore(start)) {
    durationObj = dayjs.duration(start.diff(end));
  } else {
    durationObj = dayjs.duration(end.diff(start));
  }

  const result = dayjs.utc(durationObj.asMilliseconds()).format(format);
  const percent = (correct / dataState?.length) * 100;

  useEffect(() => {
    let listQuestions: any = [];
    quiz?.parts.map((item: any) => {
      item?.questions.map((elm: any) => {
        listQuestions.push(elm);
      });
    });

    let newData: any = [...listQuestions];

    newData?.map((item: any, index: any) => {
      if (item.type === "FILL-IN-THE-BLANK") {
        const regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
        var matches = [...item.gap_fill_in_blank.matchAll(regex)];

        var isCheck = false;

        matches.map((elm: any, index: any) => {
          var words = elm[1].split("|");
          var number = elm[2];
          newData.push({
            id: number * 1,
            location: number * 1,
            words: words,
          });
        });
      }
      if (item.type === "MULTIPLE") {
        const getAnswer = item.mutilple_choice;
        const getCorrectAnswer = getAnswer.filter((elm: any) => elm.correct);
        getCorrectAnswer.map((elm: any, indexAnswer: any) => {
          newData.push({
            id: item.location - indexAnswer,
            location: item.location - indexAnswer,
            words: elm.text,
            type: "MULTIPLE-TYPE",
          });
        });
      }
    });
    for (let index = 0; index < newData.length; index++) {
      const elm = newData[index];
      if (elm.type === "FILL-IN-THE-BLANK" || elm.type === "MULTIPLE") {
        newData.splice(index, 1);
        index--;
      }
    }
    setData(newData);
  }, [quiz]);
  if (!quiz || quiz?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  return (
    <div className="content-exam">
      <HeaderUI classUser={classUser} part="Listening" title={quiz?.title} />
      <div className="max-w-[700px] m-auto p-[20px] zoomin-content overflow-y-hidden">
        <div className="lg:flex items-center">
          <img src="/images/image1.png" className="m-auto w-[250px] lg:w-[390px]" />
          <div className="lg:mt-[65px] mt-[10px]">
            <p className="text-primary1 lg:text-[75.3743px] title font-[900] leading-[94px] text-center lg:text-left">Nice job!</p>
          </div>
        </div>
        <div className="relative lg:mt-[60px] mt-[20px] progress w-full bg-white rounded-[40px] h-[14px]" style={{ boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)" }}>
          <div
            style={{ left: percent ? percent - 3 + "%" : "-20px" }}
            className="box arrow-bottom absolute bottom-[30px] bg-green1 h-[20px] w-[40px] rounded-[20px] text-white flex items-center justify-center caption px-[8px]"
          >
            {percent ? percent.toFixed(0) : 0}%
          </div>
          <div style={{ width: percent + "%" }} className="absolute bg-green1 h-[14px] rounded-[40px]"></div>
        </div>
        <div className="flex">
          <div
            className="w-[50%] h-[165px] lg:h-[220px] rounded-[40px] mr-[12px] mt-[20px] flex items-center justify-center bg-white"
            style={{ boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)" }}
          >
            <div className="text-center m-auto">
              <div className="flex items-center justify-center m-auto w-[68px] h-[68px] bg-neu7 rounded-full mb-[12px]">
                <StartIcon />
              </div>
              <p className="headline1 text-primary1">
                {correct || 0}/{dataState?.length || 0}
              </p>
              <p className="body4 text-black text-center">Correct answers</p>
            </div>
          </div>

          <div
            className="w-[50%] h-[165px] lg:h-[220px] rounded-[40px] mt-[20px] flex items-center justify-center bg-white"
            style={{ boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)" }}
          >
            <div className="text-center m-auto">
              <div className="flex items-center justify-center m-auto w-[68px] h-[68px] bg-neu7 rounded-full mb-[12px]">
                <TimeLeftIcon />
              </div>
              <p className="headline1 text-primary1">{result || "00:00:00"}</p>
              <p className="body4 text-black text-center">Time spent</p>
            </div>
          </div>
        </div>
        <Link to={`${window.location.pathname.replace("/result", "/review") + window.location.search}`}>
          <div className="w-full text-center flex items-center justify-center py-[20px] lg:py-[35.5px] bg-primary1 mt-[20px] rounded-[20px]">
            <p className="headline1 text-white">Score and Explanation</p>
          </div>
        </Link>
      </div>
    </div>
  );
};
export default Result;
