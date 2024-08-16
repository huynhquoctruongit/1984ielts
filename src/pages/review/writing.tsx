import ReviewWriting from "@/components/reports/writing";
import Loading from "@/components/system/result";
import { Button } from "@nextui-org/react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import useSWR from "swr";

const WritingReview = () => {
  const { answerId } = useParams();
  const { data: answerdata, error } = useSWR("/items/answer/" + answerId + "?fields=*,user_created.*,review.*");
  const answer = answerdata?.data?.data || {};
  const { data: quizDdata } = useSWR(answer?.quiz ? `/v1/quizzes/${answer?.quiz}` : null);
  const quiz = quizDdata?.data?.data || {};
 
  useEffect(() => {
    if (answer?.review?.writing_review_type == 2) {
      location.href = "https://e-learning-1984.vercel.app/review-writing/" + answer.id
    }
  }, [])
  if (error) return <NotfoundPage />;
  if (!answer?.id || !quiz?.id) return <Loading className="h-[90vh]" />;
  return (
    <div className="">
      <ReviewWriting answer={answer} id={answerId} quiz={quiz} />
    </div>
  );
};

const NotfoundPage = () => {
  return (
    <div className="flex items-center flex-col justify-center h-[calc(100vh-64px)] w-full">
      <img src="https://cdni.iconscout.com/illustration/premium/thumb/understand-customers-6263579-5126816.png?f=webp" className="w-100" alt="" />
      <div className="text-5xl tracking-widest font-black text-black/90 text-center">404 NOT FOUND</div>
      <Link to={"/"}>
        <Button className="mt-10 text-white" color="primary">
          Back home
        </Button>
      </Link>
    </div>
  );
};

export default WritingReview;
