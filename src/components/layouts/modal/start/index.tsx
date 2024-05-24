import Button from "../../../ui/button/index";
import useOnClickOutside from "../../../../hook/outside";
import { Link, useNavigate } from "react-router-dom";
const SubmitModal = ({ isLimited, onClose, onSubmit, isLimitedPopup }: any) => {
  const navigate = useNavigate();
  return (
    <div className="bg-white lg:min-w-[500px] max-w-[700px] w-[90%] mx-auto text-center px-[30px] rounded-[20px]">
      <div className="m-auto translate-y-[-45px]">
        <img src="/images/image1.png" width="390px" className="m-auto" />
        {isLimitedPopup?.isLimit == "unlimit" ? (
          <div>
            <p className="headline1 text-primary1">Would you like to start your test?</p>
            <div className="flex items-center justify-center mt-[29px]">
              <Link to="/home">
                <Button className="bg-neu4 text-neu2 mr-[5px] md:mr-[30px]">Close</Button>
              </Link>
              <Button onClick={onSubmit} className="bg-primary2 text-white">
                Start
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="headline1 text-primary1">Would you like to start your test?</p>
            <p className="body5 my-[20px]">
              You have used <span className="text-primary2 font-bold text-[23px]">{isLimited?.used}</span> attempts. Once you press 'Continue', the time will start counting down.
              Are you sure to begin the test now?
            </p>
            <div className="flex items-center justify-center mt-[29px]">
              <Link to="/home">
                <Button className="bg-neu4 text-neu2 mr-[5px] md:mr-[30px]">Cancel</Button>
              </Link>
              <Button onClick={onSubmit} className="bg-primary2 text-white">
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default SubmitModal;
