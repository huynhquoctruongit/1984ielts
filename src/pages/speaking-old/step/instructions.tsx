import { TabIcon, ArrowIcon } from "@/components/icons/index";
import Button from "@/components/ui/button/index";
import { Link, useParams } from "react-router-dom";
export const Instructions = ({ quiz }: any) => {
  const { quizId } = useParams();

  return (
    <div className="text-center lg:p-0 p-[20px] h-[calc(100vh-64px)] zoomin-content overflow-y-hidden">
      <div className="mt-[60px]">
        <p className="lg:big-title headline1 text-primary1 mb-[20px]">General Instructions</p>
        <div className="max-w-[800px] m-auto text-left">
          <div className="lg:body2 body5 mb-[20px]">
            <div className="flex items-center mb-[16px]">
              <div dangerouslySetInnerHTML={{ __html: quiz?.instruction?.content }} className="ml-[24px] content-cms"></div>
            </div>
          </div>
          <div className="flex justify-center">
            <Link to={`${window.location.pathname}?step=testmicro`}>
              <Button className="bg-primary2 text-white">
                Next step <ArrowIcon fill="white" className="rotate-180 ml-[8px]" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
