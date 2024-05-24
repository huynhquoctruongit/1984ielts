import ReviewSpeaking from "@/components/reports/speaking";
import { Spin } from "antd";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useSWR from "swr";

const Review = ({ getLayout }: any) => {
  useEffect(() => {
    getLayout(true);
  });
  const { answerId } = useParams();
  const { data: answerdata } = useSWR("/items/answer/" + answerId + "?fields=*,user_created.*,review.*");
  const answer = answerdata?.data?.data || {};
  if (!answer?.id)
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Spin size="large" />
      </div>
    );
  return (
    <div className="">
      <ReviewSpeaking answer={answer} id={answerId} />
    </div>
  );
};

export default Review;
