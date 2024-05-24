import Button from "@/components/ui/button/index";
import { MenuIcon } from "@/components/icons/index";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
const AnswerUnanser = ({ questions, part, quiz, data, listAnswer }: any) => {
  const listQuestions = questions?.flatMap((item: any) => item.questions);

  const convertArray = (obj: any): any => {
    const result = Object.keys(obj || {}).reduce((arr: any, key: any) => {
      const item = obj[key] || [];
      return [...arr, ...item];
    }, []);
    return result;
  };
  const listAnswerMerge = convertArray(listAnswer);
  const { quizId } = useParams();
  let urlParams = new URLSearchParams(window.location.search);
  const typeStatus = urlParams.get("type");
  const [isQuestIndex, showQuestIndex] = useState(false);
  const [listData, setData] = useState([]);
  const [ref, setRef]: any = useState(null) as any;
  const [orderState, setOrder]: any = useState(0);

  let order = orderState;
  useEffect(() => {
    if (listQuestions) {
      let newData = [...listQuestions];
      newData?.map((item: any, index: any) => {
        if (item.type === "FILL-IN-THE-BLANK") {
          // var regex = /{\[([^[\]]+)\]\[(\d+)\]}/g;
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
  return (
    <div className="bottom-0 w-full absolute">
      <div className="header-part bg-neu1 px-[39px] py-[10px]">
        <div className={`flex items-center`}>
          <div>
            <div className="flex items-center cursor-pointer" onClick={() => showQuestIndex(!isQuestIndex)}>
              <MenuIcon />
              <p className="headline2 text-white ml-[15px] pl-[15px]">Question palette</p>
            </div>
            <div className="bottom-[76px] w-[50%] py-[18px] rounded-tr-[40px] w-full">
              <div className="flex items-center body3 flex-wrap gap-y-[10px]">
                {new Array(orderState).fill(null)?.map((_, index: any) => {
                  const isSelected: any = listData?.find((elm: any) => (elm.location || elm.question) === index + 1);
                  return (
                    <div
                      key={index + "-elm-id"}
                      className={`${(isSelected?.answer?.title !== undefined && isSelected?.answer?.title.length > 0 && isSelected?.answer?.title[0] !== "") ||
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
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnswerUnanser;
