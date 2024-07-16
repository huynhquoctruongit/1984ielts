import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HeaderUI from "@/components/layouts/course-ui/header";
import FooterUI from "@/components/layouts/course-ui/footer";
import Modal from "@/components/layouts/modal/template";
import Start from "@/components/layouts/modal/start/index";
import Submit from "@/components/layouts/modal/submit/index";
import Retake from "@/components/layouts/modal/retake/index";
import Review from "@/components/layouts/modal/review/index";
import QuestionUI from "@/components/layouts/question-ui/index";
import { Radio, Selection, Checkbox, FillInBlank } from "@/components/data-type";
import { useParams, useLocation } from "react-router-dom";
import useSWR from "swr";
import axiosClient, { AxiosAPI, fetcherClient } from "@/libs/api/axios-client.ts";
import { OclockIcon } from "@/components/icons/svg";
import { AudioPlayerId } from "@/components/ui/audio";
import { Spin } from "antd";
import ControlPart from "@/components/layouts/control-parts";
import { LimitSubmit } from "@/components/system/check-limit-submit";
import LimitSubmitPopup from "@/components/layouts/modal/limit-submit/index";
import useOnClickOutside from "@/hook/outside";
import { uid, checkSelection, regexFillBlank, endcodeUTF8, replaceSpace } from "@/services/helper.tsx";
import { PencelIcon, SpeakingIcon, TrashIcon } from "@/components/icons";
import { Textarea, Dropdown, DropdownTrigger, DropdownSection, DropdownItem, DropdownMenu } from "@nextui-org/react";
import AxiosController from "@/libs/api/axios-controller.ts";
import { useAuth } from "@/hook/auth";
import amplitude, { getTypeByUrl } from "@/services/amplitude";

