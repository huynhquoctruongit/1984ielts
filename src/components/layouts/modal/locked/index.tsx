import { useRef, useEffect } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
import useOnClickOutside from "../../../../hook/outside";
const SubmitModal = ({ onClose }: any) => {
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });
  return (
    <div ref={ref} className="bg-white lg:min-w-[500px] w-[90%] mx-auto text-center p-[30px] rounded-[20px]">
      <div className="m-auto">
        <p className="headline1 text-primary1">Thông báo</p>
        <p className="body5 mt-[20px]">Bài học này chưa được mở khoá !</p>
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
