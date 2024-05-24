import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderUI from "@/components/layouts/course-ui/header";
import { PlusIcon, MinusIcon, EyeIcon, LockedIcon } from "@/components/icons/index";
import { Link, useParams } from "react-router-dom";
import dayjs from "dayjs";
import useSWR from "swr";
import axiosClient, { fetcherClient } from "@/libs/api/axios-client.ts";
import { wordCountFunc } from "@/services/helper";
import Button from "@/components/ui/button/index";
import { useAuth } from "@/hook/auth";
import { Avatar } from "@nextui-org/react";
import { Spin } from "antd";
import { useToast } from "@/context/toast";

const Result = () => {
  const { quizId, id, classId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: question } = useSWR(`/items/question?fields=*,quiz.*&sort=id&filter[quiz].id=${quizId}`);
  const { data: quizRes } = useSWR(`/items/quiz/${quizId}?fields=*,source.*`);
  const data = question?.data?.data || [];
  const { data: classData } = useSWR("/items/class/" + classId + "?fields=students.*");
  const quiz = quizRes?.data?.data;
  const [ui, setClose]: any = useState();
  const domain = import.meta.env.VITE_CMS;
  const { warning }: any = useToast();

  const [answerListStore, setListAnswerStore]: any = useState([]);
  useEffect(() => {
    axiosClient.get(`items/answer?limit=1&filter[quiz].id=${quizId}&filter[id]=${id}&fields=*,user_created.*,review.*&sort=-date_created`).then((res: any) => {
      setListAnswerStore(res?.data?.data || []);
    });
  }, []);
  const answer = answerListStore[0];

  const closeUI = (type: any, status: any) => {
    setClose({
      ...ui,
      [type]: !status,
    });
  };
  const gotoGoogleDoc = () => {
    const data = classData?.data?.data;
    const { link_google_doc } = data?.students.find((st: any) => st.directus_users_id == answer.user_created.id) || {};
    console.log(link_google_doc,'link_google_doc');
    
    if (!link_google_doc) return warning("You don't have link google doc");
    window.open(link_google_doc, "_blank");
  };
  const inputTime = answer?.date_created;
  const formattedTime = dayjs(inputTime).locale("en").format("DD MMM - YYYY hh:mm:ss A");

  const review = answer?.review?.date_created;
  const reviewedTime = dayjs(review).locale("en").format("DD MMM - YYYY hh:mm:ss A");
  if (!data || data?.length == 0)
    return (
      <div className="flex items-center justify-center mt-[25%]">
        <Spin />
      </div>
    );
  return (
    <div className="bg-white content-exam">
      <HeaderUI part="Writing" title={`Result / ${quiz?.title}`} />
      <div className="md:mx-[40px] md:my-[32px] m-[20px] zoomin-content overflow-y-hidden">
        <div className="flex items-center w-full">
          {(profile.avatar && <img className="rounded-full w-[110px] h-[110px] object-cover" src={`${domain + "/assets/" + profile.avatar}`} />) || (
            <img src="/images/result-2.png" className="rounded-full w-[80px] h-[80px] md:w-[110px] md:h-[110px] object-cover" />
          )}
          <div className="ml-[15px] w-full">
            <p className="text-primary1 headline1">{profile?.fullname || profile?.email?.replace("@gmail.com", "")}</p>
            <div className="md:flex items-center justify-between w-full">
              <div className="md:flex items-center">
                <p className="text-primary1 body1">{quiz?.title}</p>
                <span className="body5 md:ml-[9px]">[ {formattedTime} ]</span>
              </div>
              <div className="md:mt-0 mt-[20px]">
                {(answer?.review?.details && answer?.review?.details.length > 0 && (
                  <div className="mb-[12px]">
                    <div className="flex mb-[7px]">
                      <div
                        onClick={gotoGoogleDoc}
                        className={
                          "mr-[12px] bg-warning-400 whitespace-nowrap ml-auto text-white hover:text-white hover:bg-warning-500 px-5 shadow-sm py-2 w-fit rounded-full flex items-center transition-color duration-200 ease-in-out cursor-pointer "
                        }
                      >
                        <span className="font-meidum text-right">Go to Writing file</span>
                      </div>
                      <Button className="body4 bg-green1 text-white md:ml-auto cursor-default">Reviewed</Button>
                    </div>
                    <p className="body5 text-right"> Revision time [ {reviewedTime} ]</p>
                  </div>
                )) || (
                  <div className="flex mb-[7px]">
                    <div
                      onClick={gotoGoogleDoc}
                      className={
                        "mr-[12px] bg-warning-400 whitespace-nowrap ml-auto text-white hover:text-white hover:bg-warning-500 px-5 shadow-sm py-2 w-fit rounded-full flex items-center transition-color duration-200 ease-in-out cursor-pointer "
                      }
                    >
                      <span className="font-meidum text-right">Go to Writing file</span>
                    </div>
                    <Button className="body4 bg-neu4 text-black md:ml-auto">Under review</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {(answer?.writing &&
          answer?.writing?.map((item: any, index: any) => {
            return (
              <div className="mt-[50px]">
                <div className="bg-neu7 rounded-[10px] px-[28px] py-[18px]">
                  <p className="headline2">Task {index + 1}</p>
                </div>
                <div className="ml-[12px]">
                  <div className="flex items-center relative">
                    {/* <div className="bg-black w-[3px] mr-[12px] mt-[8px]"></div> */}
                    <div className="bg-black-border bg-neu5 mt-[14px] rounded-[10px] p-[20px] w-full">
                      <div className="flex justify-between items-center">
                        <p className="body1">Question</p>
                        <div
                          onClick={() => closeUI(`question-${index}`, ui?.[`question-${index}`])}
                          className="bg-neu4 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white"
                        >
                          {ui?.[`question-${index}`] ? <PlusIcon /> : <MinusIcon />}
                        </div>
                      </div>

                      {data?.map((elm: any) => {
                        return (
                          elm.id === item.id && (
                            <p className={ui?.[`question-${index}`] ? "hidden mt-[20px]" : "block mt-[20px]"}>
                              <div className="content-cms" dangerouslySetInnerHTML={{ __html: elm?.content_writing }}></div>
                            </p>
                          )
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center relative">
                    <div className="bg-black-border bg-neu5 mt-[14px] rounded-[10px] p-[20px]  w-full">
                      <div className="flex justify-between items-center">
                        <div className="flex">
                          <p className="mr-[12px] body1">Answer</p>
                          <p className="bg-primary1 text-white h-fit px-[20px] rounded-[14px]">{wordCountFunc(item.answer || "")}</p>
                        </div>
                        <div
                          onClick={() => closeUI(`answer-${index}`, ui?.[`answer-${index}`])}
                          className="bg-neu4 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white"
                        >
                          {ui?.[`answer-${index}`] ? <PlusIcon /> : <MinusIcon />}
                        </div>
                      </div>

                      <div
                        className={ui?.[`answer-${index}`] ? "hidden mt-[20px] content-cms" : "block mt-[20px] content-cms"}
                        dangerouslySetInnerHTML={{ __html: item.answer.replace(/\r\n|\r|\n/g, "<br />") }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center relative">
                    <div className="bg-black-border bg-neu5 mt-[14px] rounded-[10px] p-[20px]  w-full">
                      <div className="flex justify-between items-center">
                        <p className="body1">Review</p>
                        <div className="flex">
                          {(answer?.review?.details && answer?.review?.details?.length > 0 && answer?.review?.details.filter((elm: any) => elm.id == item.part_id)?.length > 0 && (
                            <div
                              onClick={() => closeUI(`review-${index}`, ui?.[`review-${index}`])}
                              className="bg-green1 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white"
                            >
                              <EyeIcon />
                            </div>
                          )) || (
                            <div className="ml-[8px] bg-neu4 px-[20px] py-[5px] rounded-[14px] cursor-pointer border-[1px] border-white">
                              <LockedIcon />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={ui?.[`review-${index}`] ? "hidden mt-[20px]" : "block"}>
                        {answer?.review?.details?.map((elm: any, index: any) => {
                          return (
                            item.id == elm.part_id && (
                              <div className={`${elm.review && "mt-[20px]"} flex items-center`}>
                                {answer?.review?.details?.length > 1 && <div className="mr-[8px] font-bold">Review {index + 1} :</div>}
                                <div className="content-cms" dangerouslySetInnerHTML={{ __html: elm.note.replace(/\r\n|\r|\n/g, "<br />") }}></div>
                              </div>
                            )
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })) || (
          <p className="w-full m-auto text-center mt-[100px] body3 text-[gray]">
            <Spin />
          </p>
        )}
      </div>
    </div>
  );
};
export default Result;