import { amplitudeSendTrack } from "@/services/amplitude";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const TrackingTimeOnPage = ({ type = "" }) => {
  const parmas = useParams();
  const { classId, courseId, quizId, sectionId } = parmas;

  let timmin: any = useRef(null);
  const timeWillSend = [0, 10, 30, 60, 120, 180, 300, 600, 900, 1200, 1500, 1800, 2100, 2300];

  const sendEventTimeOnPage = (index = 0) => {
    const nextTime = timeWillSend[index];
    const old = timeWillSend[index - 1] || 0;
    const time = nextTime - old;
    if (time === undefined) return;

    timmin.current = setTimeout(() => {
      sendEventTimeOnPage(index + 1);
      const payload = {
        duration: timeWillSend[index],
        classId,
        courseId,
        quizId,
        sectionId,
        type: type,
      };
      amplitudeSendTrack("Time on page", payload);
    }, time * 1000);
  };

  useEffect(() => {
    sendEventTimeOnPage(1);
    return () => {
      clearTimeout(timmin.current);
    };
  }, []);

  return null;
};

export default TrackingTimeOnPage;
