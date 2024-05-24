import React, { useEffect, useState } from "react";
import { Upload, Button, Spin } from "antd";
// import { LoadingOutlined } from "@ant-design/icons";
import axiosClient from "@/libs/api/axios-client";

// @ts-ignore
import { AudioRecorder } from "react-audio-voice-recorder";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
const cms = import.meta.env.VITE_CMS;
// const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const UploadFileComponent = ({ label, onUpload = () => {}, data = [] }: any) => {
  const [fileList, setFileList]: any = useState([]);
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data.length === 0) return;
    axiosClient.get("/files/" + data[0]).then((response) => {
      const value = response?.data?.data || {};
      const dataConvert: any = {
        uid: value.id,
        name: value.filename_download,
        status: "done",
        url: cms + "/files/" + value.id,
        percent: 100,
      };
      setFileList([dataConvert]);
    });
  }, []);
  const handleUpload = async () => {
    if (!fileList && !record) return;
    setLoading(true);
    const file = fileList.map((item: any) => item.originFileObj)[0];
    try {
      const response = await axiosClient.post("/files", { folder: "2551f0a9-a9e5-42eb-9fe1-283a445f0b61", file }, { headers: { "Content-Type": "multipart/form-data" } });
      const temp = fileList[0];
      temp.url = cms + "/files/" + response.data.data.id;
      temp.status = "done";
      setFileList([temp]);
      onUpload(response.data.data.id);
    } catch (error) {}
    setLoading(false);
  };

  const handleFileChange = ({ fileList }: any) => {
    if (fileList?.length === 0) {
      setFileList([]);
      onUpload(null);
      return;
    }
    const end = fileList[fileList.length - 1];
    setFileList([end]);
  };

  const addAudioElement = (blob: any) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    setRecord(blob);
  };
  const file = fileList[0] || {};
  return (
    <div className="flex w-full">
      <div className="w-60">
        <Upload fileList={fileList} multiple={false} onChange={handleFileChange} beforeUpload={() => false}>
          <Button size="large">
            {label} {loading && <Spin className="ml-4" />}
          </Button>
        </Upload>
      </div>

      {file.status !== "done" && (
        <Button className="ml-4" color="danger" size="large" onClick={handleUpload} icon={<ArrowUpTrayIcon className="h-5 w-5" />}>
          Upload
        </Button>
      )}
      <div className="ml-auto">
        <AudioRecorder
          onRecordingComplete={addAudioElement}
          audioTrackConstraints={{
            noiseSuppression: true,
            echoCancellation: true,
          }}
          downloadOnSavePress={true}
          downloadFileExtension="mp3"
        />
      </div>
    </div>
  );
};

export default UploadFileComponent;
