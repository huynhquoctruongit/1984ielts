import useSWR from "swr";
import { useAuth } from "@/hook/auth";
import { fetcherController } from "@/libs/api/axios-controller";
import { useParams, useSearchParams } from "react-router-dom";
import useMyCourse from "@/pages/course/lessons/helper/use-order";
import { useEffect, useMemo } from "react";

const getProgress = (statistic, item) => {
  if (!statistic?.sectionId) return false;

  if (item.collection === "quiz") {
    return statistic.learned.quiz.includes(item.item_id);
  }
  if (item.collection === "lesson") {
    return statistic.learned.lesson.includes(item.item_id);
  }
};

const convertMenu = (menus, valid) => {
  const listMenu = [...menus]
    .filter((item) => item?.topics?.length > 0)
    .map((section) => {
      const topics = section.topics.map((topic) => {
        const parts = (topic.parts || []).filter((item) => item);
        const result = parts.map((item) => ({ ...item, section: section.id, topic: topic.id, learned: getProgress(section.statistic, item) }));
        return { ...topic, parts: result };
      });
      return { ...section, topics };
    });
  const listItems = listMenu
    .map((item) => item.topics)
    .flat()
    .map((item) => item.parts)
    .flat();
  let result = null;
  result = listItems.find((item) => (valid ? item.learned !== true : item.learned !== true && item.is_allow_trial === true));
  if (!result) {
    if (!valid) result = listItems.reverse().find((item) => item.learned === true && item.is_allow_trial === true);
    else result = listItems.reverse().find((item) => item.learned === true);
  }
  return [listItems, result];
};

const useClass = (classId) => {
  const params = useParams();
  const [query, _] = useSearchParams();
  const { profile } = useAuth();
  const { data, isLoading: isLoadingClass } = useSWR("/v1/classes/" + classId);
  const { classIsPaid, isLoading: isLoadingMyCourse, isJoinClass }: any = useMyCourse();

  const valid = classIsPaid(classId);
  const joinedClass = isJoinClass(classId);
  const {
    data: resStatistic,
    isLoading: isLoadingStatistic,
    mutate: mutateStatistic,
  } = useSWR(`/classroom/statistic/${classId}/${profile.id}`, { fetcher: fetcherController, revalidateOnFocus: true });

  const cls = data?.data?.data;
  const statistic: any = resStatistic?.data || [];
  const querySection = query.get("section");

  const menus = (cls?.course?.sections || []).map((section) => {
    const stati = statistic.find((item) => item.sectionId == section.id);
    return { ...section, statistic: stati || {} };
  });
  let newMenu = [(cls?.course?.sections || []).find((section) => section.id == querySection) || {}]
  const stati = statistic.find((item) => item.sectionId == newMenu[0].id);
  newMenu[0]["statistic"] = stati

  const isLoading = isLoadingClass || isLoadingStatistic || isLoadingMyCourse || !joinedClass;
  const [listItem, defaultItem] = useMemo(() => convertMenu(menus, valid), [menus, valid, isLoading]);
  const sectionId = Number(params.sectionId ?? querySection ?? defaultItem?.section);
  const [listItemNew, defaultItemNew] = useMemo(() => convertMenu(newMenu, valid), [newMenu, valid, isLoading]);
  useEffect(() => {
    if (isLoadingMyCourse) return;
    if (joinedClass === false) {
      const redirect = import.meta.env.VITE_YOUPASS_DOMAIN + "/course/" + classId;
      window.location.href = redirect;
    }
  }, [joinedClass, isLoadingMyCourse]);

  const current: any = {
    section: menus.find((item) => item.id == sectionId) || menus[0],
    statistic: statistic.find((item) => item.sectionId == sectionId) || {},
    index: menus.findIndex((item) => item.id == sectionId),
  };
  return { cls, menus, current, sectionId, isLoading, statistic, defaultItem, defaultItemNew, listItem, mutateStatistic };
};
export default useClass;

// Mới vào trang web => tìm topic có bài học tiếp theo , focus bài học tiếp theo ( nếu bài học tiếp theo )
// Tìm bài học valid tiếp theo => focus bài học đó
//
// Đợi 2 api, class detail + statistic + api mua khóa học
// Sau khi có 3 api => Next Section ( nếu next section )
