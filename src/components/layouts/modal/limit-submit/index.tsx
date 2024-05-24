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
        <img src="/images/start-img.png" className="w-full md:w-[300px] m-auto" />
        <p className="body5 mt-[20px]">You have used all your attempts.</p>
        <div className="flex items-center justify-center mt-[29px]">
          <Link to="/home">
            <button className="bg-white border-[1px] border-solid border-primary1 text-primary1 px-[50px] h-[40px] mr-[20px] rounded-[30px]">Go back</button>
          </Link>
          <div onClick={onClose}>
            <button className="bg-primary1 text-white px-[50px] h-[40px] mr-[20px] rounded-[30px]">View only</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
