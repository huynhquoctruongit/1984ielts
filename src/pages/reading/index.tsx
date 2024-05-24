import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderUI from "@/components/layouts/course-ui/header";
import FooterUI from "@/components/layouts/course-ui/footer";
import Modal from "@/components/layouts/modal/template";
import Submit from "@/components/layouts/modal/submit/index";
import Retake from "@/components/layouts/modal/retake/index";
import LimitSubmitPopup from "@/components/layouts/modal/limit-submit/index";
import Start from "@/components/layouts/modal/start/index";
import Review from "@/components/layouts/modal/review/index";
import QuestionUI from "@/components/layouts/question-ui/index";
import { Radio, Selection, Checkbox, FillInBlank } from "@/components/data-type";
import { useParams } from "react-router-dom";
import { regexFillBlank, endcodeUTF8, replaceSpace } from "@/services/helper";
import axiosClient, { AxiosAPI } from "@/libs/api/axios-client.ts";
import { Spin } from "antd";
import ControlPart from "@/components/layouts/control-parts";
import { LimitSubmit } from "@/components/system/check-limit-submit";
import AxiosController from "@/libs/api/axios-controller.ts";
import { useAuth } from "@/hook/auth";
import amplitude, { getTypeByUrl } from "@/services/amplitude";
import TrackingTimeOnPage from "@/components/tracking/time-on-page";
import { RightArrowIcon } from "@/components/icons";
// import OrderPayment from "../course/lessons/order-payment";

