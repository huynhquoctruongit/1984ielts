import { useState, useEffect } from "react";
const ControlParts = ({ parts, getIndexPart }: any) => {
  const [indexNumber, setIndex] = useState(0);
  const [disable, setDisable] : any = useState({
    next: false,
    prev: false,
  });

  let indexItem = indexNumber;
  const control = (type: string) => {
    if (type == "next") {
      if (indexNumber + 1 < parts.length) {
        indexItem = indexItem + 1;
        setIndex(indexItem);
        getIndexPart(indexItem);
      }
    } else {
      if (indexItem >= 1) {
        indexItem = indexItem - 1;
        setIndex(indexItem);
        getIndexPart(indexItem);
      }
    }
  };
  useEffect(() => {
    if (indexNumber == 0) {
      setDisable({
        ...disable,
        prev: true,
      });
    } else {
      setDisable({
        ...disable,
        prev: false,
      });
      if (indexNumber + 1 == parts.length) {
        setDisable({
          next: true,
        });
      } else {
        setDisable({
          next: false,
        });
      }
    }
  }, [indexNumber, parts]);
  if (parts?.length <= 1) return null;

  return (
    <div className="sticky bottom-[0px] border-solid border-t-[0.5px] border-neu3">
      <div className="flex items-center justify-between">
        <div
          className={`cursor-pointer flex justify-center bg-neu1 text-white w-full px-[12px] lg:h-[48px] h-[40px] lg:px-[58px] lg:py-[12px] text-center`}
          onClick={() => control("prev")}
        >
          <p className="caption lg:body3 m-auto text-center">Previous</p>
        </div>
        <div className="flex justify-center bg-white w-full px-[12px] lg:h-[48px] h-[40px] lg:px-[48px] lg:py-[12px] text-center line-clamp-1 truncate overflow-hidden">
          <p className="truncate caption lg:body3 m-auto text-center">{parts?.[indexNumber]?.title || `Part ${indexNumber + 1}`}</p>
        </div>
        <div
          className={`cursor-pointer flex justify-center bg-neu1 text-white w-full px-[12px] lg:h-[48px] h-[40px] lg:px-[58px] lg:py-[12px] text-center`}
          onClick={() => control("next")}
        >
          <p className="caption lg:body3 m-auto text-center">Next</p>
        </div>
      </div>
    </div>
  );
};
export default ControlParts;
