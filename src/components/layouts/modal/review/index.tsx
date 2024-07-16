import React, { useRef, useEffect, useState } from "react";
import Button from "../../../ui/button/index";
import useOnClickOutside from "../../../../hook/outside";
const SubmitModal = ({ data, questions, onClose, onSubmit, listAnswer }: any) => {
  const [listData, setData] = useState([]);
  const [orderState, setOrder]: any = useState(0);
  const ref: any = useRef();
  const listQuestions = questions?.flatMap((item: any) => item.questions);

  const convertArray = (obj: any): any => {
    const result = Object.keys(obj || {}).reduce((arr: any, key: any) => {
      const item = obj[key] || [];
      return [...arr, ...item];
    }, []);
    return result;
  };
  const listAnswerMerge = convertArray(listAnswer);

  useOnClickOutside(ref, () => {
    onClose();
  });

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
          const getAnswer = item.mutilple_choice || [];
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
  }, [questions]);
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
    <div ref={ref} className="bg-white md:min-w-[700px] max-w-[700px] text-center p-[24px] rounded-[20px] mx-auto">
      <div className="m-auto ">
        <p className="headline1 text-primary1">Review your answers</p>
        <p className="body5">This window is to review your answers only, you cannot change the answer in here</p>
        <div className="grid md:grid-cols-5 grid-cols-3 mt-[28px]">
          {new Array(orderState).fill(null)?.map((_, index: any) => {
            const isSelected: any = listData?.find((elm: any) => (elm.location || elm.question) === index + 1);
            const text: any = typeof isSelected?.answer == "string" ? isSelected?.answer : isSelected?.answer?.title?.[0]?.answer || isSelected?.answer?.title?.[0];

            return (
              <div className={`py-[10px] px-[15px] items-center border-b-[1px] border-[#838282]`}>
                <div className="md:flex items-start my-[8px]">
                  <div className="rounded-[5px] px-[8px] py-[4px] mr-[20px]" style={{ boxShadow: "0px 0px 2px rgba(25, 110, 194, 0.6)" }}>
                    <p className="caption text-primary1">{index + 1}</p>
                  </div>
                  <div className="answer text-left md:mt-0 mt-[12px]">{text}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center my-[29px] w-full">
          <Button onClick={onClose} className="bg-primary1 min-w-[200px] text-center text-neu2 text-white flex items-center justify-center">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
