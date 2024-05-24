import { AiFillCaretUp } from "react-icons/ai";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";
import { groupBy } from "lodash";
import { variants } from "@/services/config";
import Editor from "@/components/editor/ckeditor";
import { useParams } from "react-router-dom";
import axiosClient from "@/libs/api/axios-client";
import { useToast } from "@/context/toast";
import AudioRecorder from "@/components/ui/record";
import { Button } from "antd";
import ButtonToggle from "@/components/ui/button/toggle";

const names = [
  { part: "Coherence and Cohesion", key: "coherence_and_cohesion" },
  { part: "Lexical Resource", key: "lexical_resource" },
  { part: "Grammatical Range And Accuracy", key: "grammatical_range_and_accuracy_GRA" },
  { part: "Pronunciation", key: "pronunciation" },
];

const Modal = ({ answer, setOpen, part }: any) => {
  const { answerId } = useParams();
  const review = answer?.review;
  const initReviewByQuestion = (review?.details || []).find((item: any) => item.part_id == part?.id) || {};
  const { data } = useSWR("/items/review_type?sort=-score");
  const review_type = groupBy(data?.data?.data || [], "parts");
  const [input, setInput]: any = useState({ hide_bank_score: true, ...initReviewByQuestion, part_id: part?.id });
  const changePart = (key: number, value: string) => {
    setInput({ ...input, [key]: value });
  };
  const changeInput = (key: string) => {
    return (value: string) => {
      setInput({ ...input, [key]: !input[key] });
    };
  };
  const findScoreById = (id: number) => {
    if (!id) return 0;
    const item = data?.data?.data?.find((item: any) => item.id == id);
    return item?.score || 0;
  };
  const { fail, success }: any = useToast();
  const value = input;
  const changeContent = (value: string) => {
    setInput({ ...input, note: value });
  };

  const [dropdown, setDropdown]: any = useState({});
  const changeDropDown = (index: number) => {
    const prev = dropdown[index] || false;
    setDropdown({ ...dropdown, [index]: !prev });
  };

  const { mutate } = useSWR("/items/answer/" + answerId + "?fields=*,user_created.*,review.*");

  const submitRV = async () => {
    if (!review?.id) {
      const payload = { details: [input] };
      const result = await axiosClient.post("/items/review", payload).catch((error) => fail("Submit review failed"));
      await axiosClient.patch("items/answer/" + answerId, { review: result.data.data?.id, status: "reviewed" }).catch((err) => fail("Update review of awnser failed"));
      success("Submit review success");
      setOpen(false);
    } else {
      const details = review?.details || [];
      const index = details.findIndex((item: any) => item?.part == input?.part);
      if (index >= 0) details[index] = input;
      else details.push(input);
      const payload = { details: [input] };
      await axiosClient.patch("/items/review/" + review?.id, payload).catch((error) => fail("Submit review failed"));
      await axiosClient.patch("items/answer/" + answerId, { status: "reviewed" }).catch((err) => fail("Update review of awnser failed"));

      success("Update review success");
      setOpen(false);
      mutate();
    }
  };
  const total = (findScoreById(value.fluency) + findScoreById(value?.lexical_resource) + findScoreById(value?.grammatical) + findScoreById(value?.pronunciation)) / 4;
  return (
    <div>
      <div className="w-full p-4">
        <div className="modal-content">
          <div className="flex items-center md:w-full py-3 border-b-[1px]">
            <div className="modal-title font-semibold text-xl"> Review for Speaking Test </div>
            <button className="up min-w-[91px] md:px-4 px-2 py-1 font-semibold bg-orangepastel rounded-full text-primary1 ml-auto whitespace-nowrap">Band: {total}/9</button>
          </div>
          <div className="line" />
          <div className="modal-body">
            <div className="py-6 flex">
              <AudioRecorder id={initReviewByQuestion.voice} getLink={(id: any) => setInput({ ...input, voice: id })} />
            </div>
            <div>
              <div className="mb-4">
                <ButtonToggle active={!input.hide_text_review} setActive={changeInput("hide_text_review")} textActive="Hide Text Feedback" textInActive="Show Text Feedback" />
              </div>
              <Editor setData={changeContent} data={input?.note} />
            </div>
            <div className="my-4">
              <ButtonToggle active={!input.hide_bank_score} setActive={changeInput("hide_bank_score")} textActive="Hide Band Scores" textInActive="Show Band Scores" />
            </div>
            <div className="gap-1">
              {names.map((name: any, index) => {
                const key = name.part;
                const radios = (review_type[key] || []).sort((a: any, b: any) => (a.score - b.score ? 1 : -1));
                const open = dropdown[index] || false;
                return (
                  <div className="my-2" key={key + "field"}>
                    <div
                      className="flex px-4 py-3 items-center gap-3 text-md rounded-2xl cursor-pointer  bg-orangepastel/50 text-primary1"
                      onClick={() => {
                        changeDropDown(index);
                      }}
                    >
                      <div className="font-bold"> {key} </div>
                      <AiFillCaretUp className="up h-4 w-4 ml-auto" />
                    </div>
                    <AnimatePresence>
                      {open && (
                        <motion.div variants={variants} initial="hidden" animate="enter" exit="exit" className="overflow-hidden">
                          {radios.map((item: any) => {
                            return (
                              <div className="mt-4 px-2 flex items-center last:mb-4" key={item.id}>
                                <input
                                  defaultChecked={value[name.key] == item.id}
                                  onChange={(e: any) => changePart(name.key, e.target.value)}
                                  type="radio"
                                  name={name.key}
                                  id={item.id}
                                  value={item.id}
                                  className="mr-2 w-5 h-5"
                                />
                                <label htmlFor={item.id} className="w-[600px] text-sm">
                                  {item.description}
                                </label>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-4 py-4">
            <Button className="bg-orangepastel text-primary2 px-3 py-2 border-small border-primary2 rounded-full " onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button className="btn bg-greenpastel text-success-400 px-3 py-2 rounded-full border-small border-success-400" onClick={submitRV}>
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
