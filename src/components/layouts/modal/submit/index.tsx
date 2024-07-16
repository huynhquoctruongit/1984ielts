import { useRef } from "react";
import Button from "../../../ui/button/index";
import useOnClickOutside from "../../../../hook/outside";
import { Spin } from "antd";
const SubmitModal = ({ onClose, onSubmit, isWaitSubmit }: any) => {
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });
  return (
    <div ref={ref} className="bg-white relative lg:min-w-[500px] w-[90%] mx-auto text-center rounded-[20px]">
      <div className="m-auto translate-y-[-45px]  px-[30px]">
        <img src="/images/image1.png" width="390px" className="m-auto" />
        <p className="headline1 text-primary1">Are you sure?</p>
        <p className="body5">Once you submit your work, you won't be able to make any edits. If you're certain, click 'Yes, I'm ready' to proceed.</p>
        <div className="flex items-center justify-center mt-[29px]">
          <div onClick={onClose} className="px-[20px] py-[6px] rounded-[20px] body-3 md:body2 bg-neu4 text-neu2 lg:mr-[55px] mr-[5px]">
            Let me check again
          </div>
          <div onClick={onSubmit} className={`px-[20px] py-[6px] rounded-[20px] body-3 md:body2 bg-primary2 text-center text-white relative ${!isWaitSubmit ? "opacity-[1]" : "opacity-[0.5]"}`}>
            {!isWaitSubmit ? "Yes, I’m ready!" : "Waiting to submit ..."}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
