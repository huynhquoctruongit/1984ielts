import { useRef, useEffect } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
import useOnClickOutside from "../../../../hook/outside";
import { useToast } from "@/context/toast";
import { CopyIcon } from "@/components/icons/svg";
const SubmitModal = ({ onClose, content, isData }: any) => {
  const ref: any = useRef();
  const { fail, success }: any = useToast();
  useOnClickOutside(ref, () => {
    onClose();
  });
  const copyFunc = () => {
    const valueSample = document.getElementById("content-sample")?.innerText;
    navigator.clipboard
      .writeText(valueSample)
      .then(() => {
        success("Đã sao chép");
      })
      .catch((err) => {
        fail("Lỗi khi sao chép");
      });
  };
  return (
    <div ref={ref} className="max-h-[90vh] overflow-auto p-[20px] bg-white lg:min-w-[500px] w-[90%] mx-auto text-left p-[30px] rounded-[20px]">
      <div className="m-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-[12px]">
          <p className="body1">Sample</p>
          <div
            onClick={() => {
              copyFunc();
            }}
            className="cursor-pointer px-[12px] py-[3px] rounded-[5px] bg-neu1 text-white flex items-center"
          >
            <p className="mr-[4px]">Copy</p>
            <CopyIcon></CopyIcon>
          </div>
        </div>
        <div className="content-cms" id="content-sample" dangerouslySetInnerHTML={{ __html: content }}></div>
        <div className="flex items-center justify-center mt-[29px]">
          <button onClick={onClose} className="bg-white px-[30px] h-[40px] box-shadow rounded-[10px]">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
