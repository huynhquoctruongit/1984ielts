import useSWR from "swr";

const useItem = (id, type) => {
  const listExclude = ["/quiz", "/lesson"];
  const typeCourse = listExclude.find((item) => location.pathname.includes(item));
  let getType = type === "writing-self-practice" ? "Writing Self Practice" : type;
  const quizLink = getType && `/v1/quizzes/${id}`;
  const lessonLink = `/items/lesson/${id}?fields=*,documents.*,documents.directus_files_id.*`;
  const link: any = typeCourse == "/lesson" ? lessonLink : quizLink;
  const data = useSWR(id ? link : null);
  return data;
};

export default useItem;
