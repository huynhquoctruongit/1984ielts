import { useRef } from "react";
import Button from "../../../ui/button/index";
import useOnClickOutside from "../../../../hook/outside";
import { Link } from "react-router-dom";
const SubmitModal = ({ onClose, onSubmit }: any) => {
  const ref: any = useRef();
  useOnClickOutside(ref, () => {
    onClose();
  });
  return (
    <div ref={ref} className="bg-white lg:min-w-[500px] w-[90%] mx-auto text-center px-[30px] rounded-[20px]">
    <div className="m-auto translate-y-[-45px]">
      <img src="/images/image1.png" width="390px" className="m-auto" />
        <p className="lg:headline1 body3 text-primary1">Do you want to start speaking now?</p>
        <div className="flex items-center justify-center mt-[29px]">
          <Button onClick={onClose} className="bg-neu4 text-neu2 lg:mr-[55px] mr-[5px] min-w-[150px] flex items-center justify-center">
            No
          </Button>
          <Button onClick={onSubmit} className="bg-primary1 text-white min-w-[150px] flex items-center justify-center">
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