const Reading = ({ getLayout, classUser }: any) => {
  const { classId, courseId, sectionId, quizId }: any = useParams();
  const screenWidth = window.innerWidth;
  const navigate = useNavigate();
  let urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type");
  const answerId = urlParams.get("answerId");

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
  const refAudio: any = useRef();
  const ref = useRef() as any;
  const [isLimited, setLimited]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [isLimitedPopup, setLimitedPopup]: any = useState({ isLimit: null, submitCount: "", used: "" });
  const [isClearAll, setClearAll]: any = useState(false);
  const [isRef, setRef]: any = useState(null);
  const [isStart, setStart] = useState(false);
  const [isSubmit, setSubmit] = useState(false);
  const [isRetake, setRetake] = useState(false);
  const [isReview, setReview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [typeChanged, setTypeChanged] = useState([]);
  const [listAnswer, setListAnswer] = useState() as any;
  const [getArray, setArray] = useState([]);
  let arrayList: any = [...getArray] as any;
  const [getArraySelection, setArraySelection] = useState([]);
  const [quiz, setQuiz]: any = useState([]);
  const [indexPart, setIndexPart]: any = useState(0);
  const [listUI, setListUI]: any = useState();
  const [isWaitSubmit, setWaitSubmit]: any = useState(false)

  const { profile } = useAuth();
  let arrayListSelection: any = [...getArraySelection] as any;

  const dataQuiz = quiz?.parts?.[indexPart]?.questions || [];
  const content = quiz?.parts?.[indexPart]?.content;

  const answerListRef = useRef(listAnswer);
  useEffect(() => {
    answerListRef.current = listAnswer
  }, [listAnswer])


  let sortData: any = dataQuiz;
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
    if (type === "review") {
      axiosClient.get(`/items/answer?limit=1&filter[quiz].id=${quizId}&filter[id]=${answerId}&sort=-date_created`).then((res: any) => {
        setListAnswerStore(res?.data?.data || []);
      });
    }
  }, [type]);
  useEffect(() => {
    if (type !== "review") {
      setStart(true);
    }
  }, [type, isLimited]);


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
  useEffect(() => {
    getLayout(false);
    axiosClient.get(`/items/quiz/${quizId}?fields=*,source.*,course.*,parts.*,parts.questions.*`).then((res: any) => {
      setQuiz(res?.data?.data || []);
      getLimit(res?.data?.data?.limit_submit || "unlimit");
    });
  }, []);
  const getLimit = async (number: any) => {
    if (number !== "unlimit") {
      const limited = await LimitSubmit(quizId, number);
      setLimited(limited);
      setLimitedPopup(limited);
    } else {
      setLimitedPopup({ isLimit: "unlimit" });
    }
  };
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
                type: "MULTIPLE-TYPE",
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
                  title: [item],
                },
                correct: item.correct ? true : false,
                question: dataItem?.id || "",
                location: dataItem.order,
                type: "MULTIPLE-TYPE",
                id_question: dataItem?.id
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

            // Tìm chỉ mục của các mục có giá trị newItem.text
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
      // var regex = /{\[([^[\]]+)\]\[(\d+)\]}/g;
      const regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
      const string = endcodeUTF8(dataItem.gap_fill_in_blank);
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
  // let waitSubmit = true;

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
  let correct = 0;

  const onSubmit = async () => {
    if (!isWaitSubmit) {
      let listAnswerMerge = listAnswer || answerListRef.current;
      const outputData: any = transformData(listAnswerMerge || {});
      let paramDashBoard: any = {
        question: outputData,
      }
      setWaitSubmit(true)
    
      Object.keys(listAnswerMerge || {}).forEach(function (key, index) {
        listAnswerMerge[key].map((elm: any) => {
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
        });
      });
      const questionRes = await axiosClient.post(`items/answer`, {
        detail: listAnswerMerge,
        quiz: quizId * 1,
        type: quiz.type * 1,
        class: classId * 1,
        section: sectionId * 1,
        status: "reviewed",
        summary: {
          correct: correct,
          total: location,
          left_time: document.getElementById("time-left-listening")?.innerHTML,
        },
      });
      if (questionRes?.data?.data?.id) {
        setWaitSubmit(false)
        const link = `${window.location.pathname}/result?answerId=${questionRes?.data?.data?.id}`.replace("//", "/");
        navigate(link);
      }
    }
  };

  const onRetake = async () => {
    setRetake(false);
    window.location.href = `${window.location.pathname.replace("/review", "")}`;
  };
  const onStart = async () => {
    setStart(false);
    const typeQuiz = getTypeByUrl();
    amplitude.track(`[${typeQuiz}] Start Quiz`, { class: classId, section: sectionId, quiz: quizId, type: getTypeByUrl() });
  };
  function countdown(minutes: any) {
    if (type == "review") return;
    let seconds = minutes * 60;
    const intervalId = setInterval(() => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const formattedHours = hours.toString().padStart(2, "0");
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = (seconds % 60).toString().padStart(2, "0");
      const countdownOutput = `${formattedMinutes}:${formattedSeconds}`;

      const timeLeftId = window.document.getElementById("time-left-listening")!;

      if (timeLeftId !== null && countdownOutput && countdownOutput !== "NaN:NaN") {
        timeLeftId.innerHTML = countdownOutput;
      }
      if (seconds === 0) {
        onSubmit();
        clearInterval(isRef);
      }
      seconds--;
    }, 1000);
    setRef(intervalId);
  }
  useEffect(() => {
    if (quiz && !isStart) {
      countdown(quiz.time);
    } else {
      const timeLeftId = window.document.getElementById("time-left-listening")!;
      if (timeLeftId !== null) {
        timeLeftId.innerHTML = "00:00";
      }
    }
  }, [quiz, isStart]);

  useEffect(() => {
    const timeLeftId = window.document.getElementById("time-left-listening")!;
    if (timeLeftId !== null) {
      timeLeftId.innerHTML = "00:00";
    }
    return () => {
      clearInterval(isRef);
    };
  }, [isRef]);
  const getIndexPart = (index: any) => {
    var oldRadio = document.querySelector(`.ui-part-${indexPart}`);
    if (oldRadio) {
      var clone = oldRadio.cloneNode(true);
      const renderUI = document.querySelector("#render-ui");
      // setListUI({
      //   ...listUI,
      //   [indexPart]: clone,
      // });
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

  const [isPopup, setPopup]: any = useState(false);
  const [isHightlight, setHightlight]: any = useState();
  const [isNote, setNote]: any = useState({
    status: false,
    note: "",
  });
  const [data, setData] = useState([]);
  const [dataRange, setRange]: any = useState();
  const refPopup = useRef();
  const refNote = useRef();
  const refPopupHighlight = useRef();

  useOnClickOutside(refPopup, () => {
    setPopup(false);
  });
  useOnClickOutside(refNote, () => {
    setNote({
      status: false,
    });
  });
  useOnClickOutside(refPopupHighlight, () => {
    setHightlight({
      ...isHightlight,
      status: false,
    });
  });

  useEffect(() => {
    axiosClient.get(`/items/transcript?filter[answer]=${answerId}`).then((res) => {
      if (res?.data?.data) {
        setData(res?.data?.data?.[0]?.position);
      }
    });
  }, []);
  function saveSelection() {
    if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    }
    return null;
  }
  useEffect(() => {
    if (isClearAll) {
      setTimeout(() => {
        clearHighlight("all");
      }, 200);
    }
  }, [isClearAll, indexPart]);
  useEffect(() => {
    setTimeout(() => {
      const content: any = document.getElementById("render-ui");
      if (content) {
        content.addEventListener("touchend", function (event) {
          event.preventDefault();
          openPopupUI();
        });
        content.addEventListener("mouseup", function (event) {
          openPopupUI();
        });
        const openPopupUI = async () => {
          const isCheck = await checkSelection();
          if (isCheck) return;
          setClearAll(false);
          let elm: any = window.getSelection();
          if (elm?.toString()) {
            setPopup(true);
            const save = saveSelection();
            setRange(save);
            var oRange = elm.getRangeAt(0); //get the text range
            if (oRange?.commonAncestorContainer?.outerHTML?.indexOf("<input") > -1) return;
            var oRect = oRange.getBoundingClientRect();
            var divElement = document.getElementById("screen-question");
            var currentPostion = divElement.scrollTop;
            setTimeout(() => {
              var getTool: any = document.querySelector(".popup-selected") as any;
              if (getTool) {
                var newLeft = oRect.left <= 120 ? 120 : oRect.left;
                elm.toString().length
                  ? ((getTool.style.left = newLeft + oRect.width / 2 - 110 + "px"), // 110 is toolbox.width/2
                    (getTool.style.top = oRect.top - 40 + currentPostion + "px"), //45 is toolbow.height
                    getTool.classList.add("active"))
                  : null;
              }
            }, 100);
          }
        };
      }
    }, 500);
  }, [indexPart]);
  useEffect(() => {
    var marks: any = document.querySelectorAll("mark") as any;
    marks.forEach(function (mark) {
      mark.addEventListener("click", function (event) {
        var clickedElement = event.target;
        var clickedClass = clickedElement.classList[0];
        var foundElement = data.find(function (item) {
          return item.id == clickedClass;
        });
        openSelected(foundElement);
      });
    });
  }, [data, indexPart]);

  const openSelected = (param: any) => {
    var getPostion = document.querySelector(`.${param.id}`);
    var oRect = getPostion.getBoundingClientRect();
    var divElement = document.getElementById("screen-question"); // Thay 'tenPhanTu' bằng ID thực của phần tử
    var currentPostion = divElement.scrollTop;
    setTimeout(() => {
      var getTool: any = document.querySelector(`.popup-selected-${param.type}`) as any;
      if (getTool) {
        var newLeft = oRect.left <= 120 ? 120 : oRect.left;
        (getTool.style.left = newLeft + oRect.width / 2 - 110 + "px"), // 110 is toolbox.width/2
          (getTool.style.top = oRect.top + currentPostion - 40 + "px"), //45 is toolbow.height
          getTool.classList.add("active");
      }
    }, 200);
    if (param.type == "note") {
      setNote({
        status: true,
        type: "show",
        param: param,
      });
    } else {
      if (window.getSelection()?.toString() == "") {
        setHightlight({
          status: true,
          param: param,
        });
      }
    }
  };
  const clearHighlight = (type: any) => {
    if (type == "item") {
      var elements = document.getElementsByClassName(isHightlight?.param?.id);
      var elementsArray = Array.from(elements);
      elementsArray.forEach(function (element) {
        var newDiv = document.createElement("div");
        while (element.firstChild) {
          newDiv.appendChild(element.firstChild);
        }
        newDiv.normalize();
        element.replaceWith(...newDiv.childNodes);
        const newArray = data.filter((item) => item.id !== isHightlight?.param?.id);
        setData(newArray);
      });
    } else {
      setClearAll(true);
      function replaceAndClean(element) {
        let newElm = document.createElement("span");
        newElm.innerHTML = element.innerHTML;
        newElm.className = "";
        element.parentNode.replaceChild(newElm, element);
        let childElms = newElm.querySelectorAll("." + classDelete);
        childElms.forEach(replaceAndClean);
      }

      let classDelete = "mark-selected";
      let allElms = document.querySelectorAll("." + classDelete);
      allElms.forEach(replaceAndClean);
      setData([]);
    }
    setHightlight({
      status: false,
    });
  };
  const PopupHightlight = () => {
    return (
      <div
        ref={refPopupHighlight}
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        id="popup-selected"
        className="popup-selected-hightlight w-fit absolute border-[0.5px] border-gray text-white bg-neu1 z-[1111] rounded-[4px] p-[10px]"
      >
        <div
          className="flex items-center cursor-pointer hover:hover:text-neu3"
          onClick={() => {
            setHightlight({
              ...isHightlight,
              type: "add-note",
              status: false,
            });
            setNote({
              status: true,
              type: "open",
            });
          }}
        >
          <SpeakingIcon className="w-[15px]"></SpeakingIcon>
          <p className="cursor-pointer hover:hover:text-neu3 ml-[10px]">Note</p>
        </div>
        <div className="w-full h-[0.5px] bg-neu4 my-[4px]"></div>
        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => clearHighlight("item")}>
          <TrashIcon className="w-[17px]"></TrashIcon>
          <p className="cursor-pointer hover:text-neu3 ml-[10px]">Clear highlight</p>
        </div>
        <div className="w-full h-[0.5px] bg-neu4 my-[4px]"></div>

        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => clearHighlight("all")}>
          <TrashIcon className="w-[17px]"></TrashIcon>
          <p className="cursor-pointer hover:text-neu3 ml-[10px]">Clear all</p>
        </div>
      </div>
    );
  };

  const getSelectionPopup = (type: any, value: any) => {
    const valueRange = dataRange;
    const randomId = uid();
    var wrap = ["A"];
    var sel: any = valueRange;
    var range: any = valueRange;
    const param = {
      type: type,
      id: `note-${randomId}`,
      textSelected: sel?.toString(),
      note: value,
      dataRange: valueRange,
    };
    let list = [...(data || [])];
    list.push(param);
    setData(list);
    if (!range.startContainer.isSameNode(range.endContainer)) {
      // get all nodes within the range commonAncestorContainer node
      var treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ALL);
      var nodeList = [];
      var currentNode = treeWalker.currentNode;
      while (currentNode) {
        nodeList.push(currentNode);
        currentNode = treeWalker.nextNode();
      }
      var start = null; // index that our selected nodes start
      var end = null; // index that our selected nodes end
      var selNodes = nodeList.filter(function (val, i) {
        var node = nodeList[i];
        start = start ?? (val.isSameNode(range.startContainer) ? i : null); // if same as start node
        end = end ?? (val.isSameNode(range.endContainer) ? i : null); // if same as end node
        var lesser = start == null || i <= start; // is before start node?
        var greater = end != null && i >= end; // is after end node?
        return (
          !lesser &&
          !greater &&
          !node.isSameNode(range.endContainer.parentNode) && // node is not same as end node's parent
          node != undefined &&
          node != null &&
          node.textContent.replace(/\t|\n/g, "") != "" &&
          node.textContent.replace(/\t|\n/g, "") != undefined &&
          !node.contains(range.endContainer) && // node does not contain end node
          !node.isSameNode(range.endContainer.parentNode) // node is not same as end node's parent
        );
      });
      var sParent = range.startContainer.parentNode;
      var sText = range.startContainer.textContent;
      var mark: any = document.createElement("mark") as any;
      mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
      mark.addEventListener("click", function () {
        let elm = list?.find((el) => el.id == `note-${randomId}`);
        openSelected(elm);
      });
      if (wrap.includes(sParent.nodeName) && sText.replace(/\t+|\n+/gm, "") == sText.substring(range.startOffset).replace(/\t+|\n+/gm, "")) {
        var node = sParent.cloneNode(true);
        mark.append(node);
        sParent.after(mark);
        sParent.remove();
      } else {
        mark.textContent = sText.substring(range.startOffset);
        range.startContainer.textContent = sText.substring(range.startOffset, -1);
        range.startContainer.after(mark);
      }
      var eParent: any = range.endContainer.parentNode;
      var eText: any = range.endContainer.textContent;
      var mark: any = document.createElement("mark") as any;
      mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
      mark.addEventListener("click", function () {
        let elm = list?.find((el) => el.id == `note-${randomId}`);
        openSelected(elm);
      });
      if (wrap.includes(eParent.nodeName) && eText.replace(/\t+|\n+/gm, "") == eText.substring(range.endOffset, -1).replace(/\t+|\n+/gm, "")) {
        var node = eParent.cloneNode(true);
        mark.append(node);
        eParent.after(mark);
        eParent.remove();
      } else {
        mark.textContent = eText.substring(range.endOffset, -1);
        range.endContainer.textContent = eText.substring(range.endOffset);
        range.endContainer.before(mark);
      }
      selNodes.forEach(function (val, idx) {
        var currentNode = selNodes[idx];
        var mark: any = document.createElement("mark") as any;
        mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
        mark.addEventListener("click", function () {
          let elm = list?.find((el) => el.id == `note-${randomId}`);
          openSelected(elm);
        });
        if (currentNode.nodeType === Node.TEXT_NODE) {
          mark.textContent = currentNode.textContent;
          currentNode.after(mark);
          currentNode.remove();
        } else {
          if (wrap.includes(currentNode.nodeName)) {
            var node = currentNode.cloneNode(true);
            mark.append(node);
            currentNode.after(mark);
            currentNode.remove();
          } else {
            mark.textContent = currentNode.textContent;
            currentNode.innerHTML = "";
            currentNode.appendChild(mark);
          }
        }
      });
    } else {
      var parentNode = range.startContainer.parentNode;
      var mark: any = document.createElement("mark") as any;
      mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
      mark.addEventListener("click", function () {
        let elm = list?.find((el) => el.id == `note-${randomId}`);
        openSelected(elm);
      });
      if (wrap.includes(parentNode.nodeName)) {
        var node = parentNode.cloneNode(true);
        node.textContent = sel.toString();
        mark.append(node);
        parentNode.after(mark);
        parentNode.remove();
      } else {
        var sText: any = document.createTextNode(range.startContainer.textContent.substring(range.startOffset, -1).toString());
        var eText: any = document.createTextNode(range.endContainer.textContent.substring(range.endOffset).toString());
        mark.textContent = sel.toString();
        range.startContainer.after(eText);
        range.startContainer.after(mark);
        range.startContainer.after(sText);
        range.startContainer.remove();
      }
    }
    setPopup(false);
    setNote({
      status: false,
    });
  };
  useEffect(() => {
    const markedNoteDivs = document.querySelectorAll(".mark-selected-note");
    const markedNoteArray = Array.from(markedNoteDivs);
    const result = markedNoteArray.reduce((acc, current, index, array) => {
      const classes = Array.from(current.classList);
      const hasSameClasses = array.every((element, elementIndex) => {
        if (elementIndex !== index) {
          const otherClasses = Array.from(element.classList);
          return classes.every((className) => otherClasses.includes(className));
        }
        return true;
      });
      array.forEach((element) => {
        element.classList.remove("mark-selected-note");
      });
      if (index === array.length - 1) {
        current.classList.add("active-note");
      }
      return acc;
    }, []);
  }, [data]);
  const Popup = () => {
    return (
      <div
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        id="popup-selected"
        ref={refPopup}
        className="popup-selected w-fit absolute border-[0.5px] border-gray bg-neu1 text-white z-[1111] rounded-[4px] p-[10px]"
      >
        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={notePopup}>
          <SpeakingIcon className="w-[15px]"></SpeakingIcon>
          <p className="cursor-pointer ml-[10px]">Note</p>
        </div>
        <div className="w-full h-[0.5px] bg-neu4 my-[4px]"></div>
        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => getSelectionPopup("hightlight", "")}>
          <PencelIcon className="w-[15px]"></PencelIcon>
          <button className="cursor-pointer hover:text-neu3 get_selection ml-[10px]">Hightlight</button>
        </div>
      </div>
    );
  };
  const notePopup = () => {
    setPopup(false);
    setNote({
      status: true,
      type: "open",
    });
  };
  const editSelected = (value) => {
    let newArray = isNote?.param;
    newArray.note = value;
    openSelected(newArray);
    setNote({
      status: false,
    });
  };
  const Note = () => {
    var getPostion = isHightlight?.type === "add-note" ? document.querySelector(`.${isHightlight?.param?.id}`) : document.querySelector(`.${isNote?.param?.id}`);
    var oRange = dataRange && dataRange?.toString()?.length !== 0 ? dataRange : getPostion;
    var oRect = oRange && oRange?.getBoundingClientRect();
    var divElement = document.getElementById("screen-question"); // Thay 'tenPhanTu' bằng ID thực của phần tử
    var currentPostion = divElement.scrollTop;
    setTimeout(() => {
      var getTool: any = document.querySelector(".popup-selected-note") as any;
      if (getTool) {
        var newLeft = oRect.left <= 120 ? 120 : oRect.left;
        (getTool.style.left = newLeft + oRect.width / 2 - 110 + "px"), (getTool.style.top = oRect.top + currentPostion - 40 + "px"), getTool.classList.add("active");
      }
    }, 100);
    let value = "";
    if (isHightlight?.type === "add-note") {
      const elm = data?.find((el) => el.id == isHightlight?.param?.id);
      setRange(elm?.dataRange);
    }
    const onAction = (type: any) => {
      if (type == "edit") {
        setNote({
          status: true,
          type: "edit",
          param: isNote?.param,
        });
      } else {
        var elements = document.getElementsByClassName(isNote?.param?.id);
        var elementsArray = Array.from(elements);
        elementsArray.forEach(function (element) {
          var newDiv = document.createElement("div");
          while (element.firstChild) {
            newDiv.appendChild(element.firstChild);
          }
          newDiv.normalize();
          element.replaceWith(...newDiv.childNodes);
        });
        setNote({
          status: false,
        });
      }
    };
    const changeToNote = () => {
      let elm = data?.findIndex((el) => el.id == isHightlight?.param?.id);
      let arr = data?.find((el) => el.id == isHightlight?.param?.id);
      let cloneData = data;
      arr.note = value;
      arr.type = "note";
      if (elm !== -1) {
        cloneData[elm] = arr;
      }
      const listElm = document.getElementsByClassName(isHightlight?.param?.id);
      const classes = Array.from(listElm);
      classes.map((elm) => {
        elm.classList.add("active-note");
      });

      setData(cloneData);
      setNote({
        status: false,
      });
    };
    useEffect(() => {
      const noteInput = document.getElementById("input-note-textarea");
      if (noteInput) {
        setTimeout(() => {
          noteInput.focus();
        }, 200);
      }
    }, []);
    return (
      <div
        ref={refNote}
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        id="popup-selected"
        className="popup-selected-note min-w-[150px] md:w-fit absolute border-[0.5px] border-gray bg-[#E8F4FF] z-[1111] rounded-[14px] p-[20px]"
      >
        <div className="flex items-center justify-between mb-[12px]">
          <p className="font-bold">Note</p>
          <Dropdown className="dropdown-popup">
            <DropdownTrigger>
              <div className="bg-primary1 p-[6px] rounded-full cursor-pointer">
                <PencelIcon fill="red" className="w-[9px] h-[9px]" />
              </div>
            </DropdownTrigger>
            <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
              <DropdownSection title="Actions">
                <DropdownItem onClick={() => onAction("edit")} key="edit">
                  Edit
                </DropdownItem>
                <DropdownItem onClick={() => onAction("delete")} key="delete">
                  Delete
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </div>
        {isNote?.type === "show" ? (
          <div>{isNote?.param?.note}</div>
        ) : (
          <div>
            <textarea
              className="bg-white rounded-[4px] p-[10px]"
              id="input-note-textarea"
              placeholder="Nhập nội dung ..."
              defaultValue={isNote?.param?.note}
              onChange={(e) => (value = e.target.value)}
            ></textarea>
            <br />
            <button
              onClick={() =>
                isNote?.type == "edit" ? editSelected(value || isNote?.param?.note) : isHightlight?.type === "add-note" ? changeToNote() : getSelectionPopup("note", value)
              }
              className="bg-primary1 px-[20px] py-[3px] text-center cursor-pointer rounded-[5px] text-white mt-[12px] caption get_selection"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!dataQuiz || dataQuiz?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  const seedAudio = (ref: any) => {
    // console.log(ref, "ref");
  };

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
          <HeaderUI classUser={classUser} part="Listening" title={quiz?.title} />
          <div className="zoomin-content overflow-y-hidden lg:flex flex-row-reverse lg:flex-row  items-center lg:h-[calc(100vh-167px)]">
            <div className="relative lg:w-[50%] h-[calc(100vh-170px)] md:h-[calc(100vh-167px)] overflow-y-scroll" id="screen-question">
              <div className="p-[10px] bg-neu5 block lg:hidden sticky top-0 z-[11]">
                {quiz?.listening && screenWidth <= 1024 && <AudioPlayerId isStart={isStart} refAudio={refAudio} id={quiz?.listening} />}
              </div>
              {isHightlight?.status && <PopupHightlight></PopupHightlight>}
              {isPopup && <Popup></Popup>}
              {isNote.status && <Note></Note>}
              <div className="parent-node min-h-full">
                <div id="render-ui" className={`relative ui-part-${indexPart}`}>
                  <div className="lg:py-[35px] p-[20px] lg:px-[50px] min-h-full">
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
                              review={type === "review"}
                              dataItem={item}
                              changed={changed}
                              index={index}
                              data={item?.single_choice_radio}
                              answerListStore={answerListStore}
                              indexPart={indexPart}
                              listAnswer={listAnswer?.[indexPart]}
                              seedAudio={seedAudio}
                            />
                          );
                        if (item.type === "SINGLE-SELECTION" && item?.selection)
                          return (
                            <Selection
                              key={item.type + indexItem}
                              quiz={quiz}
                              type="listening"
                              sameLocate={sameLocate}
                              review={type === "review"}
                              dataItem={item}
                              changed={changed}
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
                              review={type === "review"}
                              dataItem={item}
                              changed={changed}
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
                              review={type === "review"}
                              dataItem={item}
                              changed={changed}
                              index={index}
                              data={item?.gap_fill_in_blank}
                              answerListStore={answerListStore}
                              indexPart={indexPart}
                              listAnswer={[listAnswer?.[indexPart]]}
                            />
                          );
                      })}
                  </div>
                </div>
              </div>
              {/* <QuestionUI idProps="type-ui" data={{ content: uiHTML }} /> */}
              <ControlPart parts={quiz?.parts} getIndexPart={getIndexPart} />
            </div>
            <div className="hidden lg:block w-[50%] bg-neu7 h-full relative">
              <div className="m-auto mt-[100px]">
                <div className="py-[35px] px-[50px]">
                  <div className="flex items-center justify-center mb-[20px]">
                    <OclockIcon fill="#22313F" className="w-[100px] h-[100px]" />
                    <p className="text-neu1 headline1 ml-[20px] text-[120px]" id="time-left-listening">
                      00:00
                    </p>
                  </div>
                  {quiz?.listening && screenWidth >= 1024 && <AudioPlayerId isStart={isStart} refAudio={refAudio} id={quiz?.listening} />}
                  <img src="/images/banner-listening.png" className="w-[60%] ml-auto" />
                </div>
              </div>
            </div>
          </div>
          <FooterUI
            isLimited={isLimited.isLimit}
            isStart={isStart}
            part="listening"
            quiz={quiz}
            listAnswer={listAnswer}
            typeChanged={typeChanged}
            data={sortData}
            action={action}
          />
        </div>
      )}
    </div>
  );
};
export default Reading;
