import useSWR from "swr";
import { useAuth } from "@/hook/auth";
import { fetcherController } from "@/libs/api/axios-controller";

const useLearned = (classId) => {
  const { profile } = useAuth();
  const { data: resStatistic } = useSWR(`/classroom/statistic/${classId}/${profile.id}`, { fetcher: fetcherController, revalidateOnFocus: true });
  const statistic: any = resStatistic?.data || [];
  const findLearned = (section, collection, id) => {
    const activeSection = statistic.find((item) => item.sectionId === section);
    if (!activeSection) return false;
    const listItem = activeSection.learned[collection] || [];
    return listItem.find((itemId) => itemId == id) > 0 ? true : false;
  };
  return { findLearned };
};
export default useLearned;

// Mới vào trang web => tìm topic có bài học tiếp theo , focus bài học tiếp theo ( nếu bài học tiếp theo )
// Tìm bài học valid tiếp theo => focus bài học đó
//
// Đợi 2 api, class detail + statistic + api mua khóa học
// Sau khi có 3 api => Next Section ( nếu next section )
