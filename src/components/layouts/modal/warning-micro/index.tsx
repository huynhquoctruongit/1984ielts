import { useRef, useEffect } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
const WarningMicro = ({ onClose }: any) => {
  return (
    <div className="bg-white lg:min-w-[500px] w-[90%] mx-auto text-center p-[30px] rounded-[20px]">
      <div className="m-auto">
        <p className="headline1 text-primary1">Thông báo</p>
        <p className="body5 mt-[20px]">Bạn cần cấp quyền cho micro để bắt đầu làm bài !</p>
      </div>
    </div>
  );
};
export default WarningMicro;
