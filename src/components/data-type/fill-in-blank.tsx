import { useEffect, useState } from "react";
import { regexFillBlank, endcodeUTF8, replaceSpace } from "@/services/helper";
import Button from "@/components/ui/button";
import { PageIcon, ListenHereIcon } from "@/components/icons";
import LocationButton from "../layouts/location-button/index";

export const FillInBlank = ({ playSections, key, indexPart, listAnswer, quiz, sameLocate, dataItem, data, changed, index, answerListStore, review, type }: any) => {
  const elmFill = regexFillBlank(quiz?.parts?.[indexPart]?.content);
  const [status, setStatus]: any = useState({});
  const [arrInput, setArrInput]: any = useState();

  const string = endcodeUTF8(data);
  var text = string;
  const regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;

  var matches = [...text.matchAll(regex)];
  var output = [] as any;
  var container = document.createElement("div") as any;
  matches.map((item, index) => {
    var words = item[1].split("|");
    var number = item[2];
    output.push({
      id: number,
      texts: words,
    });

    var spanWrapper = document.createElement("span") as any;
    var span = document.createElement("span") as any;
    var spanQuestion = document.createElement("span") as any;
    var input = document.createElement("input") as any;
    spanWrapper.className = "no-highlight";
    spanQuestion.className = "question-index";
    spanQuestion.id = `inputIndex-${number}`;
    spanQuestion.innerText = number;

    input.id = `inputValue-${indexPart}-${number}`;
    input.className = "input-fill";

    spanWrapper.appendChild(span) as any;
    spanWrapper.appendChild(input) as any;
    span.appendChild(spanQuestion) as any;
    container.appendChild(spanWrapper) as any;

    review &&
      answerListStore?.[0]?.detail?.[indexPart]?.map((item: any) => {
        input.disabled = true;
        if (item?.question == number) {
          item.answer.title.map((elm: any) => {
            input.defaultValue = elm;
            const eleNumber = item.question == number;
            if (eleNumber) {
              const isCorrect = words.find((wordItem: any) => {
                if (replaceSpace(wordItem).toLowerCase() == replaceSpace(elm)?.toLowerCase()) {
                  return true;
                }
              });

              if (isCorrect) input.style = "color : #038C4C; cursor : not-allowed";
              else input.style = "color : #C12525; cursor : not-allowed";
            }
          });
        }
      });
  });
  var newText = text
    .replace(regex, () => {
      var replacement = container?.firstChild?.outerHTML;
      container?.firstChild?.remove();
      return replacement;
    })
    .replace(/@/g, "");
  useEffect(() => {
    listAnswer?.[0]?.map((item: any) => {
      const input = document.getElementById(`inputValue-${indexPart}-${item.question}`) as any;
      if (input) {
        input.value = item?.answer?.title?.[0];
      }
    });
  }, [listAnswer]);
  useEffect(() => {
    setTimeout(() => {
      matches.map((item, index): any => {
        const el = document.getElementById(`inputValue-${indexPart}-${item[2]}`) as any;
        if (el) {
          el.addEventListener("input", (e: any) => {
            const inputValue = e?.target?.value as any;
            setArrInput({ id: item[2], text: inputValue });
          });
        }
      });
    }, 100);
  }, [indexPart]);
  const onExplain = (isExplain: any, id: any) => {
    setStatus({
      ...status,
      [id]: !isExplain,
    });
  };
  useEffect(() => {
    if (arrInput && dataItem && changed) {
      changed(arrInput, dataItem, "fill-in-blank");
    }
  }, [arrInput]);
  const returnExplain = (id: any) => {
    if (id !== "" && dataItem?.explain) {
      var result = null;
      const text = dataItem?.explain;
      const regex = /{([^}]+)\[(\d+(?:-\d+)?)\]}/g;

      for (const match of text?.matchAll(regex)) {
        const [fullMatch, content, numbers] = match;
        const cleanedContent = content.substring(1, content.length - 1);
        if (numbers == id) {
          result = cleanedContent;
        }
      }
      return result;
    }
  };
  const res = (data, item) => {
    console.log(data, item);
    if (playSections) {
      playSections(data, item)
    }
  }
  return (
    <div key={key} className="mt-[10px] pb-[20px]" id={`location-jumpto-${dataItem?.location}`}>
      {dataItem?.description && (
        <div className="mb-[21px]" id={`question-${dataItem?.id}`}>
          <div className="content-cms" dangerouslySetInnerHTML={{ __html: dataItem?.description || "" }}></div>
        </div>
      )}
      <div className="flex items-center mb-[18px]">
        <div
          onClick={() => review && res(0, dataItem.listen_from)}
          className={`${review && dataItem.listen_from && "cursor-pointer"} flex items-center py-[4px] px-[14px] bg-white rounded-[10px] w-fit mr-[18px] headline1 text-primary1`}
          style={{
            boxShadow: "0px 0px 4px rgba(25, 110, 194, 0.6)",
          }}
        >
          {(type === "listening" && review && dataItem.listen_from) && <div className="border-[2px] border-[#2B3242] rounded-full p-[6px] mr-[10px]"><ListenHereIcon /></div>}
          {dataItem?.location}
          <span className="mx-[2px]">-</span>
          {output[output.length - 1]?.id}
        </div>
        <p className="body3 text-neu1">{dataItem?.title}</p>
      </div>
      <div className="mb-[20px]">
        <div className="body5 leading-[40px] content-cms" dangerouslySetInnerHTML={{ __html: newText }}></div>
      </div>
      {review &&
        output.map((item: any) => {
          let result = null;
          elmFill?.find((elm) => {
            var regexSameLocation = new RegExp("\\b" + item?.id + "\\b");
            if (elm?.[2] === item?.id || regexSameLocation.test(elm?.[2])) {
              result = item.id;
            }
          });
          return (
            <div className="mb-[20px]">
              <div className="flex items-center justify-between flex-wrap gap-y-[20px]">
                <div className="border-type bg-[#e7e5e1] px-[20px] py-[10px] rounded-[8px] flex items-center mr-[22px] ld:mb-0 mb-[20px]">
                  <span className="body3">{item.id}. Answer</span>
                  <div className="flex items-center flex-wrap body5 text-green ml-[10px]">
                    {item?.texts.map((itemTitle: any, indexTitle: any) => (
                      <p className="flex items-center" key={indexTitle}>
                        <div className="body5 leading-[35px] content-cms" dangerouslySetInnerHTML={{ __html: itemTitle }}></div>
                        {indexTitle !== item?.texts.length - 1 && <span className="mx-[10px]">|</span>}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  {result && <LocationButton sameLocate={sameLocate} id={result} />}
                  {returnExplain(item.id) && (
                    <Button onClick={() => onExplain(status[item.id], item.id)} className="bg-green1 text-white ml-[8px]">
                      <PageIcon className="mr-[4px]" />
                      Explain
                    </Button>
                  )}
                </div>
              </div>
              {returnExplain(item.id) &&
                Object.keys(status).map((key, index) => {
                  if (key == item.id && status[item.id]) {
                    return (
                      <div
                        className="content-cms overflow-x-auto bg-white border-[#e7e5e1] border-[1px] py-[25px] px-[23px] rounded-[20px] mt-[24px]"
                        dangerouslySetInnerHTML={{ __html: returnExplain(item.id) || "" }}
                      ></div>
                    );
                  }
                })}
            </div>
          );
        })}
    </div>
  );
};
