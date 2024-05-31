import useClass from "@/components/layouts/menu/helper/use-class";
import { ProgressItem } from "@/components/layouts/menu/section";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const SelectLesson = ({ className }: any) => {
  const [showOptions, setShowOptions] = useState(false);
  const params = useParams();
  const { current, menus } = useClass(params.classId);
  const navigate = useNavigate();

  const handleClick = () => {
    setShowOptions(!showOptions);
  };

  const handleOptionClick = (option) => {
    navigate("/class/" + params.classId + "?section=" + option);
    setShowOptions(false);
  };
  return (
    <div className={`w-full rounded-xl border border-neutral-06 px-2.5 py-2 relative ${className || ""}`}>
      <div className="flex items-center text-light-00" onClick={handleClick}>
        <div className="flex items-center h9 gap-2">
          <ProgressItem percentage={current.statistic?.percentage || 0} />
          {current.section?.title || "Select an option"}
        </div>

        <div className="ml-auto">
          <ChevronDownIcon className="w-4 h-4" />{" "}
        </div>
      </div>
      {showOptions && (
        <div className="absolute z-10 top-full left-0 w-full">
          <div className="mt-2 rounded-xl border border-neutral-06 mb-3 py-4 bg-white">
            {menus.map((option) => (
              <div
                key={option.id}
                className={`px-4 py-2 rounded-md flex h9 items-center gap-2 ${current.section.id === option.id ? "active" : ""}`}
                onClick={() => handleOptionClick(option.id)}
              >
                <ProgressItem percentage={option.statistic?.percentage || 0} />
                {option.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectLesson;
