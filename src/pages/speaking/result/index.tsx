import { useEffect } from "react";
import HeaderUI from "@/components/layouts/course-ui/header";
import { useParams } from "react-router-dom";
import useSWR from "swr";
import ReviewSpeaking from "../result-voice/index";
import ElsaResult from "../../speaking-result/index";
import { useAuth } from "@/hook/auth";

const Result = ({ getLayout, classUser }: any) => {
  const { id } = useParams();
  const { profile } = useAuth();
  const { data: answerdata } = useSWR("/items/answer/" + id + "?fields=*,user_created.*,review.*");
  const answerList = answerdata?.data?.data || {};
  const quizId = answerList?.quiz;
  const { data: quizData } = useSWR(quizId ? "/items/quiz/" + quizId + "?fields=*,parts.*.*" : null);
  const quiz = quizData?.data?.data;

  useEffect(() => {
    getLayout(false);
  }, []);


  return (
    <div className="bg-white content-exam">
      <HeaderUI classUser={classUser} part="Writing" title={`Result / ` + (quiz?.title || "")} />
      {profile?.role.name === "Teacher" || answerList.review ? <ElsaResult answerId={id}></ElsaResult> : <ReviewSpeaking answer={answerList} quiz={quiz} quizId={quizId} id={id} />}
    </div>
  );
};
export default Result;
