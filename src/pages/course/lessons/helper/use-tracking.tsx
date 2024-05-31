import { useAuth } from "@/hook/auth";
import { AxiosAPI } from "@/libs/api/axios-client";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import amplitude, { getTypeByUrl } from "@/services/amplitude";

const useTrackingLesson = () => {
  const { type, id, classId } = useParams();
  const { profile } = useAuth();
  const center = import.meta.env.VITE_CENTER;

  useEffect(() => {
    if (center !== "youpass") return;
    const params = {
      object_id: parseInt(id),
      object_type: type ? 2 : 1,
      action_type: 1,
      data: {
        skill: type ? type : "",
      },
    };
    const userId = profile.id;
    const fetchData = async () => {
      const link = `/v1/students/${userId}/learned-time`;
      AxiosAPI.post(link, params)
        .then((res: any) => {})
        .catch((error) => console.error("Error fetching data:", error));
    };
    fetchData();
    const timer = setInterval(fetchData, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (center !== "youpass") return;
    const time = 5 * 60 * 60;
    const timming = setTimeout(() => {
      const type = getTypeByUrl();
      amplitude.track(`[${type}] Viewed`, { user_id: profile.id, type: type, id: id });
    }, time);
    return () => {
      clearTimeout(timming);
    };
  }, [classId]);
  return null;
};

export default useTrackingLesson;
