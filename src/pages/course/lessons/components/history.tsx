import useClass from "@/components/layouts/menu/helper/use-class";
import Button from "@/components/ui/button";
import { useAuth } from "@/hook/auth";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import useSWR from "swr";
const useHistory = () => {
  const { profile }: any = useAuth();
  const { classId, id, sectionId } = useParams();
  const url = `/v1/quizzes/${id}/histories?page_size=5&sort=date_created.desc&class_id=${classId}&student_id=${profile.id}&section_id=${sectionId}`;
  const data = useSWR(url, { revalidateOnFocus: true, revalidateOnMount: true });
  return data;
};
const History = ({ choose }: any) => {
  const { classId, id, sectionId, type } = useParams();
  const { data, isLoading }: any = useHistory();
  const history = data?.data?.data?.items || [];
  const { cls } = useClass(classId);
  const onClick = () => {
    const url = `/class/${classId}/course/${cls?.course?.id}/section/${sectionId}/${type}/${id}${(type == "speaking" && "?step=instructions") || ""}`;
    window.open(url, "_blank");
  };

  const viewDetail = (item: any) => {
    const types = ["reading", "listening", "writing", "speaking", "Writing Self Practice"];
    const { type, quiz_id } = item;
    const typeName = types[type - 1] == "Writing Self Practice" ? "writing-self-practice" : types[type - 1];
    if (type === 1) {
      const url = `/class/${classId}/course/${cls.course_id}/section/${sectionId}/${typeName}/${quiz_id}?type=review&answerId=${item.id}`;
      window.open(url, "_blank");
    } else if (type === 2) {
      const url = `/class/${classId}/course/${cls.course_id}/section/${sectionId}/${typeName}/${quiz_id}/review?answerId=${item.id}`;
      window.open(url, "_blank");
    } else if (type === 4) {
      const url = `/class/${classId}/course/${cls.course_id}/section/${sectionId}/${typeName}/${quiz_id}/result/${item.id}`;
      window.open(url, "_blank");
    } else if (type === 5) {
      const url = `/class/${classId}/course/${cls.course_id}/section/${sectionId}/${typeName}/${quiz_id}/result/${item.id}`;
      window.open(url, "_blank");
    } else {
      const url = `/review/${typeName}/${item.id}?class=${classId}`;
      window.open(url, "_blank");
    }
  };

  return (
    <>
      {choose && history.length > 0 && (
        <div className="border-[1px] border-solid border-neutral-06 sm:p-5 p-2.5 rounded-[12px] sm:mt-0 mt-6">
          <div className=" flex sm:gap-5 gap-2.5 pb-4">
            <div className="sm:w-1/5 w-1/4 sm:h8 h9 text-light-01">Thời gian nộp bài:</div>
            <div className="sm:w-1/5 w-1/4 sm:h8 h9 text-light-01">Thời gian chấm bài:</div>
            <div className="sm:w-1/5 w-1/4 sm:h8 h9 text-light-01">Điểm bài làm: </div>
            <div className="sm:w-2/5 w-1/4"></div>
          </div>
          {history.map((item: any, index: number) => {
            return (
              <div className="flex sm:gap-5 gap-2.5 pt-2 pb-1 border-t-[1px] border-solid border-neutral-06" key={item + index}>
                <div className="sm:w-1/5 w-1/4 ">
                  <p className="sm:body01 body03 text-light-01">{dayjs(item.date_created).format("HH:mm . DD/MM/YYYY")}</p>
                </div>
                <div className="sm:w-1/5 w-1/4 ">
                  <p className="sm:body01 body03 text-light-01">{item.reviewed_at && dayjs(item.reviewed_at).format("HH:mm . DD/MM/YYYY")}</p>
                </div>
                <div className="sm:w-1/5 w-1/4 sm:body01 body03 text-light-01">
                  {item.awarded_mark || 0}/{item.total_mark || 0}
                </div>
                <button
                  onClick={() => {
                    viewDetail(item);
                  }}
                  className="sm:w-2/5 w-1/4 sm:body01 body03 text-teritary-06 underline decoration-1 hover:text-[#0366d3] duration-300"
                >
                  Click để xem bài làm
                </button>
              </div>
            );
          })}
        </div>
      )}
      {history.length === 0 && !isLoading && (
        <div className="flex flex-col items-center mt-10">
          <div className="text-light-01 h8 text-center w-80">Bạn chưa làm bài tập này lần nào, làm bài tập ngay bạn nhé.</div>
          <Button onClick={onClick} className="bg-primary-01 text-white hover:bg-primary-01/80 mt-8">
            Làm bài tập
          </Button>
        </div>
      )}
    </>
  );
};

export default History;
