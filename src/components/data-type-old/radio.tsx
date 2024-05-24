import { useState, useRef } from "react";
import { getAlphabetIndex, regexFillBlank } from "@/services/helper";
import Button from "@/components/ui/button";
import { PageIcon, LocateIcon, HeadphoneIcon } from "@/components/icons";
import LocationButton from "../layouts/location-button/index";
import { Tooltip } from "@nextui-org/react";
import { FaceFrownIcon, PlayCircleIcon } from "@heroicons/react/20/solid";

export const Radio = ({ seedAudio, key, listAnswer, indexPart, quiz, type, sameLocate, dataItem, data, index, changed, review, answerListStore }: any) => {
  const isHave = listAnswer?.filter((render: any) => render.question == dataItem.id);
  const selectedText = isHave?.[0]?.answer.title?.[0];
  const elmFill = regexFillBlank(quiz?.parts?.[indexPart]?.content);
  const [isExplain, setExplain] = useState(false);
  const [play, setPlay] = useState(-1);
  const [isReload, setReload] = useState(false);
  const selected = (alPhabet: any, itemRender: any, correct: any) => {
    
    setReload(true);
    var temp = itemRender;
    temp["answer"] = alPhabet;
    changed(temp, dataItem, "radio", correct);
  };
  
  const refAudio: any = useRef();
  // const playSections = (index: number, time: number) => {
  //   if (play === index) {
  //     setPlay(-1);
  //     stop.current = true;
  //     refAudio.current.pause();
  //     setTimeout(() => {
  //       stop.current = false;
  //     }, 1000);
  //   } else {
  //     setPlay(index);
  //     setTime(time);
  //   }
  // };

  const setTime = (time: number) => {
    refAudio.current.currentTime = time;
    refAudio.current.play();
    seedAudio(refAudio);
  };

  return (
    <div key={key} className="py-[10px]">
      {dataItem?.description && (
        <div className="mb-[21px]">
          <div className="" id={`question-${dataItem.id}`}>
            <div className="content-cms" dangerouslySetInnerHTML={{ __html: dataItem?.description }}></div>
          </div>
        </div>
      )}
      {/* <Tooltip
        content={
          <div className="px-1 py-2">
            <div className="flex items-center">
              <HeadphoneIcon fill="black" className="mr-[10px]" />
              <div>
                <div className="text-small font-bold">Listen from here</div>
                <div className="text-tiny">Start secons : 00:05</div>
              </div>
            </div>
          </div>
        }
      >
        <div>
          <HeadphoneIcon fill="black" className="translate-x-[-10px]" />
        </div>
      </Tooltip> */}
      <div className="flex items-center mb-[20px]">
        <div
          className="py-[2px] px-[14px] bg-white rounded-[10px] w-fit mr-[18px] headline1 text-primary1"
          style={{
            boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)",
          }}
        >
          {dataItem?.order}
        </div>
        <p className="body3 text-neu1">{dataItem.title}</p>
      </div>

      {dataItem?.content && (
        <div
          className="content-cms overflow-auto bg-white border-[#e7e5e1] border-[1px] py-[25px] px-[23px] rounded-[20px] my-[24px]"
          dangerouslySetInnerHTML={{ __html: dataItem?.content }}
        ></div>
      )}
      {data?.map((itemRender: any, index: any) => {
        let correct = "";
        const isChoosed = answerListStore?.[0]?.detail?.[indexPart]?.filter((item: any) => {
          if (item.question === dataItem.id) {
            if (item?.answer.title?.[0].text === itemRender.text) {
              return item?.answer;
            }
          }
        });

        if (itemRender?.correct === true) {
          correct = itemRender.text;
        }
        const checkedState = selectedText?.text == itemRender.text;
        return (
          <div key={`radio-item-${index}`} className="flex items-center mb-[20px]">
            <span className="mr-[12px] text-primary1 rounded-full px-[7px] py-[2px] body3">{getAlphabetIndex(index)}</span>
            <label className={`container-radio ${review ? "cursor-not-allowed" : "cursor-pointer"}`} htmlFor={`radio-${index}-${dataItem.id}`}>
              <input
                onChange={() => selected(getAlphabetIndex(index), itemRender, correct ? true : false)}
                id={`radio-${index}-${dataItem.id}`}
                name={`radio-${dataItem.id}`}
                defaultChecked={checkedState}
                type="radio"
                disabled={review}
                className={checkedState ? "checked-input" : ""}
              ></input>
              <span
                className={`${type === "listening" && "border-[1px] border-primary1"} checkmark ${
                  review && isChoosed?.[0]?.answer.title?.[0].text === correct
                    ? "bg-green1"
                    : (isChoosed?.[0]?.answer.title?.[0].text == itemRender.text && review && "bg-primary2") || "bg-white"
                }`}
              ></span>
              <span className="ml-[12px] body5 ml-[30px]">{itemRender.text}</span>
            </label>
          </div>
        );
      })}
      {review &&
        data?.map((itemRender: any, index: any) => {
          if (itemRender?.correct === true) {
            let result = null;
            elmFill?.find((elm) => {
              var regexSameLocation = new RegExp("\\b" + dataItem.order + "\\b");
              if (elm?.[2] == dataItem.order || regexSameLocation.test(elm?.[2])) {
                result = dataItem.order;
              }
            });
            return (
              <div className="mb-[20px]">
                <div className="flex items-center justify-between flex-wrap gap-y-[20px]">
                  <div className="bg-[#e7e5e1] px-[20px] w-[200px] rounded-[8px] flex items-center mr-[22px]">
                    <span className="body3">Answer</span>
                    <span className="headline1 text-green ml-[10px]">{getAlphabetIndex(index)}</span>
                  </div>
                  <div className="flex items-center">
                    {result && <LocationButton sameLocate={sameLocate} id={dataItem?.order} />}
                    {dataItem.explain && (
                      <Button onClick={() => setExplain(!isExplain)} className="bg-green1 text-white ml-[8px]">
                        <PageIcon className="mr-[4px]" />
                        Explain
                      </Button>
                    )}
                  </div>
                </div>
                {dataItem.explain && isExplain && (
                  <div
                    className="content-cms overflow-x-auto bg-white border-[#e7e5e1] border-[1px] py-[25px] px-[23px] rounded-[20px] mt-[24px]"
                    dangerouslySetInnerHTML={{ __html: dataItem.explain }}
                  ></div>
                )}
              </div>
            );
          }
        })}
    </div>
  );
};
