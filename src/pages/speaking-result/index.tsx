import React, { useEffect, useState, useRef } from "react";
import { Textarea, Dropdown, DropdownTrigger, DropdownSection, DropdownItem, DropdownMenu, Accordion, AccordionItem, Checkbox, Tabs, Tab, Input, Avatar } from "@nextui-org/react";
import useSWR from "swr";
import AudioRecorder from "@/components/ui/record";
import axiosClient from "@/libs/api/axios-client.ts";
import AxiosController from "@/libs/api/axios-controller.ts";
import useOnClickOutside from "@/hook/outside";
import { AudioPlayerId } from "@/components/ui/audio";
import { FaceFrownIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { PencelIcon, RightArrowIcon, SubmitIcon, TeacherIcon, UserIcon, AttentionIcon } from "@/components/icons";
import { replaceBetween, convertSecondToTime, getSeconsTime, uid } from "@/services/helper";
import { Spin } from "antd";
import ResultElsa from "../../../public/result.json";
import { getStartOf } from "./processSelectedText";
import { calculateOffset } from "./processFocusPosition";
import { useAuth } from "@/hook/auth";
import { tabContentVariants } from "@/services/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useToast } from "@/context/toast";
import Modal from "@/components/layouts/modal/template";
import EditorSpeaking from "@/components/layouts/modal/editor-speaking/index";
import { useNavigate, useParams } from "react-router-dom";
import AvatarIELTS from "@/components/system/avatar";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
const cms = import.meta.env.VITE_CMS;

const SpeakingResult = ({ answerId }: any) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { classId } = useParams();
  const [tabNumber, setTab]: any = useState(0);
  const audioId = "2b44f585-e61d-4d1c-b30e-08343f6cd4d5";
  const { data: answerData } = useSWR("/items/answer/" + answerId + "?fields=*,user_created.*,review.*");
  const { data: transcriptData, mutate } = useSWR(`/items/transcript?fields=*,tags.*.*&filter[answer]=${answerId}`);
  const { data: commentStore, mutate: mutateCmt } = useSWR(
    `/items/comments?fields=*,user_created.*,tags.*.*&filter[answer]=${answerId}&filter[part]=${tabNumber}&sort=-date_created`,
  );

  const [selectedKeys, setSelectedKeys]: any = React.useState(new Set(["Tất cả"]));
  const [commentList, setCommentList]: any = useState([]);
  const [edit, setEdit]: any = useState();
  const [activeKeys, setActiveKeys] = useState([]);
  const [isPopupEditor, openEditor] = useState(null);
  const [isLoadingpage, setLoadingpage] = useState(true);
  const [transcript, setTranscript]: any = useState();

  const answerList = answerData?.data?.data || [];

  const transcriptList = transcriptData?.data?.data?.filter((elm) => elm.status === "published") || [];

  const selectedValue = React.useMemo(() => activeKeys.join(", ").replaceAll("_", " "), [activeKeys]);

  const cmt = commentStore?.data?.data;
  const quizId = answerList?.quiz;
  const { data: quizData } = useSWR(quizId ? "/items/quiz/" + quizId + "?fields=*,parts.*.*" : null);
  const { data: tags } = useSWR("/items/tag");
  const tagList = tags?.data?.data;

  const quiz = quizData?.data?.data;
  const resetDelete = (id: any) => {
    axiosClient.patch("/items/transcript/" + id, { status: "published" }).then((res) => { });
  };

  useEffect(() => {
    const list = transcriptData?.data?.data?.filter((elm) => elm.status === "draft");
    list?.map((elm) => {
      // resetDelete(elm.id);
    });
  }, []);
  useEffect(() => {
    const root: any = document.getElementById("root");
    if (root && root.style && root.style.overflowX) {
      root.style.overflowX = "hidden";
      root.style.overflowY = "hidden";
    }
    return () => {
      if (root && root.style && root.style.overflowX) {
        root.style.overflowX = "auto";
        root.style.overflowY = "auto";
      }
    };
  }, []);

  useEffect(() => {
    let array = Array.from(selectedKeys);
    if (array.length > 1) {
      if (Array.from(selectedKeys)?.[Array.from(selectedKeys)?.length - 1] == "Tất cả") {
        array = ["Tất cả"];
      } else {
        if (array.includes("Tất cả")) {
          array = array.filter((elm) => elm !== "Tất cả");
        }
      }
    }
    setActiveKeys(array);
  }, [selectedKeys]);

  useEffect(() => {
    let listParams: any = [];
    const filterCmt = cmt?.filter((elm) => elm.selected_text !== null);
    filterCmt?.map((elm: any) => {
      let pos = elm?.position?.blocks?.[0]?.data?.code;
      const paramCmt = {
        parent: elm.parent,
        position: { start: pos?.start, end: pos?.end },
        sentence: pos?.sentence,
        selectedText: elm?.selected_text,
        comment: elm?.content,
        tags: elm?.tags,
      };
      listParams.push(paramCmt);
    });
    setCommentList(listParams);
  }, [cmt]);

  const onAction = (action: any, item: any) => {
    if (action === "delete") {
      const isHave = cmt?.find((elm) => elm?.position?.blocks?.[0]?.data?.code?.start == item?.position?.start);
      axiosClient.delete("/items/comments/" + isHave.id).then((res) => {
        setTimeout(() => {
          mutateCmt();
        }, 500);
      });
    } else {
      setEdit({
        ...edit,
        [item.parent]: !edit?.[item.parent],
      });
    }
  };

  const setSubmit = (item: any, dataElm: any) => {
    const { comment, selectedText, sentence, parent } = item;
    const isHave = cmt?.find((elm) => elm?.position?.blocks?.[0]?.data?.code?.start == item?.position?.start);
    setEdit({
      ...edit,
      [dataElm?.parent]: !edit?.[dataElm?.parent],
    });
    const configTags = item.tags?.map((elm) => {
      [{ comments_id: isHave.id }, { id: elm }];
    });

    const params = {
      content: item.comment,
      tags: item.tags,
      part: tabNumber,
    };

    axiosClient.patch("/items/comments/" + isHave.id, params).then((res) => {
      setTimeout(() => {
        mutateCmt();
      }, 500);
    });
  };
  useEffect(() => {
    mutateCmt();
  }, [tabNumber]);

  useEffect(() => {
    const part = answerList?.detail?.[tabNumber]?.answer;
    if (part) {
      AxiosController.get("review/" + part?.file_id + "?answer_id=" + answerId)
        .then((res) => {
          if (res?.data?.transcript) {
            setTranscript(res);
            setLoadingpage(false);
          } else {
            setLoadingpage(true);
            navigate(`/review/speaking/${answerId}?class=${classId}`);
          }
        })
        .catch((error: any) => {
          setLoadingpage(true);
          navigate(`/review/speaking/${answerId}?class=${classId}`);
        });
    }
  }, [tabNumber, answerList]);

  useEffect(() => {
    setTimeout(() => {
      const wraper = document.querySelector("#tab-speaking-result");
      const spanElement = document.createElement("div");
      const spanElementStudent = document.createElement("div");
      const userCreate = answerList?.user_created;
      const avtDefault = profile.role.name == "Teacher" ? "https://www.nea.org/sites/default/files/legacy/2020/04/new_teacher.jpeg" : "/images/avt-student.png";
      const avtUser = userCreate?.avatar || "/images/avt-student.png"
      spanElement.innerHTML = `<div class="rounded-[12px] mb-[15px] bg-white box-shadow p-[20px]">
      <div class="rounded-full overflow-hidden w-[60px] h-[60px] object-cover m-auto"><img src="${profile?.avatar ? cms + "/assets/" + profile?.avatar : avtDefault
        }" size="md" class="h-full w-full m-auto object-cover" /></div>
      <p class="body1 text-primary2 text-center mt-[10px]">${profile?.fullname}</p>
      <p class="caption text-center font-normal text-gray">${profile?.email}</p>
      </div>`;
      spanElementStudent.innerHTML = `<div class="rounded-[12px] bg-white box-shadow p-[20px]">
      <div class="rounded-full overflow-hidden w-[60px] h-[60px] object-cover m-auto"><img src="${userCreate?.avatar ? cms + "/assets/" + userCreate?.avatar : avtUser
        }" size="md" class="h-full w-full m-auto object-cover" /></div>
      <p class="body1 text-primary2 text-center mt-[10px]">${userCreate?.fullname || (userCreate?.first_name + " " + userCreate?.last_name)}</p>
      <p class="caption text-center font-normal text-gray">${userCreate?.email}</p>
      </div>`;
      if (wraper) {
        const firstChild = wraper?.firstChild;
        wraper?.insertBefore(spanElement, firstChild);
        if (profile.role.name == "Teacher") {
          wraper?.insertBefore(spanElementStudent, firstChild);
        }

      }
    }, 100);
  }, [isLoadingpage]);
  if (isLoadingpage) {
    return (
      <div className="m-auto text-center h-[calc(100vh-76px)] flex justify-center items-center">
        <Spin className="h-full w-full text-center flex justify-center items-center" />
      </div>
    );
  } else {
    return (
      <div className="zoomin-content">
        <div className="xl:flex mx-auto max-w-[95%] 2xl:my-[30px] my-[20px] xl:h-[calc(100vh-124px)]">
          <div className="xl:w-[75%] mx-auto speaking-result">
            <div className="md:flex w-full h-full">
              <Tabs id="tab-speaking-result" selectedKey={tabNumber} onSelectionChange={setTab} aria-label="Dynamic tabs" className="block tab-speaking-result md:mr-[20px]">
                {quiz?.parts?.map((item: any, index: any) => (
                  <Tab
                    key={index}
                    title={
                      <div>
                        <span className="font-bold">Part {index + 1}: </span>
                        <span>{item.title}</span>
                      </div>
                    }
                    className="block"
                  >
                    <p className="body1 mb-[30px]">{quiz?.title}</p>
                    <div className="flex line-clamp-1">
                      <span className="body1 text-bold mr-[5px] whitespace-nowrap">Part {index + 1}: </span>
                      <span dangerouslySetInnerHTML={{ __html: item?.content || "" }}></span>
                    </div>
                    <ContentRenderPartUI
                      commentList={commentList}
                      parts={quiz?.parts}
                      answer={answerList}
                      indexPart={0}
                      setEdit={setEdit}
                      edit={edit}
                      audioId={audioId}
                      tagList={tagList}
                      answerId={answerId}
                      cmt={cmt}
                      ResultElsa={ResultElsa}
                      tabNumber={index}
                      transcriptList={transcriptList}
                      profile={profile}
                      mutate={mutate}
                      mutateCmt={mutateCmt}
                      transcriptData={transcriptData}
                      isPopupEditor={isPopupEditor}
                      transcript={transcript}
                    ></ContentRenderPartUI>
                  </Tab>
                ))}
              </Tabs>
            </div>
          </div>

          <div className="xl:w-[25%] md:ml-[20px] md:pr-[3px] overflow-auto pr-[20px]">
            <TabTeacher
              profile={profile}
              setSubmit={setSubmit}
              edit={edit}
              onAction={onAction}
              commentList={commentList}
              selectedValue={selectedValue}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              audioId={audioId}
              tagList={tagList}
              answer={answerList}
              answerId={answerId}
              cmt={cmt}
              ResultElsa={ResultElsa}
              mutateCmt={mutateCmt}
              tabNumber={tabNumber}
              activeKeys={activeKeys}
              isPopupEditor={isPopupEditor}
              openEditor={openEditor}
            />
          </div>
        </div>
      </div>
    );
  }
};
export default SpeakingResult;

