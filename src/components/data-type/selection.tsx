import { useState, useEffect } from "react";
import { getAlphabetIndex, regexFillBlank } from "@/services/helper";
import Button from "@/components/ui/button";
import { PageIcon, LocateIcon, RightIcon } from "@/components/icons";
import LocationButton from "../layouts/location-button/index";

export const Selection = ({ key, listAnswer, indexPart, quiz, type, sameLocate, dataItem, data, option, index, changed, review, answerListStore }: any) => {
  const [isExplain, setExplain] = useState(false);
  const [status, setStatus]: any = useState({});
  const [listSelected, setListSelected]: any = useState();

  const elmFill = regexFillBlank(quiz?.parts?.[indexPart]?.content);
  const selected = (item: any, elm: any) => {
    const plusAnswer = { text: item.text, answer: elm.target.value };
    changed(plusAnswer, dataItem, "selection");
  };

  const onExplain = (isExplain: any, id: any) => {
    setStatus({
      ...status,
      [id]: !isExplain,
    });
  };
  useEffect(() => {
    let list = listAnswer?.[0]?.filter((elm: any) => elm.question == dataItem.id);
    setListSelected(list);
  }, [listAnswer]);

  return (
    <div key={key} className={`mt-[10px] ${dataItem?.selection?.length > 1 && "pb-[20px]"}`}>
      <div className="mb-[15px]">
        <div className="mb-[20px]">
          <div className="" id={`question-${dataItem.id}`}>
            <div className="content-cms" dangerouslySetInnerHTML={{ __html: dataItem?.description }}></div>
          </div>
        </div>
        {dataItem?.selection?.length > 1 && (
          <div className="flex items-center">
            <div className="flex items-center">
              <div
                className="py-[2px] px-[14px] bg-white rounded-[10px] w-fit mr-[18px] headline1 text-primary1 whitespace-nowrap"
                style={{
                  boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)",
                }}
              >
                {dataItem?.location + 1 - data?.length} - {dataItem?.location}
              </div>
            </div>
            <p className="body3 text-neu1 mt-[30px] mb-[30px]">{dataItem.title}</p>
          </div>
        )}
        {dataItem?.content && (
          <div
            className="content-cms overflow-auto bg-white border-[#e7e5e1] border-[1px] py-[25px] px-[23px] rounded-[20px] my-[24px]"
            dangerouslySetInnerHTML={{ __html: dataItem?.content }}
          ></div>
        )}
        {data.map((itemRender: any, indexRender: any) => {
          let correctTitle = "";
          const isChoosed = answerListStore?.map((item: any) => {
            if (item) {
              return item.detail?.[indexPart]?.find((itemDetail: any) => {
                if (itemDetail) {
                  if (itemDetail.question === dataItem.id) {
                    return itemDetail?.answer?.title?.map((title: any) => {
                      return title === itemRender.text;
                    });
                  }
                }
              });
            }
          });

          if (itemRender?.correct === true) {
            correctTitle = itemRender.text;
          }
          const check = isChoosed?.[0]?.answer?.title.filter((elm: any) => elm.text === itemRender.text);

          const elmCorrect = isChoosed[0]?.answer?.title.find((elm: any) => {
            if (elm.text === itemRender.text) {
              return elm.answer === itemRender.answer;
            }
          });

          const isChecked = listSelected?.[0]?.answer?.title.find((item: any) => item.answer);
          const isFocusItem = isChecked?.id == dataItem?.id

          return (
            <div className="flex items-center mb-[20px]" key={"location-jumpto-" + dataItem?.order}>
              <div className="flex items-center">
                <div
                  className="py-[2px] px-[14px] bg-white rounded-[10px] w-fit mr-[18px] headline1 text-primary1"
                  style={{
                    boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)",
                  }}
                >
                  {dataItem?.order}
                </div>
              </div>
              <div className="flex items-center">
                {review ? (
                  <div
                    className={`${
                      elmCorrect ? "bg-green1" : "bg-primary2"
                    } cursor-not-allowed h-[31px] p-[10px] rounded-[4px] whitespace-nowrap text-white body3 flex items-center justify-between min-w-[120px] max-w-[200px]`}
                  >
                    <p>{check?.[0]?.answer}</p>
                    <RightIcon width="15px" className="rotate-90" />
                  </div>
                ) : (
                  <select
                    onChange={(elm) => selected(itemRender, elm)}
                    className={`${type === "listening" && "border-[1px] border-primary1"} bg-white min-w-[120px] max-w-[200px] h-[31px] p-[5px] rounded-[4px] select-option`}
                  >
                    <option value="" selected disabled hidden></option>
                    {option.map((data: any) => (
                      <option key={data.option} selected={isChecked?.answer == data.option && isFocusItem}>{data.option}</option>
                    ))}
                  </select>
                )}

                <p className={`ml-[12px] ${review ? "cursor-not-allowed" : "cursor-pointer"}`}>{itemRender.text}</p>
              </div>
            </div>
          );
        })}
        {review && (
          <div>
            {data?.map((itemRender: any, index: any) => {
              const location = dataItem?.order;
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
                    <div className="bg-[#e7e5e1] px-[20px] min-w-[200px] py-[12px] rounded-[8px] flex items-center mr-[22px]">
                      <span className="caption">Answer</span>
                      <span className="body3 font-bold text-green ml-[10px] whitespace-nowrap">{itemRender.answer}</span>
                    </div>
                    <div className="flex items-center">
                      {result && <LocationButton sameLocate={sameLocate} id={location} />}
                      {dataItem.explain && (
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
                          dangerouslySetInnerHTML={{ __html: dataItem.explain || "" }}
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
    </div>
  );
};
