import { useRef, useEffect } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
var refCount: any = null;
const SubmitModal = ({ onClose, onSubmit }: any) => {
  const ref: any = useRef();
  useEffect(() => {
    var circleBorder: any = document.getElementById("circle-border");
    var numberCount: any = document.getElementById("number-count");
    if (circleBorder) {
      var countdown = 5;
      refCount = setInterval(function () {
        countdown = --countdown <= 0 ? 5 : countdown;
        if (countdown === 1) {
          circleBorder.style.backgroud = "#F2F3F4";
          numberCount.innerHTML = 0;
          onClose();
          onSubmit();
        }
        numberCount.innerHTML = countdown;
      }, 1000);
      circleBorder.style.animation = "countdown 4.2s linear infinite forwards";
    }
    return () => {
      clearInterval(refCount);
    };
  }, []);

  return (
    <div ref={ref} className="bg-white lg:min-w-[500px] w-[90%] mx-auto text-center p-[30px] rounded-[20px]">
      <div className="m-auto">
        <p className="headline1 text-primary1">Thông báo</p>
        <p className="body5">Sau 5 giây, hệ thống sẽ tự động thay đổi bài tiếp theo.</p>
        <div className="mt-[40px] mb-[40px]">
          <div id="countdown">
            <div className="py-[20px] px-[30px] rounded-full w-fit m-auto border-[5px] border-neu5 headline1 text-primary1" id="number-count">
              5
            </div>
            <svg id="svg-border">
              <circle id="circle-border" r="42" cx="45" cy="45"></circle>
            </svg>
          </div>
        </div>
        <div className="flex items-center justify-center mt-[29px]">
          <button
            onClick={() => {
              clearInterval(refCount);
              onClose();
            }}
            className="caption lg:body3 bg-white lg:px-[30px] px-[20px] h-[40px] box-shadow mr-[20px] rounded-[10px]"
          >
            Ở lại bài học này
          </button>
          <button onClick={onSubmit} className="caption lg:body3 bg-primary1 lg:px-[30px] px-[20px] h-[40px] box-shadow rounded-[10px] text-white">
            Tới bài tiếp theo
          </button>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
