import AxiosClient from "@/libs/api/axios-client";
import { regexFillBlank } from "@/services/helper";
import { Button } from "@nextui-org/react";
import dayjs from "dayjs";
import { isArray } from "lodash";

const convertArray = (obj: any): any => {
  if (isArray(obj)) return obj;
  if (obj === null) return [];
  const result = Object.keys(obj || {}).reduce((arr: any, key: any) => {
    const item = obj[key] || [];
    return [...arr, ...item];
  }, []);
  return result;
};
// create sleep function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const PrivateMigrateData = () => {
  const updatePartForQuiz = async () => {
    const quiz = await AxiosClient.get("/items/quiz?limit=1000");
    const quizs = (quiz?.data?.data || []).filter((item: any) => item?.parts.length === 0);
    console.log("stating migrate");
    for await (const quiz of quizs) {
      const { questions, id } = quiz;
      console.log("Quiz Id: ", id);
      console.log("loading...");

      const parts = await AxiosClient.post(`/items/part`, { quiz: id, questions, title: "Part 1 " });
      await AxiosClient.patch("/items/quiz/" + id, { parts: [parts?.data?.data.id] });
      await sleep(3000);
    }
  };

  const migrateUser = async () => {
    const users = await AxiosClient.get("/users?filter[fullname][_empty]=true");
    console.log(users);
    const data = (users?.data?.data || []).map((item: any) => {
      const { id, first_name } = item;
      return { id, fullname: first_name };
    });
    AxiosClient.patch("/users", data);
  };

  const updateScore = async () => {
    let cacheQuiz: any = {};
    const answer = await AxiosClient.get("/items/answer?limit=10000&filter[type][_eq]=1");
    for await (const ans of answer?.data?.data) {
      const { quiz, id } = ans;
      if (ans?.summary?.total) {
        console.log("pass answer id: ", id);
        continue;
      }
      let question = [];
      if (cacheQuiz[quiz]) {
        console.log("get question in cache ", id);
        question = cacheQuiz[quiz];
      } else {
        question = (await AxiosClient.get(`/items/question?filter[quiz][_eq]=${quiz}`)).data.data;
        cacheQuiz[quiz] = question;
      }
      const total = countScore(question);
      const detail = convertArray(ans?.detail) || [];
      const correct = detail.filter((item: any) => item.correct).length;
      await AxiosClient.patch("/items/answer/" + id, { summary: { ...ans.summary, correct, total: total } });
      console.log("update answer id: ", id);
      await sleep(1000);
    }
    console.log("done");
  };

  return (
    <div className="p-10">
      <div className="text-xl font-medium">Migrate Page </div>
      <Button className="mt-10" onClick={updatePartForQuiz}>
        Migrate Quiz
      </Button>
      <div>
        <Button className="mt-10" onClick={migrateUser}>
          Update name
        </Button>
      </div>
      <div className="mt-10 flex items-center">
        <Button onClick={updateScore}>Update Score</Button>
        <p className="ml-4">Remember change type in code to run ( 1: Reading, 2: listening )</p>
      </div>
    </div>
  );
};

export default PrivateMigrateData;

const countScore = (data: any) => {
  let sortData: any = data;

  let location: any = 0;

  sortData?.map((elm: any, index: any) => {
    if (elm?.type === "FILL-IN-THE-BLANK") {
      const elmFill: any = regexFillBlank(elm?.gap_fill_in_blank);
      sortData[index]["location"] = elmFill?.[0]?.[2];
      location = location + elmFill.length;
    } else if (elm?.type === "MULTIPLE") {
      const getAnswer = elm.mutilple_choice;
      const getCorrectAnswer = getAnswer.filter((elm: any, indexAnswer: any) => elm.correct);

      location = getCorrectAnswer?.length + location;
      sortData[index]["location"] = location;
    } else if (elm?.type === "SINGLE-SELECTION") {
      elm?.selection?.map((elm: any) => {
        location = location + 1;
        sortData[index]["location"] = location;
      });
    } else {
      location = location + 1;
      sortData[index]["location"] = location;
    }
  });
  return location;
};
