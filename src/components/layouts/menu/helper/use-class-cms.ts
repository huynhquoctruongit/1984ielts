import useSWR from "swr";
import useActiveMenu from "./use-active";
import { useAuth } from "@/hook/auth";
import { fetcherController } from "@/libs/api/axios-controller";

const useClass = (classId) => {
  const { profile } = useAuth({ revalidateIfStale: false });
  const { active, setActive }: any = useActiveMenu((state) => state);
  const payload = {
    filter: {
      _and: [{ id: { _eq: classId } }, { students: { directus_users_id: { _eq: "$CURRENT_USER" } } }],
    },
    fields: [
      "id",
      "title",
      "description",
      "fee_status",
      "thumbnail",
      "course.id",
      "course.sections.title",
      "course.sections.id",
      "course.sections.parts.*",
      "course.sections.parts.item.title",
      "course.sections.parts.item.id",
      "course.sections.parts.item.type",
    ],
  };
  const { data, isLoading: isLoadingClass } = useSWR(["/items/class", payload]);
  const cls = data?.data?.data[0] || null;

  const { data: resStatistic, isLoading: isLoadingStatistic } = useSWR(`/classroom/statistic/${classId}/${profile.id}`, fetcherController);
  const statistic = resStatistic?.data || [];

  const menus = (cls?.course?.sections || []).map((section, index) => {
    return { ...section, statistic: statistic[index] || {} };
  });

  const _index = statistic.findIndex((item) => item.percentage < 100);
  const index = _index === -1 ? 0 : _index;
  const ac = active ?? index;
  const current = {
    section: menus[ac] || {},
    index: index,
    statistic: statistic[ac] || {},
  };

  const isLoading = isLoadingClass || isLoadingStatistic;
  return { cls, menus, isLoading, current, active: ac, setActive };
};

export default useClass;
