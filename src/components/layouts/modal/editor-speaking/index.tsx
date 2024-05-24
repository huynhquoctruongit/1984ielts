import { useRef, useEffect, useState } from "react";
import Button from "../../../ui/button/index";
import { Link } from "react-router-dom";
import useOnClickOutside from "../../../../hook/outside";
import Editor from "@/components/editor/ckeditor";
import { AudioPlayerId } from "@/components/ui/audio";

const SubmitModal = ({ onClose, children, fileId, data, changeContent, isTeacher }: any) => {
  const refAudio: any = useRef();
  const ref: any = useRef();
  var value = "";
  useOnClickOutside(ref, () => {
    onClose();
    changeContent(value);
  });
  const close = () => {
    changeContent(value);
    onClose();
  };
  const getData = (val: string) => {
    value = val;
  };

  return (
    <div ref={ref} className="max-h-[90vh] overflow-auto p-[20px] bg-white lg:min-w-[500px] w-[90%] mx-auto text-left p-[30px] rounded-[20px]">
      <div className="m-auto max-h-[90vh]">
        <div className="mb-[20px]">{fileId && <AudioPlayerId index="123" refAudio={refAudio} id={fileId} partId={0} />}</div>
        <p className="font-bold mt-[20px] mb-[5px]">Note</p>
        {isTeacher ? <Editor setData={getData} data={data} /> : <div dangerouslySetInnerHTML={{ __html: data }}></div>}

        <div className="flex items-center justify-center mt-[29px]">
          <button onClick={close} className="bg-white px-[30px] h-[40px] box-shadow rounded-[10px]">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
export default SubmitModal;