const Reading = ({ getLayout, classUser }: any) => {
  const { classId, sectionId, quizId }: any = useParams();
  const navigate = useNavigate();
  let urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const answerId = urlParams.get("answerId");
  const [isLimited, setLimited]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [isLimitedPopup, setLimitedPopup]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [listUI, setListUI]: any = useState();
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const [answerListStore, setListAnswerStore]: any = useState([
    {
      answer: {
        title: "",
      },
      correct: false,
      question: "" as any,
      location: "" as any,
    },
  ]);

  const [isStart, setStart] = useState(false);
  const [isSubmit, setSubmit] = useState(false);
  const [isRetake, setRetake] = useState(false);
  const [isReview, setReview] = useState(false);
  const [disableMulti, setDisableMulti] = useState(false);
  const [typeChanged, setTypeChanged] = useState([]);
  const [listAnswer, setListAnswer] = useState() as any;
  const [getArray, setArray] = useState([]);
  let arrayList: any = [...getArray] as any;
  const [getArraySelection, setArraySelection] = useState([]);
  const [quiz, setQuiz]: any = useState([]);
  const [indexPart, setIndexPart]: any = useState(0);
  const [noteParams, setNoteParams]: any = useState([]);
  const [isWaitSubmit, setWaitSubmit]: any = useState(false)

  let arrayListSelection: any = [...getArraySelection] as any;

  const data = quiz?.parts?.[indexPart]?.questions || [];
  const content = quiz?.parts?.[indexPart]?.content;

  let sortData: any = data;

  let location: any = 0;

  sortData?.map((elm: any, index: any) => {
    if (elm?.type === "FILL-IN-THE-BLANK") {
      const string = endcodeUTF8(elm?.gap_fill_in_blank);
      const elmFill: any = regexFillBlank(string);
      sortData[index]["location"] = elmFill?.[0]?.[2];
      location = location + elmFill.length;
    } else if (elm?.type === "MULTIPLE") {
      const getAnswer = elm.mutilple_choice;
      const getCorrectAnswer = getAnswer.filter((elm: any, indexAnswer: any) => elm.correct);

      location = getCorrectAnswer?.length + location;
      sortData[index]["location"] = location;
    } else if (elm?.type === "SINGLE-SELECTION") {
      elm?.selection?.map((item: any) => {
        location = location + 1;
        sortData[index]["location"] = elm?.order;
      });
    } else {
      location = location + 1;
      sortData[index]["location"] = location;
    }
  });

  const regex2 = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
  let match;
  let arrMatch: any = [];

  const sameLocate = arrMatch.filter((item: any) => /-/.test(item));


  useEffect(() => {
    axiosClient.get(`/items/quiz/${quizId}?fields=*,source.*,explain.*,course.*,parts.*,parts.explanation.*,parts.questions.*`).then((res: any) => {
      setQuiz(res?.data?.data || []);
      getLimit(res?.data?.data?.limit_submit || "unlimit");
    });
  }, []);
  // useEffect(() => {
  //   if (profile?.role?.name != "Teacher") {
  //     axiosClient.get(`/items/class?filter[students][directus_users_id][_eq]=$CURRENT_USER`).then((res: any) => {
  //       const isHave = res?.data?.data?.some((item: any) => item.id == classId);
  //       if (isHave) {
  //         setLoading(false);
  //       } else {
  //         AxiosController.get(`/items/class-test/join/${classId}`)
  //           .then((res: any) => {
  //             if (res) {
  //               setLoading(false);
  //             }
  //           })
  //           .catch((err: any) => {
  //             navigate("/home");
  //           });
  //       }
  //     });
  //   } else {
  //     setLoading(false);
  //   }
  // }, []);

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
    if (type === "review") {
      axiosClient.get(`/items/answer?limit=1&filter[id]=${answerId}`).then((res: any) => {
        setListAnswerStore(res?.data?.data || []);
      });
    }
  }, [type]);
  useEffect(() => {
    getLayout(false);
    if (type !== "review" && (isLimited.isLimit !== null || isLimitedPopup.isLimit == "unlimit")) {
      setStart(true);
    }
  }, [type, isLimited, isLimitedPopup]);

  const getIndexPart = (index: any) => {
    var oldHTML = document.querySelector(`.ui-part-${indexPart}`);
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
    getIndexPart(indexPart);
  }, [isSubmit]);

  useEffect(() => {
    const renderUI = document.querySelector("#render-ui");
    if (listUI?.[indexPart]) {
      renderUI.parentNode.replaceChild(listUI?.[indexPart], renderUI);
    }
  }, [indexPart]);

  const action = (type: any) => {
    if (type === "submit") {
      setSubmit(true);
    } else if (type === "retake") {
      setRetake(true);
    } else {
      setReview(!isReview);
    }
  };
  const changed = (item: any, dataItem: any, type: any, correct: any) => {
    if (type === "radio") {
      const isHave = listAnswer?.[indexPart]?.filter((render: any) => render.location === dataItem.order);
      if (!isHave || isHave.length === 0) {
        if (listAnswer?.[indexPart]) {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              ...listAnswer?.[indexPart],
              {
                answer: {
                  title: [item] || "",
                },
                correct: correct,
                question: dataItem?.id || "",
                location: dataItem?.order,
                id_question: dataItem?.id
              },
            ],
          });
        } else {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              {
                answer: {
                  title: [item] || "",
                },
                correct: correct,
                question: dataItem?.id || "",
                location: dataItem?.order,
                id_question: dataItem?.id
              },
            ],
          });
        }
      } else {
        let arrNew = [...(listAnswer?.[indexPart] || [])] as any;
        arrNew.map((arrayItem: any, index: any) => {
          if (arrayItem.location === dataItem.order) {
            arrNew[index].answer.title = [item];
            arrNew[index].location = dataItem?.order;
            arrNew[index].correct = correct;
          }
        });
        setListAnswer({
          ...listAnswer,
          [indexPart]: arrNew,
        });
      }
    }
    if (type === "checkbox") {
      const isHave = listAnswer?.[indexPart]?.filter((render: any) => render.question === dataItem.id);
      const dataItemIndex = arrayList.findIndex((element: any) => Object.keys(element)[0] == dataItem.id);

      if (dataItemIndex !== -1) {
        arrayList[dataItemIndex][dataItem.id].list.push(item);
      } else {
        const newItem = {
          [dataItem.id]: {
            list: [item],
          },
        };
        arrayList.push(newItem);
      }
      setArray(arrayList);
      if (!isHave || isHave.length === 0) {
        if (listAnswer?.[indexPart]) {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              ...listAnswer?.[indexPart],
              {
                answer: {
                  title: [item],
                },
                correct: item.correct ? true : false,
                question: dataItem?.id || "",
                location: dataItem.order,
                id_question: dataItem?.id,
                type: "MULTIPLE-TYPE",
              },
            ],
          });
        } else {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              {
                answer: {
                  title: [item],
                },
                correct: item.correct ? true : false,
                question: dataItem?.id || "",
                location: dataItem.order,
                id_question: dataItem?.id,
                type: "MULTIPLE-TYPE",
              },
            ],
          });
        }
      } else {
        let arrNew = [...(listAnswer?.[indexPart] || [])] as any;
        const filter = arrNew.filter((arrayItem: any, index: any) => {
          return arrayList.filter((elm: any) => {
            if (arrayItem.question == dataItem.id) {
              if (elm?.[dataItem.id]) {
                arrNew[index].answer.title = elm?.[dataItem.id]?.list;
                return (arrNew[index].answer.title = elm?.[dataItem.id]?.list);
              }
            }
          });
        });

        if (arrNew) {
          let arr = filter.find((elm: any) => elm.question == dataItem.id)?.answer.title;
          var countMap: any = {};

          arr.forEach(function (item: any) {
            var text = item.text;
            if (countMap[text]) {
              countMap[text]++;
            } else {
              countMap[text] = 1;
            }
          });

          var filteredArr = arr.filter(function (item: any) {
            var text: any = item.text;
            return countMap[text] % 2 !== 0;
          });
          var uniqueTexts: any = new Set();

          var filteredArr = filteredArr.filter(function (item: any) {
            if (!uniqueTexts.has(item.text)) {
              uniqueTexts.add(item.text);
              return true;
            }
            return false;
          });

          arrNew.filter((arrayItem: any, index: any) => {
            if (arrayItem.question === dataItem.id) {
              return (arrNew[index].answer.title = filteredArr);
            }
          });

          var isCheck = true;
          dataItem.mutilple_choice.filter((data: any) => {
            filteredArr.map((arrItem: any) => {
              if (data.text === arrItem) {
                if (!data.correct) {
                  isCheck = false;
                }
              }
            });
          });
          arrNew.filter((arrayItem: any, index: any) => {
            if (arrayItem.question === dataItem.id) {
              arrayItem.correct = isCheck;
            }
          });
          setListAnswer({
            ...listAnswer,
            [indexPart]: arrNew,
          });
        }
      }
    }
    if (type === "selection") {
      const isHave = listAnswer?.[indexPart]?.filter((render: any) => render.question === dataItem.id);
      const temp = item;
      temp["id"] = dataItem.id;
      arrayListSelection.push(temp);
      setArraySelection(arrayListSelection);
      const find = arrayListSelection.find((elm: any) => elm.id == dataItem.id);
      if (!isHave || isHave.length === 0) {
        if (listAnswer?.[indexPart]) {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              ...listAnswer?.[indexPart],
              {
                answer: {
                  title: [find],
                },
                correct: dataItem.selection[0].answer === item.answer ? true : false,
                question: dataItem?.id || "",
                location: dataItem?.location,
                id_question: dataItem?.id
              },
            ],
          });
        } else {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              {
                answer: {
                  title: [find],
                },
                correct: dataItem.selection[0].answer === item.answer ? true : false,
                question: dataItem?.id || "",
                location: dataItem?.location,
                id_question: dataItem?.id
              },
            ],
          });
        }
      } else {
        let arrNew = [...(listAnswer?.[indexPart] || [])] as any;
        const filter = arrNew.filter((arrayItem: any, index: any) => {
          if (arrayItem.question === dataItem.id) {
            arrNew[index].answer.title = [find];
            return (arrNew[index].answer.title = [find]);
          }
        });
        arrNew.map((arrayItem: any, index: any) => {
          if (arrayItem.question === dataItem.id) {
            let arr = filter[0].answer.title;

            const indexesToRemove = [];
            for (let i = 0; i < arr.length; i++) {
              if (arr[i].text === item.text) {
                indexesToRemove.push(i);
              }
            }

            // Loại bỏ các mục có chỉ mục tương ứng trong indexesToRemove
            for (let i = indexesToRemove.length - 1; i >= 0; i--) {
              arr.splice(indexesToRemove[i], 1);
            }
            arr.push(item);

            arrNew[index].answer.title = arr;
            var isCheck = true;
            dataItem.selection.map((data: any) => {
              arr.map((elm: any) => {
                if (dataItem.id == elm.id && data.text === elm.text) {
                  if (data.answer !== elm.answer) {
                    isCheck = false;
                  }
                }
              });
            });
            arrNew.filter((arrayItem: any, index: any) => {
              if (arrayItem.question === dataItem.id) {
                arrayItem.correct = isCheck;
              }
            });
            setListAnswer({
              ...listAnswer,
              [indexPart]: arrNew,
            });
          }
        });
      }
    }
    if (type === "fill-in-blank") {
      const regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
      const string = endcodeUTF8(dataItem?.gap_fill_in_blank);
      var matches = [...string.matchAll(regex)];
      var isCheck = false;
      matches.map((elm: any, index: any) => {
        var words = elm[1].split("|");
        var number = elm[2];
        if (number == item?.id) {
          words.map((element: any) => {
            if (replaceSpace(element)?.toLowerCase() == replaceSpace(item?.text)?.toLowerCase()) {
              isCheck = true;
            }
          });
        }
      });
      var isSet = true;

      let arrNew = [...(listAnswer?.[indexPart] || [])] as any;

      const isHave = listAnswer?.[indexPart]?.filter((render: any) => render.question == item.id);
      if (!isHave || isHave?.length === 0) {
        if (listAnswer?.[indexPart]) {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              ...listAnswer?.[indexPart],
              {
                answer: {
                  title: [item.text] || "",
                },
                type: "FILL_IN_THE_BLANK",
                correct: isCheck,
                question: item?.id * 1 || "",
                id_question: dataItem?.id
              },
            ],
          });
        } else {
          setListAnswer({
            ...listAnswer,
            [indexPart]: [
              {
                answer: {
                  title: [item.text] || "",
                },
                type: "FILL_IN_THE_BLANK",
                correct: isCheck,
                question: item?.id * 1 || "",
                id_question: dataItem?.id
              },
            ],
          });
        }
      } else {
        let arrNew = [...(listAnswer?.[indexPart] || [])] as any;
        const filter = arrNew.map((arrayItem: any, index: any) => {
          if (arrayItem.question == item.id) {
            arrNew[index].correct = isCheck;
            return (arrNew[index].answer.title = [item.text]);
          }
        });
        setListAnswer({
          ...listAnswer,
          [indexPart]: arrNew,
        });
      }
    }
  };

  // let waitSubmit = false;
  let correct = 0;
  const getParamsNote = (params) => {
    setNoteParams(params);
  };

  function transformData(inputData) {
    const resultMap = new Map();

    Object.values(inputData).forEach((dataArray: any) => {
      dataArray.forEach(item => {
        const { id_question, correct, type, answer } = item;

        if (type === "MULTIPLE-TYPE") {
          const correctCount = answer.title.filter(option => option.correct).length;
          const total = answer.title.length;
          if (resultMap.has(id_question)) {
            resultMap.get(id_question).success_count += correctCount;
            resultMap.get(id_question).total += total;
          } else {
            resultMap.set(id_question, { success_count: correctCount, total: total });
          }
        } else {
          if (resultMap.has(id_question)) {
            if (correct) {
              resultMap.get(id_question).success_count++;
            }
            resultMap.get(id_question).total++;
          } else {
            resultMap.set(id_question, { success_count: correct ? 1 : 0, total: 1 });
          }
        }
      });
    });
    const outputData = Array.from(resultMap, ([id, { success_count, total }]) => ({ id: id, success_count, total }));
    return outputData;
  }


  const onSubmit = async () => {
    if (!isWaitSubmit) {
      let arrayContent: any = [];
      const outputData: any = transformData(listAnswer || {});
      let paramDashBoard: any = {
        question: outputData,
      }

      setWaitSubmit(true)
      for (const key of Object.keys(listAnswer || {})) {
        await Promise.all(
          listAnswer[key].map(async (elm) => {
            if (elm?.type == "MULTIPLE-TYPE") {
              elm?.answer?.title.map((item) => {
                if (item.correct == true) {
                  correct = correct + 1;
                }
              });
            } else {
              if (elm.correct == true) {
                correct = correct + 1;
              }
            }
          }),
        );
      }

      for (const key of Object.keys(listUI || {})) {
        arrayContent.push({
          id: key,
          html: listUI[key]?.innerHTML,
        });
      }
      const questionRes = await axiosClient.post(`items/answer`, {
        detail: listAnswer,
        quiz: quizId * 1,
        type: quiz.type * 1,
        class: classId * 1,
        section: sectionId * 1,
        status: "reviewed",
        note: arrayContent,
        summary: {
          correct: correct,
          total: location,
          left_time: document.getElementById("time-left")?.innerHTML,
        },
      });
      if (questionRes?.data?.data?.id) {
        setWaitSubmit(false)
        const paramAdd = {
          status: "publish",
          answer: questionRes?.data?.data?.id,
          position: noteParams,
        };
        axiosClient.post("/items/transcript", paramAdd).then((res) => { });
        navigate(`${window.location.pathname}/result?answerId=${questionRes?.data?.data?.id}`);
      }
    }
  };

  const onStart = async () => {
    const typeQuiz = getTypeByUrl();
    amplitude.track(`[${typeQuiz}] Start Quiz`, { class: classId, section: sectionId, quiz: quizId, type: getTypeByUrl() });
    setStart(false);
  };
  const onRetake = async () => {
    setRetake(false);
    window.location.href = `${window.location.pathname}`;
  };
  const timeUp = () => {
    onSubmit();
  };


  if (!data || data?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  const contentNote = { content: answerListStore?.[0]?.note !== "[]" ? answerListStore?.[0]?.note : "", explanation: quiz?.parts?.[indexPart]?.explanation };

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
              questions={quiz?.parts}
              listAnswer={listAnswer}
              onClose={() => {
                setReview(false);
              }}
            />
          </Modal>
          <HeaderUI classUser={classUser} part="Reading" title={quiz?.title} />
          <div className="zoomin-content overflow-y-hidden">
            <div className="lg:flex items-center lg:h-[calc(100vh-167px)] h-[calc(100vh-60px)]">
              <div className="relative lg:w-[50%] lg:h-[calc(100vh-167px)] h-[50%] question-ui overflow-y-scroll lg:overflow-y-hidden" id="screen-question">
                <div className="lg:h-[calc(100vh-167px)]">
                  <QuestionUI indexPart={indexPart} idProps="question-note" getParamsNote={getParamsNote} data={contentNote?.content ? contentNote : quiz?.parts?.[indexPart]} />
                </div>
              </div>
              <div className="relative lg:border-[0px] border-[2px] border-neu5 lg:w-[50%] lg:h-full h-[50%] bg-neu7 overflow-y-auto">
                <div className=" py-[35px] px-[20px] lg:px-[50px] overflow-hidden lg:overflow-y-scroll min-h-full">
                  {sortData
                    ?.sort((a: any, b: any) => a.order - b.order)
                    ?.map((item: any, indexItem: any) => {
                      const index = indexItem + 1;
                      if (item.type === "SINGLE-RADIO" && item?.single_choice_radio)
                        return (
                          <Radio
                            key={item.type + indexItem}
                            sameLocate={sameLocate}
                            review={type === "review"}
                            dataItem={item}
                            changed={changed}
                            index={index}
                            data={item?.single_choice_radio}
                            answerListStore={answerListStore}
                            quiz={quiz}
                            indexPart={indexPart}
                            listAnswer={listAnswer?.[indexPart]}
                          />
                        );
                      if (item.type === "SINGLE-SELECTION" && item?.selection)
                        return (
                          <Selection
                            key={item.type + indexItem}
                            sameLocate={sameLocate}
                            review={type === "review"}
                            dataItem={item}
                            changed={changed}
                            index={index}
                            option={item?.selection_option}
                            data={item?.selection}
                            answerListStore={answerListStore}
                            quiz={quiz}
                            indexPart={indexPart}
                            listAnswer={[listAnswer?.[indexPart]]}
                          />
                        );
                      if (item.type === "MULTIPLE" && item?.mutilple_choice)
                        return (
                          <Checkbox
                            key={item.type + indexItem}
                            sameLocate={sameLocate}
                            review={type === "review"}
                            disableMulti={disableMulti}
                            dataItem={item}
                            changed={changed}
                            index={index}
                            data={item?.mutilple_choice}
                            answerListStore={answerListStore}
                            listAnswer={[listAnswer?.[indexPart]]}
                            quiz={quiz}
                            indexPart={indexPart}
                          />
                        );
                      if (item.type === "FILL-IN-THE-BLANK" && item?.gap_fill_in_blank)
                        return (
                          <FillInBlank
                            key={item.type + indexItem}
                            sameLocate={sameLocate}
                            review={type === "review"}
                            dataItem={item}
                            changed={changed}
                            index={index}
                            data={item?.gap_fill_in_blank}
                            answerListStore={answerListStore}
                            quiz={quiz}
                            indexPart={indexPart}
                            listAnswer={[listAnswer?.[indexPart]]}
                          />
                        );
                    })}
                </div>
                <ControlPart parts={quiz?.parts} getIndexPart={getIndexPart} />
              </div>
            </div>
          </div>
          <FooterUI
            timeUp={timeUp}
            indexPart={indexPart}
            isStart={isStart}
            part="reading"
            quiz={quiz}
            listAnswer={listAnswer}
            typeChanged={typeChanged}
            data={sortData}
            action={action}
            isLimited={isLimited.isLimit}
          />

        </div>
      )}
      <TrackingTimeOnPage />
    </div>
  );
};
export default Reading;