const ContentRenderPartUI = ({
  mutateCmt,
  mutate,
  profile,
  transcriptList,
  tabNumber,
  ResultElsa,
  cmt,
  answerId,
  tagList,
  audioId,
  commentList,
  answer,
  parts,
  indexPart,
  transcriptData,
  isPopupEditor,
  transcript,
}: any) => {
  const [select, setSelect] = useState(0);
  const [comment, setComment] = useState("");
  const [play, setPlay] = useState(-1);
  const stop = useRef(false);
  const [popupSelect, setPopupSelect]: any = useState({});
  const [popupEdit, setPopupEdit]: any = useState({});
  const [edit, setEdit]: any = useState(false);
  const [editList, setSubmitEdit] = useState([]);
  const [lastSelectedState, setLastSelected] = useState();
  const [loading, setLoading] = useState(false);

  const part = parts?.[tabNumber];
  const partQuiz = answer?.detail?.[tabNumber]?.answer;
  const questions = part?.questions;
  const detailAnswer = (answer?.detail || []).find((item: any, index: any) => index == tabNumber)?.answer || {};
  const answerOfQuestion = detailAnswer.questions || {};
  const review = answer?.review;
  const isTeacher = profile?.role?.name === "Teacher";

  const [isEditTranscript, setEditTranscript] = useState(false);
  const [open, setOpen]: any = useState(false);
  const [isOpen, setIsOpen] = React.useState();
  const [activeTags, setActiveTags]: any = useState({});

  const [wordsList, setWords]: any = useState([]);
  const [isTranscript, getTranscript] = useState(false);
  const [accor, setAccor]: any = useState();
  const [openTab, setOpenTab] = useState(0)

  const ref: any = useRef();
  const refPopup: any = useRef();
  const refPopupEdit: any = useRef();
  const refEditTrans: any = useRef();

  useOnClickOutside(ref, () => setOpen(false));
  useOnClickOutside(refPopup, () =>
    setPopupSelect({
      status: false,
    }),
  );
  useOnClickOutside(refPopupEdit, () => {
    setEdit(false);
    setPopupEdit({
      status: false,
    });
  });
  const playSections = (index: number, time: number) => {
    if (play === index) {
      setPlay(-1);
      stop.current = true;
      refAudio.current.pause();
      setTimeout(() => {
        stop.current = false;
      }, 1000);
    } else {
      setPlay(index);
      setTime(time);
    }
  };
  const refAudio: any = useRef();
  const setTime = (time: number) => {
    refAudio.current.currentTime = time;
    refAudio.current.play();
  };
  const onPlay = (e: any) => {
    const index = transcript?.data?.speaker?.utterances?.find((elm: any, index: any) => {
      const start = elm.start_time;
      const end = elm.end_time;
      return refAudio.current.currentTime > start && refAudio.current.currentTime <= end;
    });
    if (index < -1) return setPlay(-1);
    if (index && index !== play && !stop.current) return setPlay(transcript?.data?.speaker?.utterances.indexOf(index));
  };
  const onPause = () => {
    setPlay(-1);
  };

  const setSubmit = (item: any) => {
    const isHave = cmt?.find((elm) => elm?.position?.blocks?.[0]?.data?.code?.start == item?.position?.start);

    const params: any = {
      status: "published",
      content: item.comment,
      part: tabNumber,
      parent: item.parent,
      position: {
        blocks: [
          {
            type: "code",
            data: {
              code: { ...item.position, sentence: item.sentence },
            },
          },
        ],
      },
      tags: [],
      answer: answerId,
      selected_text: item.selectedText,
    };

    if (isHave) {
      let configTags = { delete: [], create: [] };
      const deleteTag = item?.dataItem?.tags?.filter((elm) => !item.tags.includes(elm.tag_id.id));
      if (deleteTag) {
        configTags.delete = deleteTag.map((elm) => elm.id);
      }
      var result = item?.tags.filter((id) => !item?.dataItem?.tags.some((item) => item.tag_id.id === id));

      if (result?.length > 0) {
        result.map((elm) => {
          configTags.create.push({
            comments_id: isHave?.id,
            tag_id: { id: elm },
          });
        });
      }
      params.tags = configTags;

      axiosClient.patch("/items/comments/" + isHave.id, params).then((res) => {
        setTimeout(() => {
          mutateCmt();
        }, 500);
      });
    } else {
      let configTags = { create: [] };
      item.tags?.map((elm) => {
        configTags.create.push({ comment_id: "+", tag_id: { id: elm } });
      });

      params.tags = configTags;
      callPostCMT(params);
    }
    setPopupSelect({
      status: false,
    });
  };
  const callPostCMT = (params: any) => {
    axiosClient.post("/items/comments/", params).then((res) => {
      if (res) {
        setTimeout(() => {
          mutateCmt();
        }, 500);
      }
    });
  };
  const onAction = (type: any, item: any, paramsEdit: any) => {
    if (type == "edit") {
      setEdit(true);
    } else {
      setLoading(true);
      if (item) {
        axiosClient.delete("/items/transcript/" + item.id).then((res) => {
          if (res) {
            setTimeout(() => {
              mutate();
              setLoading(false);
              setPopupEdit({
                status: false,
              });
            }, 500);
          }
        });
      } else {
        const paramAdd = {
          status: "draft",
          yousaid: paramsEdit.yousaid,
          answer: paramsEdit.answerId,
          position: { id: paramsEdit.id },
        };
        axiosClient.post("/items/transcript", paramAdd).then((res) => {
          setTimeout(() => {
            mutate();
            setEdit(false);
            setLoading(false);
            setPopupEdit({ status: false });
          }, 500);
        });
      }
    }
  };
  const onChangePopup = (item: any, selectionText: any) => {
    const select = window.getSelection();
    setPopupSelect({
      status: false,
    });
    setPopupEdit({
      type: "add-wrong-text",
      status: true,
      id: item,
      key: selectionText,
      select: getStartOf(select),
    });
    setEdit(true);
  };
  useEffect(() => {
    const content: any = document.getElementsByClassName("wraper-wrong-text")[0];
    const wrongText: any = document.getElementsByClassName("text-wrong");
    const textSelected: any = document.getElementsByClassName("text-selected");

    if (content) {
      content.addEventListener("mouseup", function () {
        let elm: any = window.getSelection()?.anchorNode?.parentNode as any;
        var selectedText: any = window.getSelection()?.toString() as any;
        var oRange = window.getSelection()?.getRangeAt(0); //get the text range
        if (oRange?.commonAncestorContainer instanceof Element && oRange?.commonAncestorContainer?.outerHTML?.indexOf("<mark") > -1) {
          return;
        }
        if (selectedText && isTeacher) {
          openPopupSelect(elm, elm.id);
        }
      });
    }

    var arr = Array.from(wrongText);
    arr.map((elm: any) => {
      elm.addEventListener("click", function () {
        setPopupEdit({
          type: elm.attributes.isadd ? "add-wrong-text" : "",
          status: true,
          id: elm.id,
          key: elm.attributes.key.value,
        });
      });
    });
    var arrTextSelected = Array.from(textSelected);
    arrTextSelected.map((elm: any) => {
      elm.addEventListener("click", function () {
        setPopupSelect({
          status: true,
          id: elm.id,
          key: elm.attributes.key.value,
        });
      });
    });
  }, [commentList, transcript, wordsList, accor, popupEdit?.status]);
  useEffect(() => {
    setTimeout(() => {
      const list = transcriptList.filter((elm) => elm.position.type === "add-wrong-text");
      setWords(list);
    }, 500);
  }, [transcriptList]);
  const submitEdit = (item: any, findStoreItem: any) => {
    let param: any = {
      status: "published",
      yousaid: item.yousaid,
      correction: item.correct,
      feedback: item.feedback,
      tags: [],
      position: { id: item.id, item: item.item, type: popupEdit?.type },
      answer: answerId,
    };
    let addWrongText: any = {
      decision: "incorrect",
      id: popupEdit.id,
      end_index: popupEdit?.select + popupEdit?.key?.length,
      start_index: popupEdit?.select,
      text: popupEdit?.key,
      word: popupEdit?.key,
    };
    let paramAdd: any = {
      status: "published",
      yousaid: item.yousaid,
      correction: item.correct,
      feedback: item.feedback,
      tags: [],
      position: { id: popupEdit.id, item: addWrongText, type: "add-wrong-text" },
      answer: answerId,
    };

    let configTags = { delete: [], create: [] };
    const deleteTag = item?.dataItem?.tags?.filter((elm) => !item.tags.includes(elm.tag_id.id));
    if (deleteTag) {
      configTags.delete = deleteTag.map((elm) => elm.id);
    }
    var result = item?.tags.filter((id) => !item?.dataItem?.tags.some((item) => item.tag_id.id === id));

    if (result?.length > 0) {
      result.map((elm) => {
        configTags.create.push({
          comments_id: findStoreItem?.id,
          tag_id: { id: elm },
        });
      });
    }
    param.tags = configTags;
    paramAdd.tags = configTags;

    if (popupEdit?.type == "add-wrong-text") {
      if (findStoreItem) {
        axiosClient.patch("/items/transcript/" + findStoreItem.id, paramAdd).then((res) => {
          setTimeout(() => {
            mutate();
          }, 500);
        });
      } else {
        let configTags = { create: [] };
        item.tags?.map((elm) => {
          configTags.create.push({ comment_id: "+", tag_id: { id: elm } });
        });

        paramAdd.tags = configTags;
        setWords([...wordsList, paramAdd]);
        axiosClient.post("/items/transcript", paramAdd).then((res) => {
          setTimeout(() => {
            mutate();
          }, 500);
        });
      }
    } else {
      if (findStoreItem) {
        axiosClient.patch("/items/transcript/" + findStoreItem.id, param).then((res) => {
          setTimeout(() => {
            mutate();
          }, 500);
        });
      } else {
        axiosClient.post("/items/transcript", param).then((res) => {
          setTimeout(() => {
            mutate();
          }, 500);
        });
      }
    }
    setTimeout(() => {
      mutate();
    }, 1000);
    let list: any = [item];
    setSubmitEdit(list);
    setPopupEdit({
      status: false,
    });
    setEdit(false);
  };
  const PopupSelectedText = ({ data }: any) => {
    var selection = window.getSelection()?.toString();
    const windowSelected: any = (selection as any) || popupSelect?.key;
    const id: any = ((window.getSelection()?.anchorOffset as any) + window.getSelection()?.focusOffset) as any;
    const comment: any = commentList.find((elm: any) => elm.selectedText == windowSelected);

    const getUid = uid();
    var selectedText: any = windowSelected || comment?.selectedText;
    const position = {
      start: comment?.position?.start ? comment?.position?.start : calculateOffset(window.getSelection())?.start,
      end: comment?.position?.end ? comment?.position?.end : calculateOffset(window.getSelection())?.end,
    };

    let findTag = [];
    comment?.tags.map((elm) => findTag.push(elm?.tag_id?.id));
    var keysToInclude: any = findTag || [];
    let activeLocal: any = {};

    const setActive = (id: any) => {
      if (isTeacher) {
        const tagId: any = document.getElementById(`tag-${id}`);
        if (tagId.classList.contains("active-tag")) {
          tagId.classList.add("deactive-tag");
          tagId.classList.remove("active-tag");
          keysToInclude?.map((elm: any, index: any) => {
            if (elm == id) {
              keysToInclude.splice(index, 1);
            }
          });
        } else {
          tagId.classList.add("active-tag");
          tagId.classList.remove("deactive-tag");
          keysToInclude.push(id);
        }
      }
    };
    let comments: any = { position: position, sentence: data, selectedText: selectedText, comment: comment?.comment, tags: keysToInclude, parent: getUid, dataItem: comment };
    if (selectedText == "") return;
    return (
      <div
        key={tabNumber + "-tabs"}
        ref={refPopup}
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        className="w-full md:w-[350px] absolute top-[42px] border-[0.5px] border-gray bg-white z-[1111] rounded-[14px] p-[20px]"
      >
        <div className="md:min-w-[300px]">
          <p>
            <span className="body3">{selectedText}</span>
          </p>
          <div className="flex flex-wrap gap-[5px] items-center my-[12px]">
            {tagList.map((elm: any, index: any) => {
              const findTag = comment?.tags?.find((tag) => tag?.tag_id?.id == elm?.id);
              const isActive = comment?.tags ? findTag : activeTags?.[elm?.id];

              return (
                <p
                  onClick={() => setActive(elm?.id)}
                  key={index + elm?.title}
                  id={`tag-${elm?.id}`}
                  className={`${isActive ? "active-tag" : "deactive-tag"} cursor-pointer px-[8px] py-[4px] rounded-[4px] text-white caption`}
                >
                  #{elm?.title}
                </p>
              );
            })}
          </div>
          <textarea onInput={(e: any) => {
            comments.comment = e.target.value;
          }}
            disabled={!isTeacher}
            defaultValue={selection ? "" : comment?.comment || ""}
            placeholder="Nhập nội dung..."
            className="w-full bg-neu5 p-[10px] rounded-[8px] textarea-selected min-h-[88px]">
          </textarea>
          {isTeacher && (
            <div className="flex items-center justify-between mt-[12px]">
              <div onClick={() => setSubmit(comments)} className="bg-primary1 px-[12px] py-[4px] rounded-[4px] text-white caption cursor-pointer">
                Submit
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const PopupEdit = ({ children }: any) => {
    const item: any = children.find((elm: any) => elm.text == popupEdit?.key);
    const list: any = editList.find((elm: any) => elm.yousaid == item?.text);
    let findStoreItem = transcriptList?.find((elm) => elm?.position?.id == popupEdit?.id && elm?.yousaid == popupEdit?.key);
    const defaultValue = {
      yousaid: list?.yousaid || findStoreItem?.yousaid || item?.text || popupEdit?.key,
      correct: list?.correct || findStoreItem?.correction || item?.text,
      feedback: list?.feedback || findStoreItem?.feedback,
    };
    const paramsEdit = {
      id: popupEdit?.id,
      answerId: answerId,
      ...defaultValue,
    };
    let findTag = [];
    findStoreItem?.tags.map((elm) => findTag.push(elm?.tag_id?.id));
    var keysToInclude: any = findTag || [];

    let activeLocal: any = {};
    const setActive = (id: any) => {
      if (isTeacher) {
        const tagId: any = document.getElementById(`tag-edit-${id}`);
        if (tagId.classList.contains("active-tag")) {
          tagId.classList.add("deactive-tag");
          tagId.classList.remove("active-tag");
          keysToInclude?.map((elm: any, index: any) => {
            if (elm == id) {
              keysToInclude.splice(index, 1);
            }
          });
        } else {
          tagId.classList.add("active-tag");
          tagId.classList.remove("deactive-tag");
          keysToInclude.push(id);
        }
      }
    };
    let setEditList: any = {
      yousaid: defaultValue.yousaid,
      item: item || popupEdit?.id,
      id: popupEdit?.id,
      tags: keysToInclude,
      dataItem: findStoreItem,
    };

    return (
      <div
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        ref={refPopupEdit}
        className="w-full md:w-[350px] absolute top-[42px] border-[0.5px] border-gray bg-white z-[1111] rounded-[14px] p-[20px]"
      >
        {loading && (
          <div className="bg-neu5 opacity-[0.5] w-full h-full absolute top-0 left-0 m-auto flex justify-center items-center text-center z-[1111]">
            <Spin></Spin>
          </div>
        )}
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-wrap gap-[5px] my-[6px] w-full">
              {/* <p className="bg-neu3 px-[8px] py-[4px] rounded-[4px] text-white caption">#vocab</p> */}
              {edit ? (
                <div className="flex flex-wrap items-center">
                  {tagList.map((elm: any, index: any) => {
                    const findTag = findStoreItem?.tags?.find((tag) => tag?.tag_id?.id == elm?.id);
                    const isActive = findStoreItem?.tags ? findTag : activeTags?.[elm?.id];
                    return (
                      <p
                        onClick={() => setActive(elm?.id)}
                        key={index + elm?.title}
                        id={`tag-edit-${elm?.id}`}
                        className={`${isActive ? "active-tag" : "deactive-tag"} cursor-pointer px-[8px] py-[4px] rounded-[4px] mr-[8px] mb-[8px] text-white caption`}
                      >
                        #{elm?.title}
                      </p>
                    );
                  })}
                </div>
              ) : (
                findStoreItem?.tags?.map((item: any) => {
                  const tag = tagList?.find((elm: any) => elm?.id == item?.tag_id?.id);
                  if (!tag) return;
                  return (
                    <p key={item} style={{ background: tag?.color }} className="px-[8px] py-[4px] rounded-[4px] text-white caption">
                      #{tag?.title}
                    </p>
                  );
                })
              )}
            </div>
            {isTeacher && (
              <Dropdown>
                <DropdownTrigger>
                  <div className="bg-primary1 p-[6px] rounded-full cursor-pointer">
                    <PencelIcon fill="red" className="w-[9px] h-[9px]" />
                  </div>
                </DropdownTrigger>
                <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
                  <DropdownSection title="Actions">
                    <DropdownItem onClick={() => onAction("edit", findStoreItem, paramsEdit)} key="edit">
                      Edit
                    </DropdownItem>
                    <DropdownItem onClick={() => onAction("delete", findStoreItem, paramsEdit)} key="delete">
                      Delete
                    </DropdownItem>
                  </DropdownSection>
                </DropdownMenu>
              </Dropdown>
            )}
          </div>
          <div className="flex">
            <div className="mt-[8px] w-full">
              <div className="flex items-center">
                <p className="min-w-[100px]">You said</p>
                {edit ? (
                  <Input
                    onInput={(e: any) => {
                      setEditList.yousaid = e.target.value;
                    }}
                    isDisabled
                    size="sm"
                    type="text"
                    defaultValue={defaultValue?.yousaid}
                  />
                ) : (
                  <p>
                    <span className="text-red">{defaultValue?.yousaid}</span> {item?.trans_arpabet && " / " + item?.trans_arpabet}
                  </p>
                )}
              </div>
              <div className="h-[0.5px] w-full bg-neu3 my-[5px]"></div>
              <div className="flex items-center">
                <p className="min-w-[100px]">Correction</p>
                {edit ? (
                  <Input
                    onInput={(e: any) => {
                      setEditList["correct"] = e.target.value;
                    }}
                    defaultValue={defaultValue?.correct}
                    size="sm"
                    type="text"
                  />
                ) : (
                  <p>
                    <span className="text-green1">{defaultValue?.correct}</span> {item?.ipa && " / " + item?.ipa}
                  </p>
                )}
              </div>
              <div className="h-[0.5px] w-full bg-neu3 my-[5px]"></div>
              <div className="flex items-center">
                <p className="min-w-[100px]">Feedback</p>
                {edit ? (
                  <Textarea
                    onInput={(e: any) => {
                      setEditList["feedback"] = e.target.value;
                    }}
                    defaultValue={defaultValue?.feedback}
                    size="sm"
                    type="text"
                  />
                ) : (
                  <p>{defaultValue?.feedback}</p>
                )}
              </div>
            </div>
          </div>
          {edit && (
            <div className="flex items-center justify-end">
              <div
                onClick={() => submitEdit(setEditList, findStoreItem)}
                className="w-[100px] text-center mt-[20px] bg-primary1 px-[12px] py-[4px] rounded-[4px] text-white caption cursor-pointer"
              >
                Submit
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  const openPopupSelect = (elm: any, item: any) => {
    var selectedText: any = window.getSelection()?.toString() as any;
    if (selectedText) {
      setPopupSelect({
        id: "selected-" + item,
        status: true,
        key: selectedText,
      });
    }
  };
  useEffect(() => {
    if (part?.id && detailAnswer) {
      setTimeout(() => {
        const duraTime: any = document.getElementById(`duraTime-${part?.id}`);
        const lastTimeDuration: any = document.getElementById(`lastTimeDuration-${part?.id}`);
        if (duraTime?.innerHTML && lastTimeDuration) {
          lastTimeDuration.innerHTML = duraTime?.innerHTML;
        }
      }, 1000);
    }
  }, [part, detailAnswer]);
  const audioLink = `${cms}/assets/${audioId}`;
  let timeoutId: any = null;
  const onChangeTrans = (e: any, utterance_id: any) => {
    let newObject = { ...transcript };
    let textChange = e.target.innerText;
    newObject?.data?.speaker?.utterances.map((elm) => {
      if (elm.utterance_id === utterance_id) {
        elm.text = textChange;
      }
    });
    clearTimeout(timeoutId);
    let trId = transcript?.id;
    timeoutId = setTimeout(() => {
      axiosClient.patch("/items/processed_transcriptions/" + trId, { data: newObject?.data }).then((res) => { });
    }, 1000);
  };
  return (
    <div>
      <div className="transcript-result">
        {transcript ? (
          <div>
            <div className="my-[20px]">
              <AudioPlayerId isStart={isPopupEditor} onPause={onPause} onPlay={onPlay} refAudio={refAudio} id={partQuiz?.file_id} partId={part?.id} />
            </div>
            <div className="flex items-center">
              <div className="bg-neu2 p-[6px] rounded-full cursor-pointer">
                <AttentionIcon fill="red" className="w-[12px] h-[12px]" />
              </div>
              <p className="caption text-neu2 ml-[6px]">Máy không thể nghe được 100% chính xác script của bạn, nên mình đừng để ý <span className="text-red">những chỗ quá lặt vặt</span> sẽ khiến mình mất thời gian nha. Mình chỉ tập trung vào những lỗi rất quan trọng giáo viên đã feedback để cải thiện cải thiện kĩ năng Speaking của mình tốt nhất nè.</p></div>
            <AnimatePresence mode="wait">
              <motion.div
                key={"animation"}
                variants={tabContentVariants}
                initial="initial"
                animate="enter"
                exit="exit"
                transition={{
                  duration: 0.3,
                }}
              >
                <div className="mt-[20px]">
                  {part?.questions?.map((data: any, indexPart: any) => {
                    const { time_start, time_finish } = answerOfQuestion?.[data.id] || {};
                    return (
                      <motion.div
                        key={openTab == indexPart ? "animation" : "empty"}
                        exit="exit"
                        transition={{
                          duration: 0.3,
                        }}
                      >
                        <div
                          className="mt-[20px]"
                          key={indexPart}
                        >
                          <div className="cursor-pointer flex justify-between items-center" onClick={() => setOpenTab(indexPart)}>
                            <div>
                              <span className="body3 font-bold">Question {indexPart + 1} : </span>
                              <span className="font-normal body4">{data.title}</span>
                            </div>
                            <div><RightArrowIcon className="rotate-90" /></div>
                          </div>
                          <div>
                            {openTab == indexPart && <div>
                              {transcript?.data?.speaker?.utterances
                                ?.sort((a: any, b: any) => a.end_time - b.end_time)
                                ?.map((itemTrans: any, index: any) => {
                                  let isCheck = false;
                                  if (time_start >= itemTrans.start_time && time_finish <= itemTrans.end_time) {
                                    isCheck = true;
                                  }
                                  if (!isCheck) return;
                                  const dataItem = transcript?.data?.speaker?.utterances;
                                  const hiddenList = transcriptData?.data?.data?.filter((elm) => elm.status === "draft");
                                  itemTrans["sliceFirst"] = dataItem?.[index - 1]?.end_index + 1;
                                  const { sliceFirst, start_index, end_index, start_time, end_time, text, utterance_id } = itemTrans;
                                  let arrayIndex: any = [];
                                  let itemWord: any = [];
                                  let resultReplace = text;
                                  commentList?.map((item: any, index: any) => {
                                    if (item.sentence == utterance_id) {
                                      if (resultReplace.indexOf(item.selectedText) > -1) {
                                        const textReplace = `<a href=#id_cmt=${item?.parent}><mark id="${"selected-" + utterance_id}" key="${item?.selectedText}" class='${item?.parent
                                          } py-[2px] rounded-[4px] cursor-pointer text-selected bg-[rgba(249,157,28,0.20)]'>${item?.selectedText}</mark></a>`;
                                        if (item.selectedText) {
                                          const replace = resultReplace.replace(item.selectedText, textReplace);
                                          resultReplace = replace;
                                        }
                                      }
                                    }
                                  });

                                  wordsList.map((elm) => {
                                    const itemElm = elm.position.item;
                                    itemWord.push(itemElm);
                                    if (utterance_id == itemElm.id) {
                                      const textReplace = `<mark isadd="true" key="${itemElm.text}" id="${utterance_id}" class="text-red-wrong font-bold cursor-pointer text-wrong">${itemElm.text}</mark>`;
                                      const replace = resultReplace.replace(itemElm.text, textReplace);
                                      resultReplace = replace;
                                    }
                                  });
                                  const active = index === play;
                                  return (
                                    <div key={index + "-keys"} className="md:flex mb-[20px] mt-[10px] w-full">

                                      <div onClick={() => playSections(index, start_time)} className="w-full justify-between relative md:w-[40px] h-10 flex items-center justify-center">
                                        <div>
                                          {active ? (
                                            <img src="/images/icon-voicing.gif" className="shrink w-14 h-14 md:translate-x-[-5px] translate-x-[-13px] object-cover" />
                                          ) : (
                                            <PlayCircleIcon className="cursor-pointer w-8 h-8 fill-primary1" />
                                          )}
                                        </div>
                                        <div
                                          onClick={() => playSections(index, start_time)}
                                          className="md:hidden cursor-pointer min-w-[100px] border-[1px] border-primary1 h-fit rounded-[4px] flex justify-center items-center md:ml-[12px] px-[6px] py-[4px] body5 font-bold"
                                        >
                                          <p>
                                            {convertSecondToTime(start_time)}
                                            <span className="mx-[5px]">-</span>
                                          </p>
                                          <p>{convertSecondToTime(end_time)}</p>
                                        </div>
                                      </div>

                                      <div className="md:flex justify-between items-center w-full relative">
                                        <div className="flex items-center w-full">
                                          <div
                                            ref={refEditTrans}
                                            contentEditable={isEditTranscript}
                                            id={utterance_id}
                                            onInput={(e) => onChangeTrans(e, utterance_id)}
                                            className={`wraper-wrong-text md:ml-[5px] mt-[5px] relative w-full ${isEditTranscript && "border-neu3 py-[3px] px-[5px] border-[0.5px] rounded-[5px]"
                                              }`}
                                            dangerouslySetInnerHTML={{ __html: resultReplace || "" }}
                                          ></div>
                                          {isTeacher && (
                                            <span
                                              onClick={() => {
                                                setEditTranscript(!isEditTranscript);
                                              }}
                                              className="ml-[12px] mt-[5px] cursor-pointer bg-neu7 border-primary1 border-[0.5px] rounded-[4px] h-[30px] px-[6px] flex items-center justify-center"
                                            >
                                              <img src="/images/pencel.svg" />
                                            </span>
                                          )}
                                        </div>
                                        {popupEdit?.id == utterance_id + indexPart && popupEdit?.status ? <PopupEdit>{itemWord}</PopupEdit> : ""}
                                        {"selected-" + utterance_id == popupSelect?.id && popupSelect?.status && !isEditTranscript ? (
                                          <PopupSelectedText data={utterance_id}></PopupSelectedText>
                                        ) : (
                                          ""
                                        )}

                                        <div
                                          onClick={() => playSections(index, start_time)}
                                          className="hidden cursor-pointer min-w-[100px] border-[1px] border-primary1 h-fit rounded-[4px] md:flex justify-center items-center md:ml-[12px] mt-[12px]  md:mt-[5px] px-[6px] py-[4px] body5 font-bold"
                                        >
                                          <p>
                                            {convertSecondToTime(start_time)}
                                            <span className="mx-[5px]">-</span>
                                          </p>
                                          <p>{convertSecondToTime(end_time)}</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })} </div>}
                          </div>

                        </div>
                      </motion.div>
                    );
                  })}

                </div>

              </motion.div>
            </AnimatePresence>

            <div className="md:flex gap-x-3">
              <div className="flex-1">
                {!detailAnswer?.file_id && (
                  <div className="bg-white shadow-card border-small rounded-small py-10 flex-col flex items-center justify-center font-semibold uppercase">
                    <FaceFrownIcon className="w-10 h-10 fill-yellow-600" />
                    <span className="mt-4 text-yellow-600">Học sinh chưa trả lời</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full mx-auto text-center mt-[50px]">
            <Spin></Spin>
          </div>
        )}
      </div>
    </div>
  );
};

const TabTeacher = ({
  activeKeys,
  mutateCmt,
  profile,
  answer,
  cmt,
  answerId,
  tagList,
  audioId,
  transcript,
  setSubmit,
  edit,
  onAction,
  commentList,
  selectedValue,
  selectedKeys,
  setSelectedKeys,
  tabNumber,
  isPopupEditor,
  openEditor,
}: any) => {
  var lists = new Set(activeKeys);
  const [isRec, startRec] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput]: any = useState({});
  const [parent, setParent]: any = useState();
  const [reply, setReply]: any = useState();
  const [callBack, setCallBack] = useState(false);
  const [isReset, setReset] = useState(false);
  const [valueNote, setValueNote] = useState("");
  const refAudio2: any = useRef();
  const { fail, success }: any = useToast();
  let comments: any = {};
  const partQuiz = answer?.detail?.[tabNumber]?.answer;
  const onSubmitReview = async () => {
    setLoading(true);
    const payload = {
      note: input?.score,
      details: [{ part_id: 1, voice: input?.voice, note: valueNote || answer?.review?.details?.[0]?.note }],
      status: "reviewed",
    };
    if (answer?.review?.id) {
      const resultReview = await axiosClient.patch("/items/review/" + answer?.review?.id, payload);
      if (resultReview) {
        getLoading();
        success("Gửi lên thành công");
      }
    } else {
      const resultReview = await axiosClient.patch("/items/answer/" + answerId, { review: payload, status: "reviewed" });
      if (resultReview) {
        getLoading();
        success("Gửi lên thành công");
      }
    }
  };
  const getLoading = () => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  const detail = answer?.review?.details?.[0];
  const isTeacher = profile?.role?.name === "Teacher";

  const plusAll = tagList && [{ title: "Tất cả", id: 0 }, ...tagList];
  let listIdTags = [];

  const mySet = new Set(lists);
  const arrayFromSet = Array.from(mySet);
  plusAll?.map((elm) => {
    arrayFromSet?.map((item) => {
      if (elm.title == item) {
        listIdTags.push(elm.id);
      }
    });
  });
  let isWaitingSubmit = false;
  const sendReply = async (item) => {
    isWaitingSubmit = true;
    if (isWaitingSubmit && reply?.value) {
      const params = {
        content: reply?.value,
        parent: item?.parent,
        part: tabNumber,
        answer: answerId,
      };
      const replyDiv = document.querySelectorAll(".input-reply") as any;
      replyDiv.forEach(function (elm) {
        if (elm) {
          elm.value = "";
        }
      });
      if (reply?.value) {
        const result = await axiosClient.post("/items/comments/", params);
        if (result) {
          setCallBack(!callBack);
          setReply();
          setTimeout(() => {
            mutateCmt();
            isWaitingSubmit = false;
          }, 500);
        }
      }
    }
  };
  const brand = location.host == "e-learning.ielts1984.vn" ? true : false;
  const emptyImg = brand ? "/images/empty-1984.png" : "/images/patato.png";
  const changeContent = (e: any) => {
    if (e) {
      setValueNote(e);
    }
  };
  return (
    <>
      <Modal open={isPopupEditor}>
        <EditorSpeaking
          isTeacher={isTeacher}
          changeContent={changeContent}
          data={valueNote || detail?.note}
          fileId={partQuiz?.file_id}
          onClose={() => {
            openEditor(undefined);
          }}
        ></EditorSpeaking>
      </Modal>
      <div className="h-full">
        <div className="flex items-center justify-between mb-[12px]">
          <p className="body3">Comment</p>
          <Dropdown>
            <DropdownTrigger>
              <div className="flex items-center px-[10px] py-[2px] border-[1px] border-gray rounded-[6px] cursor-pointer">
                <p>{selectedValue}</p>
                <RightArrowIcon className="w-[15px] rotate-90 ml-[20px]" />
              </div>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Multiple selection example"
              variant="flat"
              closeOnSelect={false}
              disallowEmptySelection
              selectionMode="multiple"
              selectedKeys={activeKeys}
              onSelectionChange={setSelectedKeys}
            >
              {plusAll?.map((item: any) => (
                <DropdownItem key={item.title}>{item.title}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="h-[35%] overflow-hidden">
          <div className="overflow-y-auto h-[calc(100%-30px)] px-[6px] pt-[6px] pb-[6px] mb-[12px] comment-wraper">
            {commentList?.length > 0 ? (
              commentList.map((elm: any, index: any) => {
                const match = elm?.tags?.some((tag: any) => listIdTags?.includes(tag?.tag_id?.id)) || listIdTags?.includes(0);
                if (!match) return;
                return (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={match ? "animation" : "empty"}
                      variants={tabContentVariants}
                      initial="initial"
                      animate="enter"
                      exit="exit"
                      transition={{
                        duration: 0.3,
                      }}
                    >
                      <div className="" key={index + elm}>
                        <div
                          className={`box-shadow 2xl:p-[20px] p-[15px] rounded-[8px] mb-[12px] mt-[4px] scroll-margin-top ${window.location.hash == `#id_cmt=${elm.parent}` ? "active-cmt" : ""
                            }`}
                          id={`id_cmt=${elm.parent}`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="body5">{elm.selectedText}</p>
                            {isTeacher && (
                              <Dropdown>
                                <DropdownTrigger>
                                  <div className="bg-primary1 p-[6px] rounded-full cursor-pointer">
                                    <PencelIcon fill="red" className="w-[9px] h-[9px]" />
                                  </div>
                                </DropdownTrigger>
                                <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
                                  <DropdownSection title="Actions">
                                    <DropdownItem onClick={() => onAction("edit", elm)} key="edit">
                                      Edit
                                    </DropdownItem>
                                    <DropdownItem onClick={() => onAction("delete", elm)} key="delete">
                                      Delete
                                    </DropdownItem>
                                  </DropdownSection>
                                </DropdownMenu>
                              </Dropdown>
                            )}
                          </div>
                          {edit?.[elm.parent] ? (
                            <Textarea
                              onInput={(e: any) => {
                                comments = { ...elm, comment: e.target.value };
                              }}
                              defaultValue={elm.comment}
                              radius="sm"
                              labelPlacement="outside"
                              placeholder="Nhập nội dung..."
                              className="w-full rounded-[8px] my-[8px]"
                            />
                          ) : (
                            <p className="body5 my-[8px] font-bold">{elm.comment}</p>
                          )}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center flex-wrap gap-[5px]">
                              {elm?.tags?.map((item: any) => {
                                const tag = tagList?.find((elm: any) => elm.id == item?.tag_id?.id);
                                if (!tag) return;
                                return (
                                  <p key={item?.tag_id?.id + "-tags"} style={{ background: tag?.color }} className="px-[8px] py-[4px] rounded-[4px] text-white caption">
                                    #{tag?.title}
                                  </p>
                                );
                              })}
                            </div>
                            <div>
                              {(edit?.[elm.parent] && (
                                <p onClick={() => setSubmit(comments, elm)} className="bg-primary1 cursor-pointer px-[20px] py-[4px] rounded-[4px] text-white caption">
                                  Submit
                                </p>
                              )) || (
                                  <div
                                    onClick={() =>
                                      setParent({
                                        ...parent,
                                        [elm.parent]: {
                                          id: elm?.parent,
                                          status: !parent?.[elm?.parent]?.status,
                                        },
                                      })
                                    }
                                    className="caption cursor-pointer hover:text-primary1 flex items-center"
                                  >
                                    <p>Reply</p>
                                    <RightArrowIcon className={`${parent?.[elm?.parent]?.status ? "rotate-0" : "rotate-90"} transition-all w-[17px]`} />
                                  </div>
                                )}
                            </div>
                          </div>
                          {(parent?.[elm.parent]?.status == undefined ? true : !parent?.[elm.parent]?.status) && (
                            <div>
                              <ReplyList tabNumber={tabNumber} setCallBack={setCallBack} callBack={callBack} data={elm} cmt={cmt} />
                              <div className="mt-[8px] flex items-center">
                                {profile?.avatar && isTeacher ? (
                                  <div className="w-[33px] object-cover h-[30px] oveflow-hidden rounded-full mr-[8px] border-[1px] border-neu4">
                                    <img className="object-cover rounded-full h-[30px] w-[33px]" src={`${cms + "/assets/" + profile?.avatar}`} />
                                  </div>
                                ) : (
                                  isTeacher && <TeacherIcon className="mr-[8px]" />
                                )}
                                {isTeacher && (
                                  <div className="relative flex w-full">
                                    <input
                                      className="input-reply bg-white border-[1px] border-neu4 rounded-[8px] pl-[10px] pr-[40px] py-[5px] w-full"
                                      onChange={() => setReset(false)}
                                      onKeyDown={(e) => e.key === "Enter" && sendReply(elm)}
                                      onInput={(e: any) =>
                                        setReply({
                                          parent: elm.parent,
                                          value: e.target.value,
                                        })
                                      }
                                    ></input>
                                    <div className="absolute right-[12px] top-[6px]">
                                      {isReset ? (
                                        <div className="text-center m-auto mb-[8px]">
                                          <Spin size="small" />
                                        </div>
                                      ) : (
                                        <SubmitIcon onClick={() => sendReply(elm)} fill="black" className="w-[20px] fill-primary1 cursor-pointer opacity-[0.7] hover:opacity-[1]" />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                );
              })
            ) : (
              <div className="h-full flex items-center justify-center">
                <div>
                  <img src={emptyImg} className="w-[100px] m-auto mb-[20px]" />
                  <p className="body3">Không có comment nào</p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-[50%] mb-[20px] ml-[2px]">
          <div className="flex items-center justify-between 2xl:mb-[20px] mb-[12px]">
            <p className="body3">Overall feedback</p>
          </div>
          <div className={detail?.voice ? "2xl:h-[70px] mt-[12px] flex" : "flex"}>
            {(isTeacher && (
              <div className={"w-full"} onClick={() => startRec(true)}>
                <AudioRecorder id={detail?.voice} className="w-fit" getLink={(id: any) => setInput({ ...input, voice: id })} />
              </div>
            )) ||
              (detail?.voice && (
                <div className="w-full">
                  <AudioPlayerId id={detail?.voice} className="w-full" />
                </div>
              ))}
          </div>
          <div className="mt-[20px]">
            <div className="box-shadow 2xl:p-[20px] p-[15px] rounded-[8px]">
              <p className="body5 font-bold">Overall</p>
              <p className="caption my-[8px]">
                <div
                  onClick={() => openEditor(true)}
                  id="input-note"
                  className="bg-neu5 w-full 2xl:min-h-[100px] max-h-[80px] min-h-[60px] overflow-auto p-[10px] rounded-[10px]"
                  dangerouslySetInnerHTML={{ __html: valueNote || detail?.note }}
                />
              </p>
              <div className="bg-primary1 flex items-center justify-end px-[8px] py-[3px] rounded-[4px] text-white w-fit ml-auto">
                <p className="headline3">Score:</p>
                <div
                  contentEditable={isTeacher}
                  dangerouslySetInnerHTML={{ __html: answer?.review?.note }}
                  onInput={(e: any) => setInput({ ...input, score: e.target.textContent })}
                  className="headline3 font-bold ml-[5px] min-w-[50px] bg-transparent text-white h-full"
                />
              </div>
            </div>
          </div>
          {isTeacher && (
            <div
              onClick={loading ? () => { } : onSubmitReview}
              className={`${loading ? "opacity-[0.5] cursor-not-allowed" : "opacity-[1]"
                } bg-primary1 2xl:mt-[30px] mt-[20px] cursor-pointer flex items-center justify-center px-[8px] py-[8px] rounded-[4px] text-white w-full`}
            >
              <p className="headline2 mr-[5px] pr-[5px]">{loading ? "Submitting ..." : "Submit"}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const ReplyList = ({ data, callBack, setCallBack, tabNumber, cmt }: any) => {
  const [repList, setReplyList]: any = useState();
  const [loading, setLoading] = useState(false);
  const [limit, setLimit]: any = useState({});
  var limitDefault = 5;
  const seeMore = () => {
    let newValue = (limit?.[data.parent]?.number || limitDefault) + limitDefault;
    setLimit({
      [data.parent]: { number: newValue },
    });
  };

  const newArr = cmt?.filter((elm) => elm.selected_text == null && elm.parent == data.parent);
  const getNumber = limit?.[data.parent]?.number || limitDefault;

  return (
    <div className="ml-[10px] mt-[10px]">
      {loading ? (
        <div className="text-center m-auto mb-[8px]">
          <Spin />
        </div>
      ) : (
        newArr?.slice(0, getNumber)?.map((item: any, index: any) => {
          const userCreate = item?.user_created?.search;
          const avatar = item?.user_created.avatar;
          return (
            <div key={index + "-rep"} className="flex items-center mb-[8px]">
              {avatar ? (
                <img className="rounded-full border-[0.5px] border-neu4 w-[25px] h-[25px] rounded-full mr-[8px]" src={`${cms + "/assets/" + avatar}`} />
              ) : userCreate === "giao vien" ? (
                <div className="mr-[8px] w-[20px] h-[20px] object-cover">
                  <TeacherIcon className=" w-[20px] h-[20px] object-cover" />
                </div>
              ) : (
                <UserIcon className="mr-[8px]" />
              )}
              <p className="caption">{item?.content}</p>
            </div>
          );
        })
      )}
      {getNumber < newArr?.length && (
        <p className={`text-center caption text-neu8 ${getNumber >= newArr?.length ? "cursor-not-allowed" : "cursor-pointer"}`} onClick={seeMore}>
          See more
        </p>
      )}
    </div>
  );
};
