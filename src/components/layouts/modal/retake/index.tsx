import { useRef } from "react";
import Button from "../../../ui/button/index";
import useOnClickOutside from "../../../../hook/outside";
import { Link } from "react-router-dom";
const SubmitModal = ({ onClose,onSubmit }: any) => {
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });
  return (
    <div
      ref={ref}
      className="bg-white lg:min-w-[500px] w-[90%] mx-auto text-center px-[30px] rounded-[20px]"
    >
      <div className="m-auto translate-y-[-45px]">
        <img src="/images/image1.png" width="390px" className="m-auto" />
        <p className="headline1 text-primary1">
        Would you like to retake your test?
        </p>
        <p className="body5">
        Fresh start can remove your progress
        </p>
        <div className="flex items-center justify-center mt-[29px]">
          <Button onClick={onClose} className="bg-neu4 text-neu2 lg:mr-[55px] mr-[10px]">
          No, Pleasse
          </Button>
          <Button onClick={onSubmit} className="bg-primary2 text-white">
         Retake
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
