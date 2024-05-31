import { useRef, useEffect } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
import useOnClickOutside from "../../../../hook/outside";
const SubmitModal = ({ onClose, onSubmit }: any) => {
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });
  return (
    <div ref={ref} className="bg-white lg:min-w-[500px] w-[90%] mx-auto text-center p-[30px] rounded-[20px]">
      <div className="p-[20px] w-full">
        <img src="/images/premium.png" className="w-[150px] text-center mx-auto"></img>
        <div className="body3 my-[30px] text-center">Bạn cần phải mua khoá học để có thể truy cập bài học trên</div>
        <div className="flex items-center justify-center gap-[20px]">
          <div onClick={onClose} className="cursor-pointer bg-neu4 px-[30px] py-[10px] text-black rounded-[8px] mt-[20px]">Mua sau</div>
          <div onClick={onSubmit} className="cursor-pointer bg-primary1 px-[20px] py-[10px] text-white rounded-[8px] mt-[20px]">Mua ngay</div>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
