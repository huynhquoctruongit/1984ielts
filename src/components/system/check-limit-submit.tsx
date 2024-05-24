import axiosClient, { fetcherClient } from "@/libs/api/axios-client.ts";
import useSWR from "swr";
export const LimitSubmit = (quiz: any, limit: any) => {
  return axiosClient.get(`/items/answer?filter[quiz].id=${quiz}`).then((res: any) => {
    const count = res?.data?.data?.length;
    return {
      isLimit: count >= limit,
      submitCount: count,
      used: count >= limit ? limit + "/" + limit : count + "/" + limit,
    };
  });
};
