import { useEffect, useState } from "react";
import { RightIcon } from "@/components/icons/index";
import Button from "@/components/ui/button/index";
import { Link, useParams } from "react-router-dom";
import axiosClient from "@/libs/api/axios-client.ts";
import { log } from "console";
const Quizzes = ({ getLayout }: any) => {
  const { lessionId, id } = useParams();
  const [quiz, setQuiz]: any = useState(null);
  
  useEffect(() => {
    if (lessionId && id) {
      axiosClient.get(`/items/quiz?fields=*,source.*,type.*&filter[id]=${id}`).then((res: any) => {
        setQuiz(res?.data?.data || []);
      });
    }

    getLayout(true);
  }, [lessionId, id]);

  return (
    <div className="h-[calc(100vh-64px)] py-[30px] px-[20px] lg:px-[100px] learndash-content-body overflow-scroll content-exam">
      <div className="flex mb-[50px]">
        <span className="title text-primary1">Glossary</span>
      </div>

      <p className="title min-h-[50px]">{quiz?.[0]?.title || ""}</p>
      <div className="flex mt-[50px] bg-neu5 p-[16px] rounded-[4px] mb-[50px]">
        <span className="body5 text-primary1">BLOOM Template</span>
        <RightIcon className="mx-[5px] w-4 h-4" />
        {lessionId && quiz && <span className="body5 text-primary1">{lessionId.charAt(0).toUpperCase() + lessionId.slice(1) + " W" + quiz?.[0]?.section}</span>}
      </div>
      <div className="border-b-[1px] border-[#26446b] my-[10px]"></div>
      {lessionId === "speaking" ? (
        <Link to={`/${lessionId}/${quiz?.[0]?.id}?step=instructions`} target="_blank">
          <Button className="mx-auto mt-[30px] body5 bg-neu5 text-black">Take test</Button>
        </Link>
      ) : (
        <Link to={`/${lessionId}/${quiz?.[0]?.id}`} target="_blank">
          <Button className="mx-auto mt-[30px] body5 bg-neu5 text-black">Take test</Button>
        </Link>
      )}
    </div>
  );
};
export default Quizzes;
