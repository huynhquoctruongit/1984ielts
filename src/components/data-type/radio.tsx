import { useState } from "react";
import { getAlphabetIndex, regexFillBlank } from "@/services/helper";
import Button from "@/components/ui/button";
import { PageIcon, ListenHereIcon } from "@/components/icons";
import LocationButton from "../layouts/location-button/index";

export const Radio = ({ playSections, key, listAnswer, indexPart, quiz, type, sameLocate, dataItem, data, index, changed, review, answerListStore }: any) => {
  const isHave = listAnswer?.filter((render: any) => render.question == dataItem.id);
  const selectedText = isHave?.[0]?.answer.title?.[0];
  const elmFill = regexFillBlank(quiz?.parts?.[indexPart]?.content);
  const [isExplain, setExplain] = useState(false);
  const selected = (alPhabet: any, itemRender: any, correct: any) => {
    var temp = itemRender;
    temp["answer"] = alPhabet;
    changed(temp, dataItem, "radio", correct);
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
      <div className="flex items-center mb-[20px]" id={"location-jumpto-" + dataItem?.order}>
        <div
          onClick={() => review && playSections(0, dataItem.listen_from)}
          className={`${review && dataItem.listen_from && "cursor-pointer"} flex items-center py-[4px] px-[14px] bg-white rounded-[10px] w-fit mr-[18px] headline1 text-primary1`}
          style={{
            boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)",
          }}
        >
          {(type === "listening" && review && dataItem.listen_from) && <div className="border-[2px] border-[#2B3242] rounded-full p-[6px] mr-[10px]"><ListenHereIcon /></div>}
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
          <div key={`radio-item-${index}-${indexPart}`} className="flex items-center mb-[20px]">
            <span className="mr-[12px] text-primary1 rounded-full px-[7px] py-[2px] body3">{getAlphabetIndex(index)}</span>
            <label className={`container-radio ${review ? "cursor-not-allowed" : "cursor-pointer"}`} htmlFor={`radio-${index}-${dataItem.id}`}>
              <input
                key={`radio-${index}-${indexPart}`}
                onChange={() => selected(getAlphabetIndex(index), itemRender, correct ? true : false)}
                id={`radio-${index}-${dataItem.id}`}
                name={`radio-${dataItem.id}`}
                defaultChecked={checkedState}
                type="radio"
                disabled={review}
                className={checkedState ? "checked-input" : ""}
              ></input>
              <span
                className={`${type === "listening" && "border-[1px] border-primary1"} checkmark ${review && isChoosed?.[0]?.answer.title?.[0].text === correct
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
