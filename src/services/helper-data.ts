import dayjs from "dayjs";

export const getClassesValid = (classList, userId) => {
  if (!classList) return null;
  const classValid = classList.filter((classItem) => isClassValid(classItem, userId));
  return classValid;
};

const isClassValid = (classItem, userId) => {
  const { students = [], duration } = classItem;
  const current = dayjs();
  if (duration > 0) {
    const dayJoinByStudent = students.find((item) => item.directus_users_id === userId)?.date_join;
    const compareDayJoin = dayjs(dayJoinByStudent).isAfter(dayjs(classItem.date_start));
    const dayJoin = dayjs(compareDayJoin ? dayJoinByStudent : classItem.date_start).endOf("day");
    const valid = current.isBefore(dayJoin.add(duration, "day"));
    return valid;
  } else {
    return current.isBefore(dayjs(classItem.date_end).endOf("day")) && current.isAfter(dayjs(classItem.date_start).startOf("day"));
  }
};
