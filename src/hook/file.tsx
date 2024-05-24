import { useState } from "react";
import AxiosClient from "@/libs/api/axios-client";
export function useFile(strId: string) {
  const [fileId, setId] = useState(strId);
  const [loading, setLoading] = useState(false);
  const setFile = (file: string) => {
    setId(file);
  };
  const createFile = async (file: any) => {
    setLoading(true);
    const newFormData = new FormData();
    newFormData.append("file", file);
    const result: any = await AxiosClient.post("/files", newFormData, {
      headers: {
        "Content-Type": `multipart/form-data;audio/mpeg3;audio/x-mpeg-3;video/mpeg;video/x-mpeg;`,
      },
    });

    setLoading(false);
    setId(result?.data?.data?.id);
    return result?.data?.data?.id;
  };

  const uploadFile = async (file: any) => {
    return await createFile(file);
  };
  return { setFile, uploadFile, fileId, loading };
}
