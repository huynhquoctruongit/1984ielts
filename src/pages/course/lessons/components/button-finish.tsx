import useRedirectLesson from "@/components/layouts/menu/helper/use-arrow";
import useClass from "@/components/layouts/menu/helper/use-class";
import NextLesson from "@/components/layouts/modal/next-lesson";
import { cn } from "@/lib/utils";
import AxiosClient from "@/libs/api/axios-client";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { Modal } from "antd";
import { useState } from "react";
import { useParams } from "react-router-dom";

const ButtonFinish = ({ className = "" }: any) => {
  const [isNextLesson, setNextLesson] = useState(false);
  const { classId, id } = useParams();
  const { mutateStatistic } = useClass(classId);
  const { onRedirect, current } = useRedirectLesson(classId);
  const learned = (current?.statistic?.learned?.lesson || []).some((item) => item == id);
  const onNextLesson = async () => {
    setNextLesson(false);
    onRedirect("next");
  };
  const onSubmit = async () => {
    if (learned) return;
    setNextLesson(true);
    const params = {
      type: "lesson",
      class: classId,
      lesson: id,
    };
    await AxiosClient.post("/items/tracking", params).catch((err) => console.log(err));
    mutateStatistic();
  };
  return (
    <>
      <div className={cn("flex items-center body3 justify-center py-10 w-fit mx-auto ", className)} onClick={onSubmit}>
        <div
          className={`py-3 flex items-center rounded-full px-6 hover:opacity-90 duration-200 ${learned ? "bg-green-50 text-green-600" : "cursor-pointer bg-primary1 text-white"}`}
        >
          {learned ? "Đã hoàn thành" : "Đánh dấu là đã hoàn thành"}
          {learned ? <CheckBadgeIcon className="w-5 h-5 ml-2 fill-green-600" /> : ""}
        </div>
      </div>

      <Modal open={isNextLesson} footer={null} onCancel={() => setNextLesson(false)}>
        <NextLesson
          onSubmit={onNextLesson}
          onClose={() => {
            setNextLesson(false);
          }}
        />
      </Modal>
    </>
  );
};

export default ButtonFinish;
