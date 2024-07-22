import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeaderUI from "@/components/layouts/course-ui/header";
import FooterUI from "@/components/layouts/course-ui/footer";
import Modal from "@/components/layouts/modal/template";
import Submit from "@/components/layouts/modal/submit/index";
import Retake from "@/components/layouts/modal/retake/index";
import Review from "@/components/layouts/modal/review/index";
import QuestionUI from "@/components/layouts/question-ui/index";
import { Radio, Selection, Checkbox, FillInBlank } from "@/components/data-type";
import { useParams, useLocation } from "react-router-dom";
import ReactDOMServer from "react-dom/server";
import useSWR from "swr";
import { regexFillBlank } from "@/services/helper";
import { AudioPlayerId } from "@/components/ui/audio";
import axiosClient, { AxiosAPI, fetcherClient } from "@/libs/api/axios-client.ts";
import { Spin } from "antd";
import ControlPart from "@/components/layouts/control-parts";

const Reading = ({ getLayout }: any) => {
  const [listUI, setListUI]: any = useState();
  const htmlElementRef = useRef(null);
  const { classId, courseId, sectionId, quizId }: any = useParams();
  const navigate = useNavigate();
  const refAudio: any = useRef();
  let urlParams = new URLSearchParams(window.location.search);
  const answerId = urlParams.get("answerId");
  const type = urlParams.get("type");

  const { data: question } = useSWR(`/items/question?fields=*,quiz.*&sort=order&filter[quiz].id=${quizId}`);

  const [answerListStore, setListAnswerStore]: any = useState([
    {
      answer: {
        title: "",
      },
      correct: false,
      question: "" as any,
    },
  ]);

  const [isSubmit, setSubmit] = useState(false);
  const [isRetake, setRetake] = useState(false);
  const [isReview, setReview] = useState(false);
  const [typeChanged, setTypeChanged] = useState([]);
  const [listAnswer, setListAnswer] = useState([]) as any;
  const [getArray, setArray] = useState([]);
  let arrayList: any = [...getArray] as any;
  const [getArraySelection, setArraySelection] = useState([]);
  const [quiz, setQuiz]: any = useState([]);
  const [indexPart, setIndexPart]: any = useState(0);
  const [uiHTML, setUiHTML]: any = useState("");

  const data = quiz?.parts?.[indexPart]?.questions || [];
  const content = quiz?.parts?.[indexPart]?.content;
  let arrayListSelection: any = [...getArraySelection] as any;

  let sortData = data;
  let location = 0;
  sortData?.map((elm: any, index: any) => {
    if (elm?.type === "FILL-IN-THE-BLANK") {
      const elmFill: any = regexFillBlank(elm?.gap_fill_in_blank);
      sortData[index]["location"] = elmFill?.[0]?.[2];
      location = location + elmFill.length;
    } else if (elm?.type === "MULTIPLE") {
      const getAnswer = elm.mutilple_choice;
      const getCorrectAnswer = getAnswer.filter((elm: any, indexAnswer: any) => elm.correct);

      location = getCorrectAnswer?.length + location;
      sortData[index]["location"] = location;
    } else if (elm?.type === "SINGLE-SELECTION") {
      elm?.selection?.map((elm: any) => {
        location = location + 1;
        sortData[index]["location"] = location;
      });
    } else {
      location = location + 1;
      sortData[index]["location"] = location;
    }
  });

  const regex = /\[\s*([^[\]]+)\s*\]\[(\d+(?:-\d+)?)\]/g;
  const regex2 = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
  var output = [];
  let match;
  let arrMatch: any = [];
  const filter = sortData.filter((elm: any) => {
    if ((match = regex2.exec(content) as any) !== null) {
      arrMatch.push(match[2]);
    }
  });
  const sameLocate = arrMatch.filter((item: any) => /-/.test(item));

  useEffect(() => {
    AxiosAPI.get(`/v1/quizzes/${quizId}${classId ? "?class_id=" + classId : ""}`).then((res: any) => {
      setQuiz(res?.data?.data || []);
    });
  }, []);
  useEffect(() => {
    axiosClient.get(`items/answer?limit=1&filter[quiz].id=${quizId}&filter[id]=${answerId}&sort=-date_created`).then((res: any) => {
      setListAnswerStore(res?.data?.data || []);
    });
  }, [type]);
  useEffect(() => {
    getLayout(false);
  }, []);

  const action = (type: any) => {
    if (type === "submit") {
      setSubmit(true);
    } else if (type === "retake") {
      setRetake(true);
    } else {
      setReview(!isReview);
    }
  };

  const onSubmit = async () => {
    const questionRes = await axiosClient.post(`items/answer`, {
      detail: listAnswer,
      quiz: quizId * 1,
      type: quiz.type * 1,
      class: classId * 1,
      section: sectionId * 1,
      status: "reviewed",
      summary: {
        left_time: document.getElementById("time-left")?.innerHTML,
      },
    });
    navigate(`${window.location.pathname}/result`);
  };

  const onRetake = async () => {
    setRetake(false);
    const pathname = window.location.pathname;
    const replace = pathname.replace("/review", "");
    window.location.href = `${replace}`;
  };
  const getIndexPart = (index: any) => {
    var oldHTML = document.querySelector(`.ui-part-${indexPart}`);
    const renderUI = document.querySelector("#render-ui");
    if (oldHTML) {
      var clone = oldHTML.cloneNode(true);
      setListUI({
        ...listUI,
        [indexPart]: clone,
      });
    }
    setTimeout(() => {
      setIndexPart(index);
    }, 300);
  };

  useEffect(() => {
    const renderUI = document.querySelector("#render-ui");
    if (listUI?.[indexPart]) {
      renderUI.parentNode.replaceChild(listUI?.[indexPart], renderUI);
    }
  }, [indexPart]);
  const RenderUI = () => {
    return (
      <div className="md:py-[35px] md:px-[50px] px-[20px] py-[20px] min-h-full">
        {sortData
          ?.sort((a: any, b: any) => a.order - b.order)
          ?.map((item: any, indexItem: any) => {
            const index = indexItem + 1;
            if (item.type === "SINGLE-RADIO" && item?.single_choice_radio)
              return (
                <Radio
                  key={item.type + indexItem}
                  quiz={quiz}
                  type="listening"
                  sameLocate={sameLocate}
                  review={true}
                  dataItem={item}
                  index={index}
                  data={item?.single_choice_radio}
                  answerListStore={answerListStore}
                  indexPart={indexPart}
                  listAnswer={listAnswer?.[indexPart]}
                />
              );
            if (item.type === "SINGLE-SELECTION" && item?.selection)
              return (
                <Selection
                  key={item.type + indexItem}
                  quiz={quiz}
                  type="listening"
                  sameLocate={sameLocate}
                  review={true}
                  dataItem={item}
                  index={index}
                  option={item?.selection_option}
                  data={item?.selection}
                  answerListStore={answerListStore}
                  indexPart={indexPart}
                  listAnswer={[listAnswer?.[indexPart]]}
                />
              );
            if (item.type === "MULTIPLE" && item?.mutilple_choice)
              return (
                <Checkbox
                  key={item.type + indexItem}
                  quiz={quiz}
                  type="listening"
                  sameLocate={sameLocate}
                  review={true}
                  dataItem={item}
                  index={index}
                  data={item?.mutilple_choice}
                  answerListStore={answerListStore}
                  indexPart={indexPart}
                  listAnswer={[listAnswer?.[indexPart]]}
                />
              );
            if (item.type === "FILL-IN-THE-BLANK" && item?.gap_fill_in_blank)
              return (
                <FillInBlank
                  key={item.type + indexItem}
                  quiz={quiz}
                  type="listening"
                  sameLocate={sameLocate}
                  review={true}
                  dataItem={item}
                  index={index}
                  data={item?.gap_fill_in_blank}
                  answerListStore={answerListStore}
                  indexPart={indexPart}
                  listAnswer={[listAnswer?.[indexPart]]}
                />
              );
          })}
      </div>
    );
  };
  useEffect(() => {
    setTimeout(() => {
      const render = document.getElementById("render-ui");
      setUiHTML(render.innerHTML);
    }, 500);
  }, []);
  if (!data || data?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  return (
    <div className="w-full content-exam">
      <Modal open={isSubmit}>
        <Submit
          onSubmit={onSubmit}
          onClose={() => {
            setSubmit(false);
          }}
        />
      </Modal>
      <Modal open={isRetake}>
        <Retake
          onSubmit={onRetake}
          onClose={() => {
            setRetake(false);
          }}
        />
      </Modal>
      <Modal open={isReview}>
        <Review
          data={sortData}
          listAnswer={listAnswer?.[indexPart]}
          onClose={() => {
            setReview(false);
          }}
        />
      </Modal>
      <HeaderUI part="Listening" title="Listening" />
      <div className="lg:flex items-center h-[calc(100vh-133px)] lg:h-[calc(100vh-133px)] zoomin-content overflow-y-hidden">
        <div className="relative lg:w-[50%] w-full md:h-full h-[50%]" id="screen-question">
          <div className="h-[calc(100%-108px)]">
            {quiz?.listening && (
              <div className="bg-white border-b-[1px] border-neu4 lg:py-[20px] py-[20px] lg:px-[40px] lg:px-[20px] px-[10px] sticky top-0">
                <AudioPlayerId refAudio={refAudio} id={quiz?.listening} />
              </div>
            )}
            <QuestionUI type={"listening"} indexPart={indexPart} idProps="question-note" data={quiz?.parts[indexPart]} className="md:py-[35px] md:px-[50px] px-[20px] py-[20px]" />
          </div>
        </div>
        <div className="lg:w-[50%] w-full bg-neu7 lg:h-full h-[50%] lg:border-0 border-[2px] border-neu5 overflow-y-scroll">
          <RenderUI></RenderUI>
          <ControlPart parts={quiz?.parts} getIndexPart={getIndexPart} />
        </div>
      </div>
      <FooterUI part="listening" quiz={quiz} listAnswer={listAnswer?.[indexPart]} typeChanged={typeChanged} data={sortData} action={action} />
    </div>
  );
};
export default Reading;
