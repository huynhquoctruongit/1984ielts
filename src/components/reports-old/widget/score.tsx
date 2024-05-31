import { AudioPlayerId } from "@/components/ui/audio";
import { useAuth } from "@/hook/auth";
import useSWR from "swr";

const names = [
  { part: "Task Response", key: "task_response" },
  { part: "Coherence And Cohesion", key: "coherence_and_cohesion" },
  { part: "Lexical Resource", key: "lexical_resource" },
  { part: "Grammatical Range and Accuracy (GRA)", key: "grammatical_range_and_accuracy_GRA" },
  { part: "Pronunciation", key: "pronunciation" },
];

export const InfomationWriting = ({ review }: any) => {
  const { data } = useSWR("/items/review_type?sort=-score");
  const findPartsById = (id: number) => {
    if (!id) return 0;
    const item = data?.data?.data?.find((item: any) => item.id == id);
    return item || {};
  };
  const task_response = findPartsById(review.task_response);
  const coherence_and_cohesion = findPartsById(review.coherence_and_cohesion);
  const grammatical_range_and_accuracy_GRA = findPartsById(review.grammatical_range_and_accuracy_GRA);
  const lexical_resource = findPartsById(review.lexical_resource);
  const total = ((task_response?.score || 0) + (coherence_and_cohesion?.score || 0) + (grammatical_range_and_accuracy_GRA?.score || 0) + (lexical_resource?.score || 0)) / 4;

  const { profile } = useAuth();

  const isShowTextReview = profile.roleName === "Teacher" || !review?.hide_text_review;
  const isShowScoreReview = profile.roleName === "Teacher" || !review?.hide_bank_score;

  return (
    <div className="">
      {review?.note && isShowTextReview && (
        <div className="border-small mb-10 rounded-xl px-6 py-4">
          <div className="content-cms" dangerouslySetInnerHTML={{ __html: review?.note || "" }}></div>
        </div>
      )}
      <div className="font-medium w-fit mb-4 px-4 rounded-full text-success-600 bg-greenpastel text-sm uppercase py-2">
        Total Score : <span className="font-black">{total}</span>
      </div>
      {isShowScoreReview && (
        <>
          <Item color="bg-orangepastel" colorText="bg-greenpastel/40" item={task_response} label="Task Response" src="/images/icons/blogger.png" />
          <Item color="bg-greenpastel" colorText="bg-orangepastel/40" item={coherence_and_cohesion} label="Coherence And Cohesion" src="/images/icons/listen.png" />
          <Item
            color="bg-orangepastel"
            colorText="bg-greenpastel/40"
            item={grammatical_range_and_accuracy_GRA}
            label="Grammatical Range and Accuracy (GRA)"
            src="/images/icons/read.png"
          />
          <Item color="bg-greenpastel" colorText="bg-orangepastel/40" item={lexical_resource} label="Lexical Resource" src="/images/icons/talking.png" />
        </>
      )}
    </div>
  );
};

const Item = ({ item, color, src, label, colorText }: any) => {
  return (
    <div className={"rounded-2xl md:flex items-center my-4 mx-auto " + colorText}>
      <div className={"flex-[0_0_200px] md:max-w-[200px] p-4 rounded-2xl text-center flex flex-col items-center justify-center  " + color}>
        <div className="rounded-full bg-white p-2 flex items-center justify-center w-16 h-16">
          <img src={src} className="object-contain" alt="" />
        </div>
        <div className="font-semibold my-1 text-sm truncate w-full text-center">{label}</div>
        <span className="text-sm"> </span> <span className="font-semibold text-sm">Score: {item.score || 0}</span>
      </div>
      <div className={"h-full text-black text-sm leading-1 ml-4 p-4 "}>
        <div className="">{item?.description || "not yet rated"}</div>
      </div>
    </div>
  );
};

const namesSpeak = [
  { part: "Coherence and Cohesion", key: "coherence_and_cohesion" },
  { part: "Lexical Resource", key: "lexical_resource" },
  { part: "Grammatical Range And Accuracy", key: "grammatical_range_and_accuracy_GRA" },
  { part: "Pronunciation", key: "pronunciation" },
];
export const InfomationSpeaking = ({ review }: any) => {
  const { data } = useSWR("/items/review_type?sort=-score");
  const { profile } = useAuth();
  const findPartsById = (id: number) => {
    if (!id) return 0;
    const item = data?.data?.data?.find((item: any) => item.id == id);
    return item || {};
  };

  const isShowTextReview = profile.roleName === "Teacher" || !review?.hide_text_review;
  const isShowScoreReview = profile.roleName === "Teacher" || !review?.hide_bank_score;

  const coherence_and_cohesion = findPartsById(review.coherence_and_cohesion);
  const GRA = findPartsById(review.grammatical_range_and_accuracy_GRA);
  const pronunciation = findPartsById(review.pronunciation);
  const lexical_resource = findPartsById(review.lexical_resource);
  const total = ((coherence_and_cohesion?.score || 0) + (GRA?.score || 0) + (pronunciation?.score || 0) + (lexical_resource?.score || 0)) / 4;

  return (
    <div className="">
      {review.voice && (
        <div className="mb-4">
          <AudioPlayerId onPause={() => {}} onPlay={() => {}} id={review?.voice} />
        </div>
      )}
      {review?.note && isShowTextReview && (
        <div className="border-small mb-10 rounded-xl px-6 py-4">
          <div className="content-cms" dangerouslySetInnerHTML={{ __html: review?.note || "" }}></div>
        </div>
      )}
      <div className="font-medium w-fit mb-4 px-4 rounded-full text-success-600 bg-greenpastel text-sm uppercase py-2">
        Total Score : <span className="font-black">{total}</span>
      </div>
      {isShowScoreReview && (
        <>
          <Item color="bg-orangepastel" colorText="bg-greenpastel/40" item={coherence_and_cohesion} label="Coherence and Cohesion" src="/images/icons/blogger.png" />
          <Item color="bg-greenpastel" colorText="bg-orangepastel/40" item={lexical_resource} label="Lexical Resource" src="/images/icons/talking.png" />
          <Item color="bg-greenpastel" colorText="bg-orangepastel/40" item={GRA} label="Grammatical Range And Accuracy" src="/images/icons/listen.png" />
          <Item color="bg-orangepastel" colorText="bg-greenpastel/40" item={pronunciation} label="Pronunciation" src="/images/icons/read.png" />
        </>
      )}
    </div>
  );
};
