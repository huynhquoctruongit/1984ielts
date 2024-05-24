import { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody, CardHeader } from "@nextui-org/react";
import { sliceLongText } from "@/services/helper";

const QuestionUI = ({ data }: any) => {
  const radiusList = ["full"];
  const [listTab, setTab] = useState([]);
  const [selected, setSelected] : any = useState("1");
  const content = data?.content;
  const question = data?.question;
  useEffect(() => {
    setTimeout(() => {
      let arr = [];
      var h3Elements = Array.from(document.querySelectorAll("h3"));
      const filterArr = h3Elements?.filter((elm) => {
        const textContent = elm.textContent.trim();
        if (textContent !== "") {
          return true;
        }
        return false;
      });
      filterArr.forEach(function (h3Element, index) {
        var childElements = h3Element.querySelectorAll("*");
        const idName = `title-h3-${index}`;
        h3Element.classList.add("title-h3");
        h3Element.id = idName;
        if (childElements?.length > 0) {
          childElements.forEach(function (childElement) {
            arr.push({
              text: childElement.textContent,
              number: index,
              id: idName,
            });
          });
        } else {
          arr.push({
            text: h3Element.textContent,
            number: index,
            id: idName,
          });
        }
      });
      setTab(arr);
    }, 100);
  }, [data]);
  let arrRed = [];
  useEffect(() => {
    var targetDivs = document.getElementsByClassName("title-h3");
    var wrapContent = document.getElementById("wrap-content");
    var refDiv = document.getElementsByClassName("ref-navigate");
    wrapContent.addEventListener("scroll", function () {
      var wrapContentRect = wrapContent.getBoundingClientRect();
      for (var i = 0; i < targetDivs.length; i++) {
        var divRect = targetDivs[i].getBoundingClientRect();
        const refId = document.getElementById(`ref-${targetDivs[i].id}`);
        const minius = targetDivs.length - 1 == i ? 0 : 70;
        if (divRect.top - 50 <= wrapContentRect.top && divRect.bottom + 50 <= wrapContentRect.bottom) {
          var refDivArray = Array.from(refDiv);
          const listDeActive = refDivArray.filter((elm) => elm.id !== `ref-title-h3-${i}`);
          listDeActive.map((elm) => {
            elm.classList.remove("active-ref");
          });
          refId.classList.add("active-ref");
        } else {
          refId.classList.remove("active-ref");
        }
      }
    });
  }, []);

  return (
    <div className="lg:overflow-y-scroll lg:h-[calc(100vh-58px)]">
      <div className="p-[20px] md:px-[42px] md:py-[20px]">
        {question && (
          <div className="border-[1px] border-neu3 p-[20px] italic font-semibold">
            <div dangerouslySetInnerHTML={{ __html: question }}></div>
          </div>
        )}
      </div>
      <div id="wrap-content" className="content-tab-writing bg-white relative">
        <div className="sticky top-0 bg-white flex w-full flex-col items-center overflow-x-auto py-[10px]">
          <Tabs selectedKey={selected} onSelectionChange={(e: any) => setSelected(e)} key={"full"} color="primary" variant="bordered" size="lg" aria-label="Tabs radius">
            {data?.parts?.map((elm, index) => (
              <Tab key={index + 1} title={sliceLongText(elm.title || `Part ${index + 1}`, 12)} />
            ))}
          </Tabs>
        </div>
        {data?.parts?.map((elm, index) => {
          if (index + 1 == selected) return <div className="p-[20px] md:px-[42px] md:py-[20px]" dangerouslySetInnerHTML={{ __html: elm.content }}></div>;
        })}
      </div>
    </div>
  );
};
export default QuestionUI;
