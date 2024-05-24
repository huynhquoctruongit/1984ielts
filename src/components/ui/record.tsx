import { useState, useRef, useEffect } from "react";
import { MicroIcon } from "../icons";
import { AudioPlayer, AudioPlayerId } from "./audio";
import { useFile } from "@/hook/file";

function AudioRecorder({ url, id, name, getLink }: any) {
  const [isRecording, setIsRecording]: any = useState(false);
  const [recordedChunks, setRecordedChunks]: any = useState([]);
  const mediaRecorderRef: any = useRef(null);
  const mediaStreamRef: any = useRef(null);
  const refAudio: any = useRef();
  const { uploadFile, fileId, loading: loadingFile } = useFile(id);
  const startRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        mediaStreamRef.current = mediaStream;
        mediaRecorderRef.current = new MediaRecorder(mediaStream);
        mediaRecorderRef.current.addEventListener("dataavailable", (event: any) => {
          if (event.data.size > 0) {
            setRecordedChunks((prevChunks: any) => [...prevChunks, event.data]);
            playPreview(event.data);
          }
        });

        mediaRecorderRef.current.start();
        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaStreamRef.current.getTracks().forEach((track: any) => track.stop());
      setIsRecording(false);
    }
  };

  const playPreview = async (chunk: any) => {
    if (chunk) {
      const blob = new Blob([chunk], { type: "audio/aac" });
      const file = new File([blob], name + ".aac");
      const id = await uploadFile(file);
      getLink(id);
    }
  };

  const isAudio = recordedChunks.length > 0 && !isRecording;
  return (
    <div className="relative w-full 2xl:flex items-center h-full">
      {!isRecording && (
        <div className="flex items-center justify-center cursor-pointer mr-[4px] 2xl:mb-0 mb-[8px] 2xl:h-[40px] h-[20px]" onClick={startRecording}>
          <div className={`hover:scale-110 duration-200 ease-in-out bg-primary1 border-[5px] border-white h-[38px] w-[38px] flex items-center justify-center rounded-full`}>
            <MicroIcon fill="white" className="w-4 h-4 " />
          </div>
          <span className="ml-[5px]"> {isAudio || id ? "" : "Click to record"} </span>
        </div>
      )}
      {isRecording && (
        <div onClick={stopRecording} className="cursor-pointer bg-white rounded-[20px] p-[9px] flex items-center">
          <div className="bg-primary2 w-[20px] h-[20px] rounded-full mr-[12px] blink-rec"></div>
          <p className="body4 text-primary1 mr-[5px]">Recording</p>
        </div>
      )}
      {loadingFile && <div className="">Uploading...</div>}
      {!loadingFile && !isRecording && fileId && <AudioPlayerId refAudio={refAudio} id={fileId} index="record-teacher-review" />}
    </div>
  );
}

export default AudioRecorder;
