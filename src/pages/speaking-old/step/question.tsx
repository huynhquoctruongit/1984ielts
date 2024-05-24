import { MicroIcon, PlayIcon } from "@/components/icons/index";
import Button from "@/components/ui/button/index";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
export const Question = ({ quiz, partQuiz, toQuestion }: any) => {

  const { quizId } = useParams();

  return (
    <div className="max-w-[800px] m-auto text-left mt-[100px] h-[calc(100vh-64px)] zoomin-content overflow-y-hidden">
      <div className="bg-primary1 rounded-[20px] h-[63px] relative">
        <p className="h-full w-full title text-white text-center absolute m-auto mt-[5px]">{partQuiz?.title}</p>
        <div className="relative z-[1] h-full flex items-center justify-end text-center mr-[12px]">
          <Link onClick={toQuestion} to={`${window.location.pathname}?step=exam`}>
            <Button className="bg-primary2 text-white">
              Start now <PlayIcon className="ml-[8px]"></PlayIcon>
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-neu7 flex justify-center items-center min-h-[400px] rounded-[20px] mt-[11px] p-[50px]">
        <div className="content-cms" dangerouslySetInnerHTML={{ __html: partQuiz?.content }}></div>
      </div>
    </div>
  );
};