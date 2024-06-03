import { useNavigate, useParams } from "react-router-dom";
import useClass from "./use-class";
import useMyCourse from "@/pages/course/lessons/helper/use-order";
import { TypeSkill } from "@/services/enum";

const useRedirectLesson = (classId) => {
  const params = useParams();
  const navigate = useNavigate();
  const { current, cls, listItem } = useClass(classId);
  const collection = params["*"].includes("quiz") ? "quiz" : "lesson";
  const { classIsPaid } = useMyCourse();
  const valid = classIsPaid(classId);

  const getLessonPrev = () => {
    const listReverse = [...listItem].reverse();
    const index = listReverse.findIndex((item) => item.item_id == params.id && collection === item.collection && params.sectionId == item.section);
    const item = listReverse.find((item, i) => {
      if (valid) return index < i;
      else return index < i && item.is_allow_trial === true;
    });
    if (!item) return { isFinish: true };
    return { section: item.section, itemId: item.item_id, type: item.type, collection: item.collection };
  };

  const index = listItem.findIndex((item) => item.item_id == params.id && collection === item.collection && params.sectionId == item.section);
  const getLessonNext = () => {
    const item = listItem.find((item, _index) => {
      if (valid) return index < _index;
      else return index < _index && item.is_allow_trial === true;
    });
    if (!item) return { isFinish: true };
    return { section: item.section, itemId: item.item_id, type: item.type, collection: item.collection };
  };

  const onRedirect = (redirect) => {
    const nextItem: any = redirect === "next" ? getLessonNext() : getLessonPrev();
    if (nextItem?.isFinish) return;
    const urlLesson = `/class/${classId}/courses/section/${nextItem.section}/lesson/${nextItem.itemId}`;
    const urlQuiz = `/class/${classId}/courses/section/${nextItem.section}/quiz/${TypeSkill[nextItem.type]}/${nextItem.itemId}`;
    const url = nextItem.collection === "lesson" ? urlLesson : urlQuiz;
    navigate(url);
  };

  const isEnd = getLessonNext().isFinish === true;
  const isStart = getLessonPrev().isFinish === true;

  return { getLessonNext, getLessonPrev, isEnd: isEnd, isStart: isStart, current, cls, onRedirect };
};

export default useRedirectLesson;
