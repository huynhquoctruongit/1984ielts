import { useState, useEffect } from "react";
import { getAlphabetIndex, regexFillBlank } from "@/services/helper";
import Button from "@/components/ui/button";
import { PageIcon,ListenHereIcon } from "@/components/icons";
import LocationButton from "../layouts/location-button/index";

export const Checkbox = ({ playSections, key, quiz, type, sameLocate, dataItem, data, index, changed, answerListStore, review, listAnswer, indexPart }: any) => {
  const elmFill = regexFillBlank(quiz?.parts?.[indexPart]?.content);
  const [status, setStatus]: any = useState({});
  const [listSelected, setListSelected]: any = useState();

  const getIndex = data?.filter((elm: any) => elm.correct);
  const selected = (e: any, alPhabet: any, itemRender: any) => {
    var temp = itemRender;
    temp["answer"] = alPhabet;
    temp["location"] = dataItem.order - getIndex?.length + 1;
    changed(temp, dataItem, "checkbox");
  };
  const onExplain = (isExplain: any, id: any) => {
    setStatus({
      ...status,
      [id]: !isExplain,
    });
  };
  useEffect(() => {
    let list = [];
    if (listAnswer?.[0]) {
      list = listAnswer?.[0]?.filter((elm: any) => elm.question == dataItem.id);
    }
    setListSelected(list);
  }, [listAnswer]);

  useEffect(() => {
    let count = 0;
    data?.map((elm: any) => {
      if (elm.correct == true) {
        count = count + 1;
      }
    });
    const checkboxes = document.querySelectorAll(`.input-checkbox-${indexPart}-${dataItem.id}`);
    const checkboxesArray = Array.from(checkboxes);
    if (review) {
      checkboxesArray.map((checkbox: any, index: any) => {
        checkbox.disabled = true;
      });
    } else {
      if (listSelected && listSelected[0]?.answer?.title?.length >= count) {
        checkboxesArray.map((checkbox: any, index: any) => {
          if (checkbox?.checked) {
            checkbox.disabled = false;
          } else {
            checkbox.disabled = true;
          }
        });
      } else {
        checkboxesArray.map((checkbox: any, index: any) => {
          checkbox.disabled = false;
        });
      }
    }
  }, [listSelected]);
  const dataArr = data?.filter((elm: any) => elm?.correct === true);
  return (
    <div key={key} className="py-[20px]">
      {dataItem?.description && (
        <div className="mb-[21px]">
          <div className=" text-primary1" id={`question-${dataItem.id}`}>
            <div className="content-cms" dangerouslySetInnerHTML={{ __html: dataItem?.description }}></div>
          </div>
        </div>
      )}
      <div className="flex items-center mb-[18px]" id={"location-jumpto-" + dataItem?.order}>
        <div
          onClick={() => review && playSections(0, dataItem.listen_from)}
          className={`${review && dataItem.listen_from && "cursor-pointer"} flex items-center whitespace-nowrap py-[4px] px-[14px] bg-white rounded-[10px] w-fit mr-[18px] headline1 text-primary1`}
          style={{
            boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)",
          }}
        >
          {(type === "listening" && review && dataItem.listen_from) && <div className="border-[2px] border-[#2B3242] rounded-full p-[6px] mr-[10px]"><ListenHereIcon /></div>}
          {dataItem?.order}
          {getIndex?.length > 1 && <span> - {getIndex?.length + dataItem?.order - 1}</span>}
        </div>
        <p className="body3 text-neu1">{dataItem.title}</p>
      </div>
      {dataItem?.content && (
        <div
          className="content-cms overflow-auto bg-white border-[#e7e5e1] border-[1px] py-[25px] px-[23px] rounded-[20px] my-[24px]"
          dangerouslySetInnerHTML={{ __html: dataItem?.content }}
        ></div>
      )}
      {data.map((itemRender: any, index: any) => {
        let correctTitle = "";
        const isChoosed = answerListStore?.map((item: any) => {
          if (item) {
            return item.detail?.[indexPart]?.find((itemDetail: any) => {
              if (itemDetail) {
                if (itemDetail.question === dataItem.id) {
                  return itemDetail?.answer?.title?.map((title: any) => {
                    return title.text === itemRender.text;
                  });
                }
              }
            });
          }
        });

        if (itemRender?.correct === true) {
          correctTitle = itemRender.text;
        }
        const elmCorrect = isChoosed[0]?.answer?.title.find((elm: any) => elm.text === correctTitle);
        const elmWrong = isChoosed[0]?.answer?.title.find((elm: any) => elm.text === itemRender.text);
        const isChecked = listSelected?.[0]?.answer?.title.find((item: any) => item.text == itemRender.text);
        return (
          <div className="flex items-center mb-[20px]" id={"location-jumpto-" + getAlphabetIndex(index)}>
            <span className="mr-[12px] text-primary1 rounded-full px-[7px] py-[2px] body3 no-highlight">{getAlphabetIndex(index)}</span>
            <label className={`container-checkbox ${review ? "cursor-not-allowed" : "cursor-pointer"}`} htmlFor={`checkbox-${index}-${dataItem.id}`}>
              <input
                onChange={(e: any) => selected(e, getAlphabetIndex(index), itemRender as any)}
                id={`checkbox-${index}-${dataItem.id}`}
                name={`checkbox-${dataItem.id}`}
                className={`input-checkbox-${indexPart}-${dataItem.id}`}
                type="checkbox"
                checked={isChecked?.text == itemRender.text}
                disabled={review}
              ></input>
              <span
                className={`${type === "listening" && "border-[1px] border-primary1"} checkmark-checkbox ${review && elmCorrect ? "bg-green1" : (elmWrong && review && "bg-primary2") || "bg-white"
                  }`}
              ></span>
              <span className="body5 ml-[30px]">{itemRender.text}</span>
            </label>
          </div>
        );
      })}
      {review && (
        <div>
          {dataArr?.map((itemRender: any, index: any) => {
            const indexElm = data.findIndex((elm: any) => elm.text === itemRender.text);
            const location = dataItem?.order + index;

            let result = null;
            elmFill?.find((elm) => {
              var regexSameLocation = new RegExp("\\b" + location + "\\b");
              if (elm?.[2] == location || regexSameLocation.test(elm?.[2])) {
                result = location;
              }
            });
            return (
              <div className="mb-[20px]">
                <div className="flex items-center justify-between flex-wrap gap-y-[20px]">
                  <div className="bg-[#e7e5e1] px-[20px] w-[200px] rounded-[8px] flex items-center mr-[22px]">
                    <span className="body3">{location}. Answer</span>
                    <span className="headline1 text-green ml-[10px]">{getAlphabetIndex(indexElm)}</span>
                  </div>
                  <div className="flex items-center">
                    {result && <LocationButton sameLocate={sameLocate} id={location} />}
                    {itemRender.explain && (
                      <Button onClick={() => onExplain(status[location], location)} className="bg-green1 text-white ml-[8px]">
                        <PageIcon className="mr-[4px]" />
                        Explain
                      </Button>
                    )}
                  </div>
                </div>
                {Object.keys(status).map((key, index) => {
                  if (key == location && status[key]) {
                    return (
                      <div
                        className="content-cms overflow-x-auto bg-white border-[#e7e5e1] border-[1px] py-[25px] px-[23px] rounded-[20px] mt-[24px]"
                        dangerouslySetInnerHTML={{ __html: itemRender.explain || "" }}
                      ></div>
                    );
                  }
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
