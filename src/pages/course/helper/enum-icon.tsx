import { PlayFillIcon } from "@/components/icons";
import { BookOpen2Icon, PenTool02 } from "../section/screen/icon";

export const EnumCollection = {
  "quiz-0": { title: "Quiz", subTitle: "Unknow", icon: <PenTool02 className="w-2.5" /> },
  "quiz-1": { title: "Quiz", subTitle: "Exercise", icon: <PenTool02 className="w-2.5" /> },
  "quiz-2": { title: "Quiz", subTitle: "Assignment", icon: <PenTool02 className="w-2.5" /> },
  "quiz-3": { title: "Quiz", subTitle: "Test", icon: <PenTool02 className="w-2.5" /> },
  "lesson-0": { title: "Lesson", subTitle: "Unknow", icon: <PlayFillIcon className="w-2.5 fill-black" /> },
  "lesson-1": { title: "Lesson", subTitle: "Lesson", icon: <BookOpen2Icon className="w-2.5" /> },
  "lesson-2": { title: "Lesson", subTitle: "Video", icon: <PlayFillIcon className="w-2.5 fill-black" /> },
  "lesson-3": { title: "Lesson", subTitle: "Extra video", icon: <PlayFillIcon className="w-2.5 fill-black" /> },
  "lesson-4": { title: "Lesson", subTitle: "Extra material", icon: <BookOpen2Icon className="w-2.5" /> },
};
export const TypeSkill = {
  1: "reading",
  2: "listening",
  3: "writing",
  4: "speaking",
  5: "writing-self-practice",
};
export const EnumQuizType = {
  "lesson": {
    1: "Lesson",
    2: "Video",
    3: "Extra video",
    4: "Extra material"
  },
  "quiz": {
    1: "Exercise",
    2: "Homework",
    3: "Quiz"
  }
};