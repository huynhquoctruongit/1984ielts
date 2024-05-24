import { useRef, useEffect } from "react";
import useOnClickOutside from "../../../../hook/outside";
import { CloseIcon } from "@/components/icons/svg";
const SubmitModal = ({ onClose, img }: any) => {
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });

  return (
    <div>
      <div ref={ref} className="relative flex h-[90vh] overflow-auto p-[20px] bg-white lg:min-w-[500px] w-[90%] mx-auto text-left p-[30px] rounded-[20px] md:w-[100vh]">
        <div className="m-auto max-h-[90vh]">
          <img className="w-[95%] max-h-[80vh] m-auto" src={img}></img>
        </div>
        <div className="absolute top-[20px] right-[20px] icon-close-image" onClick={onClose}><CloseIcon fill="black" className="cursor-pointer w-[20px]"></CloseIcon></div>
      </div>
    </div>
  );
};
export default SubmitModal;
