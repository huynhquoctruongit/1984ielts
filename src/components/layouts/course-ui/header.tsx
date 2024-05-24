import Button from "@/components/ui/button/index";
import { BookIcon, WritingIcon, HeadphoneIcon, SpeakingIcon, ArrowSolidIcon, RightArrowIcon } from "@/components/icons/index";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import { sliceLongText } from "@/services/helper";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/context/toast";
import Modal from "@/components/layouts/modal/template";
import SamplePopup from "@/components/layouts/modal/sample/index";
import { useAuth } from "@/hook/auth";
import { useState } from "react";
const Header = ({ part, title, listAnswer, quiz, classUser }: any) => {
  const { classId, courseId, sectionId, quizId, answerId } = useParams();
  const [isPopup, openPopup] = useState(false);
  const { warning }: any = useToast();
  const { profile } = useAuth();

  const isStudent = profile?.role?.name === "End User" || profile?.role?.name === "Administrator"

  const Icon = (part: any) => {
    switch (part) {
      case "Writing":
        return <WritingIcon width="22px" height="22px" fill="#164675" />;
      case "WritingPractice":
        return <WritingIcon width="22px" height="22px" fill="#164675" />;
      case "Reading":
        return <BookIcon width="22px" height="22px" fill="#164675" />;
      case "Listening":
        return <HeadphoneIcon width="22px" height="22px" fill="#164675" />;
      case "Speaking":
        return <SpeakingIcon width="22px" height="22px" fill="#164675" />;
      default:
        break;
    }
  };

  const checkSubmit = () => {
    if (quiz?.samples) {
      if (listAnswer?.length == 0) {
        warning("You need to submit at least once before being able to view the sample. Try your best!!");
      } else {
        openPopup(true);
      }
    } else {
      warning("The sample is being updated");
    }
  };

  const getLink = `/class/${classId}/course/${courseId}/section/${sectionId}/writing-self-practice/${quizId}`;

  return (
    <div>
      <Modal open={isPopup}>
        <SamplePopup
          content={quiz?.samples}
          onClose={() => {
            openPopup(false);
          }}
        />
      </Modal>
      <div className="flex header-part bg-neu7 lg:px-[39px] px-[16px] py-[15px] relative z-[11] h-[58px]">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <a href={`${isStudent ? "/home" : "/teacher"}`}>
                <div className="cursor-pointer flex items-center">
                  {Icon(part)}
                  <p className="text-primary1 ml-[12px] lg:headline2 headline3">{title}</p>
                </div>
              </a>
            </div>
            <div>
            </div>
            {part == "WritingPractice" && (
              <div className="flex items-center md:mt-0 mt-[10px]">
                <div
                  onClick={() => checkSubmit()}
                  className="bg-white text-primary2 px-[10px] py-[4px] mr-[25px] rounded-[20px] border-[1px] border-primary2 w-[120px] text-center cursor-pointer"
                >
                  Sample
                </div>
                <Popover backdrop={"opaque"} placement="bottom" showArrow={false}>
                  <PopoverTrigger>
                    <div className="bg-primary2 text-white rounded-[18px] px-[12px] py-[4px] mr-[11px] flex items-center cursor-pointer justify-center">
                      <ArrowSolidIcon className="mr-[4ox]" />
                      Instruction
                    </div>
                  </PopoverTrigger>
                  {quiz?.instruction?.content && (
                    <PopoverContent>
                      <div className="px-1 py-2 md:max-w-[500px] w-full">
                        <div className="text-small font-bold">Instruction</div>
                        <div className="text-left mt-[6px] px-[12px]" dangerouslySetInnerHTML={{ __html: quiz?.instruction?.content }}></div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
                <Popover backdrop={"opaque"} placement="bottom" showArrow={false}>
                  <PopoverTrigger>
                    <div className="bg-primary2 text-white rounded-[18px] px-[12px] py-[4px] flex items-center cursor-pointer w-[120px] justify-center">
                      <ArrowSolidIcon className="mr-[4ox]" />
                      History
                    </div>
                  </PopoverTrigger>
                  {listAnswer?.length > 0 && (
                    <PopoverContent className="p-0 overflow-hidden">
                      <div className="text-small font-bold text-left w-full p-[12px]">History</div>
                      <div className="max-w-[300px] w-[300px] max-h-[300px] h-fit overflow-auto">
                        {listAnswer
                          ?.sort((a: { date_created: string }, b: { date_created: string }) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime())
                          ?.map((item: any) => (
                            <Link key={item.id + "-link"} to={getLink + `/result/${item.id}`}>
                              <div className={`p-[12px] cursor-pointer hover:bg-neu4 overflow-hidden ${answerId == item.id ? "bg-neu7" : ""}`}>
                                <div className="flex items-center">
                                  <p className="font-bold mr-[5px]">{dayjs(item.date_created).format("HH:MM:ss")} </p>
                                  <p>{dayjs(item.date_created).format("DD/MM/YYYY")}</p>
                                </div>
                                <p className="mt-[5px] overflow-hidden">{sliceLongText(item.writing?.[0]?.answer, 100)}</p>
                              </div>
                            </Link>
                          ))}
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              </div>
            )}
          </div>
        </div>
      </div>
     
    </div >
  );
};
export default Header;
