import { useRef, useEffect } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
import useOnClickOutside from "../../../../hook/outside";
const SubmitModal = ({ onClose, children, isData }: any) => {
  console.log(children, "children");

  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });
  const NotfoundPage = () => {
    return (
      <div className="flex items-center flex-col justify-center w-full">
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/understand-customers-6263579-5126816.png?f=webp" className="w-100" alt="" />
        <div className="text-5xl tracking-widest font-black text-black/90 text-center">404 NOT FOUND</div>
      </div>
    );
  };
  return (
    <div ref={ref} className="max-h-[90vh] overflow-auto p-[20px] bg-white lg:min-w-[500px] w-[90%] mx-auto text-left p-[30px] rounded-[20px]">
      <div className="m-auto max-h-[90vh]">
        {isData ? children : <NotfoundPage />}
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
