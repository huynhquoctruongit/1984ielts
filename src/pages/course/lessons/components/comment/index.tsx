import { LikeIcon, FileAttachIcon, TimeIcon, SubmitCommentIcon, ReplyIcon, CloseIcon, TeacherRoleIcon, SupportRoleIcon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { formatTimeAgo, placeCaretAtEnd, fullName, checkSpace } from "@/services/helper";
import { AxiosAPI } from "@/libs/api/axios-client";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/context/toast";
import { Spin } from "antd";
import { useAuth } from "@/hook/auth";
import Modal from "@/components/layouts/modal/template";
import LoadImage from "@/components/layouts/modal/load-image/index";
import { AnimatePresence, motion } from "framer-motion";
import useSWR from "swr";
import { tabContentVariants } from "@/services/motion";

const Comment = ({ data, classUser }: any) => {
  const { id } = useParams();
  const { profile } = useAuth();
  const domain = import.meta.env.VITE_CMS;
  let [searchParams] = useSearchParams();
  const commentId = searchParams.get("commentId");
  const course = classUser?.course;

  const idLesson: any = location.pathname.indexOf("lesson") > -1 ? id : "";
  const idQuiz: any = location.pathname.indexOf("quiz") > -1 ? id : "";

  const [commentList, setCommentList]: any = useState([]);
  const [isLoadImage, setLoadImage]: any = useState({
    isLoad: false,
    img: "",
  });
  const [userList, setUserList]: any = useState([]);
  const [reply, setReply]: any = useState({});
  const [paging, setPaging]: any = useState();
  const [loading, setLoading]: any = useState(false);
  const [isSend, setSend]: any = useState(false);
  const [uploadImg, setUploadImg]: any = useState();
  const [tempImage, setTempImage]: any = useState();
  const [reaction, setReaction]: any = useState();
  const [refreshApi, setRefeshApi]: any = useState(false);
  const [commentInput, setCommentInput]: any = useState();
  const [voteList, setVoteList]: any = useState([]);
  const [page, setPage]: any = useState(1);
  const [pageChild, setPageChild]: any = useState();
  const { fail, success }: any = useToast();
  const [totalComment, setTotalComment]: any = useState(0);
  const [pinList, setPinList]: any = useState([]);

  const inputRef: any = useRef();

  const paramsVote = {
    filter: {
      quiz_id: idQuiz ? { _eq: idQuiz } : undefined,
      lesson_id: idLesson ? { _eq: idLesson } : undefined,
      user_id: { _eq: "$CURRENT_USER" },
    },
  };
  const { data: voteTrans } = useSWR([`/items/vote_transaction`, paramsVote]);
  const voteTransaction = voteTrans?.data?.data;
  const getLastVote = voteTransaction && voteTransaction[voteTransaction.length - 1];
  const isVoteUser = !getLastVote || getLastVote?.status == 0 ? false : true;
  const [voteByUser, setVoteByUser]: any = useState(isVoteUser);

  useEffect(() => {
    setVoteByUser(isVoteUser);
  }, [isVoteUser]);
  const callPinList = (item: any) => {
    const { numberPage } = returnPage(item);
    if (item?.parent_id !== undefined) {
      AxiosAPI.get(`/v1/e-learning/comment?sort=CREATE_DESC&limit=${2}&page=${numberPage}` + `${item?.parent_id !== undefined ? "&parent_id=" + item.parent_id : ""}`).then(
        (res) => {
          var listRes = res?.data?.data?.comments || [];
          const users = res?.data?.data?.users || [];
          const votes = res?.data?.data?.liked_post || [];
          var mergeListUser = [];
          var mergeListVote = [];
          mergeListUser = [...userList, ...users];
          mergeListVote = [...votes, ...voteList];
          var listDefault = [...pinList];

          for (var i = 0; i < listRes.length; i++) {
            if (listRes[i]?.parent_id) {
              listDefault.map((item: any) => {
                if (item.id == listRes[i].parent_id) {
                  item.child = [...item.child, listRes[i]];
                }
              });
            }
          }
          setPinList(listDefault);
          setUserList(mergeListUser);
          setVoteList(mergeListVote);
        },
      );
    } else {
      AxiosAPI.get(
        `/v1/e-learning/comment/pinned?limit=2${idQuiz ? "&quiz_id=" + idQuiz : "&lesson_id=" + idLesson}&page=${numberPage}` +
          `${item?.parent_id !== undefined ? "&parent_id=" + item.parent_id : ""}`,
      ).then((res) => {
        setPinList(res?.data?.data?.comments);
      });
    }
  };
  useEffect(() => {
    callPinList("");
  }, []);
  useEffect(() => {
    setTimeout(() => {
      const refComment = document.getElementById(`commentid-${commentId}`);
      if (refComment) {
        refComment.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        refComment.classList.add("ref-active-comment");
      }
    }, 500);
  }, []);

  useEffect(() => {
    if (idLesson || idQuiz) {
      callApi("");
    }
  }, [idLesson, idQuiz, refreshApi, page]);
  const returnPage = (item: any) => {
    var number = 0;
    if (item) {
      number = (pageChild?.[item.parent_id] || 1) + 1;
    }
    const numberPage = item ? number : page;
    let limit = item ? 2 : 10;
    return {
      numberPage: numberPage,
      limit: limit,
    };
  };
  const callApi = (dataItem: any) => {
    const { limit, numberPage } = returnPage(dataItem);

    AxiosAPI.get(
      `/v1/e-learning/comment?sort=CREATE_DESC&limit=${limit}&page=${numberPage}` +
        `${idQuiz ? "&quiz_id=" + idQuiz : "&lesson_id=" + idLesson}` +
        `${dataItem?.parent_id !== undefined ? "&parent_id=" + dataItem.parent_id : ""}`,
    ).then((res: any) => {
      const lists = res?.data?.data?.comments || [];
      const users = res?.data?.data?.users || [];
      const votes = res?.data?.data?.liked_post || [];
      const total_comment = res?.data?.data?.total_comment || 0;
      var mergeListUser: any = [];
      var mergeListVote: any = [];
      mergeListUser = [...userList, ...users];
      mergeListVote = [...votes, ...voteList];

      var list = commentList;

      for (var i = 0; i < lists.length; i++) {
        if (lists[i]?.parent_id) {
          list.map((item) => {
            if (item.id == lists[i].parent_id) {
              item.child = [...item.child, lists[i]];
            }
          });
        } else {
          var foundIndex = list.findIndex((item) => item.id === lists[i].id);
          if (foundIndex !== -1) {
            list[foundIndex] = lists[i];
          } else {
            list.push(lists[i]);
          }
          setPaging(res?.data?.paging);
          setLoading(false);
        }
      }
      if (total_comment) {
        setTotalComment(total_comment);
      }
      setCommentList(list);
      setUserList(mergeListUser);
      setVoteList(mergeListVote);
    });
  };

  const RoleImage = (role: any) => {
    if (role == "Teacher") {
      return (
        <div className="ml-[4px] flex items-center gradient-bg-primary1 px-[16px] py-[6px] rounded-[20px]">
          <TeacherRoleIcon />
          <p className="caption whitespace-nowrap text-white ml-[3px]">Giáo viên</p>
        </div>
      );
    }
    if (role == "Operator" || role == "Administrator") {
      return (
        <div className="ml-[4px] flex items-center bg-[#178CFF33] border-[1px] border-[#007AFF] px-[16px] py-[6px] rounded-[20px]">
          <SupportRoleIcon />
          <p className="caption whitespace-nowrap text-[#007AFF] ml-[3px]">Trợ giảng</p>
        </div>
      );
    }
  };

  const getReply = (elm: any) => {
    const infoUser = userList?.find((user) => user.id == elm.user_id);
    if (elm?.child_count !== undefined) {
      setReply({
        ...reply,
        [elm.id]: {
          status: !reply?.[elm.id]?.status,
        },
      });
      setTimeout(() => {
        var elmInput: any = document.getElementById(`input-comment-${elm.id}`);
        if (elmInput) {
          elmInput.innerHTML = `<div><span class="text-neu8 md:body5 caption">@${fullName(infoUser) || "No name"}</span><span>&nbsp;</span></div>`;
          placeCaretAtEnd(elmInput);
        }
      }, 0);
    } else {
      setReply({
        ...reply,
        [elm.parent_id]: {
          status: true,
        },
      });
      setTimeout(() => {
        var elmInput: any = document.getElementById(`input-comment-${elm?.parent_id}`);
        if (elmInput) {
          elmInput.innerHTML = `<div><span class="text-neu8 md:body5 caption">@${fullName(infoUser) || "No name"}</span><span>&nbsp;</span></div>`;
          placeCaretAtEnd(elmInput);
        }
      }, 0);
    }
  };
  const displayImage = () => {
    const fileInput: any = document.getElementById(`fileInput-${tempImage?.id}`);
    const files = fileInput.files;
    const convertArr = Array.from(files);

    var sizeBig = false;
    convertArr?.map((elm: any) => {
      if (elm.size > 2000000) {
        sizeBig = true;
      }
    });
    if (!sizeBig) {
      if (files?.length <= 3) {
        var formData: any = new FormData();
        formData.append("images", files[0]);
        const filesArray: any = Array.from(files);
        const imagesArray = [];
        filesArray?.map((elm) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            imagesArray.push(e.target.result);
            setUploadImg({
              ...uploadImg,
              [tempImage?.id]: {
                images: imagesArray,
                blob: filesArray,
              },
            });
          };
          reader.readAsDataURL(elm);
        });
      } else {
        fail("Chỉ được phép tải lên nhiều nhất là 3 hình");
      }
    } else {
      fail("File upload quá lớn, vui lòng upload file dưới 2mb");
    }
  };
  function clearImage(elm: any, img: any) {
    const cloneObj = { ...uploadImg };
    var deleteArr = cloneObj[elm].images.filter(function (item) {
      return item !== img;
    });
    setUploadImg({
      ...uploadImg,
      [elm]: {
        images: deleteArr,
      },
    });
  }
  const setOpenFolder = (elm: any) => {
    setTempImage(elm);
    document.getElementById(`fileInput-${elm?.id}`).click();
  };
  const reactionAction = (item: any, vote: any) => {
    const link = "/v1/e-learning/vote";
    if (vote) {
      const paramDelete: any = {
        comment_id: vote,
      };
      var arr = voteList;
      arr = arr.filter(function (item) {
        return item !== vote;
      });
      const numberCount: any = document.getElementById(`vote-count-${item.id}`);
      numberCount.innerText = parseInt(numberCount.innerText) - 1;

      setVoteList(arr);
      AxiosAPI.put(link, paramDelete).then((res: any) => {});
    } else {
      const param = {};
      param["comment_id"] = item?.id;
      AxiosAPI.post(link, param)
        .then((res: any) => {
          if (res) {
            var newList = [...voteList];
            newList.push(item?.id);
            setVoteList(newList);
            const elmCount: any = document.getElementById(`vote-count-${item.id}`);
            if (elmCount) {
              elmCount.innerText = parseInt(elmCount.innerText) + 1;
            }
          }
        })
        .catch((err) => {
          fail("Đã có lỗi, vui lòng thử lại.");
        });
    }

    setReaction({
      ...reaction,
      [item.id]: !reaction?.[item.id],
    });
  };
  const onSend = (item: any) => {
    if (!isSend) {
      const { id: idParent } = item;
      var formData: any = new FormData();
      const image = uploadImg?.[item?.id || 0]?.blob;
      const content = commentInput?.[item.id]?.value || "";

      if ((content && !checkSpace(content)) || image?.length > 0) {
        setSend(true);
        content && formData.append("content", `${content?.trim()?.replaceAll("<div><br></div>", "")?.replaceAll("<div><span><br></span></div>", "")}`);
        if (image) {
          for (var i = 0; i < image.length; i++) {
            formData.append("images", image[i]);
          }
        }
        idParent ? formData.append("parent_id", idParent * 1) : null;
        idQuiz ? formData.append("quiz_id", idQuiz * 1) : formData.append("lesson_id", idLesson * 1);
        const link = "/v1/e-learning/comment";
        AxiosAPI.post(link, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
          .then((res: any) => {
            if (res?.data?.data) {
              setTimeout(() => {
                const elmClear = document.getElementById(`input-comment-${item.id}`);
                elmClear.innerText = "";
              }, 100);
              setSend(false);
              getInput("", item);
              success("Gửi bình luận thành công");
              setTimeout(() => {
                const elmComment = document.getElementById(`commentid-${res?.data?.data?.id}`);
                elmComment.classList.add("active-comment");
              }, 300);

              if (item?.is_pinned) {
                callPinList("");
              } else {
                setRefeshApi(!refreshApi);
              }
              setPageChild({
                ...pageChild,
                [item.id]: 1,
              });
              inputRef.current.textContent = "";
              setUploadImg({
                ...uploadImg,
                [item?.id || 0]: {
                  images: [],
                  blob: [],
                },
              });
            } else {
              setSend(false);
              fail("Đã có lỗi trong quá trình tải lên, vui lòng thử lại.");
            }
          })
          .catch((err) => {
            setSend(false);
            fail("Đã có lỗi trong quá trình tải lên, vui lòng thử lại.");
          });
      }
    }
  };
  const getInput = (val: any, item: any) => {
    const valueInput = val?.target?.innerHTML || "";
    setCommentInput({
      ...commentInput,
      [item.id]: {
        value: valueInput,
      },
    });
  };

  const returnTag = (content: any) => {
    const user = userList.find((elm) => content?.indexOf(fullName(elm)) > -1);
    let inputText = content;
    let outputStr = inputText?.replace("@" + fullName(user), `<span class="text-neu8">@${fullName(user)}</span>`);
    let replacedText = outputStr?.replace(/(#.*?#)/, (match) => {
      return match.replace("#", "&nbsp;");
    });

    return replacedText;
  };

  var moreList = {};
  const loadMore = (item: any = [], parent: any = {}) => {
    if (item?.id) {
      setPageChild({
        ...pageChild,
        [item.parent_id]: (pageChild?.[item.parent_id] || 1) + 1,
      });
      moreList = moreList[item.parent_id] = (moreList[item.parent_id] || 1) + 1;
      item["page"] = moreList;
      if (parent?.is_pinned) {
        callPinList(item);
      } else {
        callApi(item);
      }
    } else {
      setPage(page + 1);
      setLoading(true);
    }
  };
  const returnImage = (role: any) => {
    if (role == "End User") {
      return "/images/avt-student.png";
    } else {
      return "https://www.nea.org/sites/default/files/legacy/2020/04/new_teacher.jpeg";
    }
  };

  const onPin = (item, type) => {
    const params = {};
    idQuiz ? (params["quiz_id"] = idQuiz) : (params["lesson_id"] = idLesson);
    const link = `/v1/e-learning/comment/${item.id}/pin`;
    if (type == "pin") {
      if (pinList?.length == 2) {
        fail("Vượt quá số lượng pin cho phép");
      } else {
        AxiosAPI.post(link, params)
          .then((res: any) => {
            if (res?.data?.error_detail) {
              fail(res?.data?.message);
            } else {
              success("Đã ghim bình luận");
              callPinList("");
            }
          })
          .catch((err) => {
            fail("Đã có lỗi xảy ra, vui lòng thử lại.");
          });
      }
    } else {
      AxiosAPI.put(link, params)
        .then((res: any) => {
          if (res?.data?.error_detail) {
            fail(res?.data?.message);
          } else {
            success("Đã bỏ ghim bình luận");
            callPinList("");
          }
        })
        .catch((err) => {
          fail("Đã có lỗi xảy ra, vui lòng thử lại.");
        });
    }
  };
  const CommentUI = (elm: any, type: any) => {
    const infoUser = userList?.find((user) => user.id == elm.user_id);
    const voted = voteList?.find((item: any) => item == elm.id);
    return (
      <AnimatePresence key={`id-${elm.id}`} mode="wait">
        <motion.div
          key={"animation"}
          variants={tabContentVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="h-full"
          transition={{
            duration: 0.5,
          }}
        >
          <div id={`commentid-${elm.id}${type == "pin" ? "-pin" : ""}`} className={`${type + "-comment"} mt-[17px] relative`}>
            <div className={`${elm?.child_count != undefined ? "wrap-comment" : ""} flex items-center justify-between`}>
              <div className="flex md:items-center">
                <div className="md:w-[50px] md:h-[50px] w-[35px] h-[35px] object-cover oveflow-hidden rounded-[20px] mr-[10px] md:mr-[12px]">
                  {infoUser?.avatar ? (
                    <img src={domain + "/assets/" + infoUser?.avatar} className="rounded-[20px] object-cover md:w-[50px] md:h-[50px] w-full h-full"></img>
                  ) : (
                    <img className="rounded-[20px] object-cover md:w-[50px] md:h-[50px] w-full h-full" src={returnImage(infoUser?.directus_roles?.name)} />
                  )}
                </div>
                <div className="flex items-center">
                  <p className="text-primary1 mr-[4px] body5 md:text-[16px]">{fullName(infoUser) || "No name"}</p>
                  {RoleImage(infoUser?.directus_roles?.name)}
                </div>
              </div>
            </div>
            <div className="ml-[45px] md:ml-[65px] md:mt-0 mt-[8px]">
              {elm?.attach_images?.length ? (
                <div className={`p-[20px] rounded-[8px] grid grid-cols-3 gap-[20px] ${type == "pin" && "bg-[#007AFF1A]"}`}>
                  {elm?.attach_images?.map((img, index) => (
                    <div key={img + "index" + index}>
                      <div
                        onClick={() => setLoadImage({ isLoad: true, img: img })}
                        className="cursor-pointer rounded-[12px] mr-[8px] object-cover w-full h-full relative wraper-img-upload"
                      >
                        <img src={img} className="w-full h-full object-cover rounded-[12px] image-upload" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                ""
              )}
              {returnTag(elm.content) && (
                <p
                  className={`mt-[8px] p-[16px] rounded-[8px] max-h-[400px] overflow-y-auto leading-[18px] ${type === "pin" ? "bg-[#007AFF1A]" : "bg-[#F2F2F7]"}`}
                  dangerouslySetInnerHTML={{ __html: returnTag(elm.content) }}
                ></p>
              )}
              <div className="w-fit flex items-center mt-[12px]">
                <div className="flex md:items-center">
                  <p className="caption whitespace-nowrap text-[#3C3C4399] mr-[16px]">{formatTimeAgo(elm.created_time)}</p>
                </div>
                <div onClick={() => reactionAction(elm, voted)} className={`mr-[16px] flex items-center cursor-pointer`}>
                  <LikeIcon fill={voted ? "#007AFF" : "#3C3C4399"}></LikeIcon>
                  <p className={`caption ml-[8px] ${voted ? "text-[#007AFF]" : "text-[#3C3C4399]"}`} id={`vote-count-${elm.id}`}>
                    {elm.vote_count}
                  </p>
                </div>
                <div onClick={() => getReply(elm)} className="mr-[4px] flex items-center cursor-pointer">
                  <p className="caption mr-[10px] text-[#3C3C4399]">Trả lời</p>
                </div>
                {profile?.role?.name !== "End User" && (type == "parent" || type == "pin") && (
                  <div className="mr-[4px] flex items-center cursor-pointer">
                    <p className="caption mr-[10px]">
                      {type == "pin" ? (
                        <span className="text-[#007AFF]" onClick={() => onPin(elm, "unpin")}>
                          Bỏ ghim bình luận
                        </span>
                      ) : (
                        <span className="text-[#3C3C4399]" onClick={() => onPin(elm, "pin")}>
                          Ghim bình luận
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
              {elm?.child
                ?.sort((a: any, b: any) => b.created_time - a.created_time)
                ?.map((item: any, indexItem: any) => (
                  <div key={indexItem + "hihi"}>
                    {CommentUI(item, "child")}
                    {indexItem + 1 == elm?.child?.length && elm.child_count > elm?.child?.length && (
                      <div
                        onClick={() => loadMore(item, elm)}
                        className="px-[16px] py-[4px] bg-neu4 w-fit rounded-[20px] my-[20px] body2 text-[#3C3C4399] cursor-pointer flex items-center"
                      >
                        <p className="mr-[8px]">Xem thêm phản hồi</p>
                        <ReplyIcon />
                      </div>
                    )}
                  </div>
                ))}

              {reply?.[elm.id]?.status && CommentInput(elm)}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };
  const triggerCall = (item: any) => {
    const id = item?.id || 0;
    const elment = document.getElementById(`on-send-${id}`);
    if (elment) {
      setTimeout(() => {
        elment.click();
      }, 100);
    }
  };
  const onVote = () => {
    setVoteByUser(!voteByUser);
    const link = "/v1/e-learning/vote";
    const param: any = {};
    var voteElm: any = document.getElementById("vote-all");
    idQuiz ? (param["quiz_id"] = idQuiz * 1) : (param["lesson_id"] = idLesson * 1);
    if (voteByUser) {
      voteElm.innerText = parseInt(voteElm.innerText) - 1;
      AxiosAPI.put(link, param).then((res: any) => {});
    } else {
      voteElm.innerText = parseInt(voteElm.innerText) + 1;
      AxiosAPI.post(link, param).then((res: any) => {});
    }
  };

  const CommentInput = (elm: any) => {
    if (!elm?.id) elm = { id: 0 };

    return (
      <div>
        <div className="mt-[20px] flex items-center">
          <div>
            <div className="md:w-[50px] md:h-[50px] w-[35px] h-[35px] object-cover oveflow-hidden rounded-[20px] md:mr-[12px] mr-[6px]">
              {profile?.avatar ? (
                <img src={domain + "/assets/" + profile?.avatar} className="rounded-[20px] object-cover md:w-[50px] md:h-[50px] w-full h-full"></img>
              ) : (
                <img src={returnImage(profile?.role?.name)} className="rounded-[20px] object-cover md:mr-[12px] mr-[6px] md:w-[50px] md:h-[50px] w-full h-full"></img>
              )}
            </div>
          </div>
          <div className="relative w-full overflow-hidden wrapper-input-comment">
            <div
              ref={inputRef}
              onInput={(e: any) => getInput(e, elm)}
              contentEditable
              id={`input-comment-${elm?.id}`}
              className="input-comment min-h-[50px] block md:ml-[12px] md:ml-[6px] bg-[#F2F2F7] pl-[16px] md:pr-[120px] pr-[90px] pt-[15px] pb-[8px] rounded-[25px] leading-[18px]"
            ></div>
            <input accept="image/*" multiple onChange={displayImage} type="file" id={`fileInput-${elm?.id}`} className="hidden" />
            <div className="h-full flex items-end absolute justify-end right-[10px] top-[-13px] mr-[10px]">
              <div onClick={() => setOpenFolder(elm)} className="mr-[12px] cursor-pointer md:mb-0 mb-[4px]">
                <FileAttachIcon fill="#3C3C4399" className="active-hover w-[15px] h-[15px] md:w-[20px] md:h-[20px]"></FileAttachIcon>
              </div>
              <div onClick={() => triggerCall(elm)} className="cursor-pointer">
                <SubmitCommentIcon
                  fill="#3C3C4399"
                  className={`active-hover w-[18px] h-[18px] md:w-[22px] h-[22px] ${isSend ? "opacity-[0.5] cursor-not-allowed" : "opacity-[1] cursor-pointer"}`}
                ></SubmitCommentIcon>
              </div>
              <div onClick={() => onSend(elm)} id={`on-send-${elm.id || 0}`}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center ml-[63px] mt-[10px]">
          {uploadImg?.[elm.id]?.images?.map((img) => (
            <div key={"please-enter-key" + img} className="rounded-[12px] mr-[8px] object-cover h-[80px] w-[80px] relative wraper-img-upload">
              <div
                onClick={() => clearImage(elm.id, img)}
                style={{
                  boxShadow: "0px 2px 10px 0px rgba(0, 70, 251, 0.40)",
                }}
                id="close-icon"
                className="icon-close-image p-[4px] bg-white w-[20px] h-[20px] rounded-full cursor-pointer absolute flex items-center justify-center right-[5px] top-[5px] z-[111] box-shadow"
              >
                <CloseIcon fill="black" className="w-[10px] h-[10px]" />
              </div>
              <img src={img} className="h-[80px] w-[80px] object-cover rounded-[12px] image-upload" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full mt-[30px]">
      <p className="h5 text-neutral-01 mb-[20px]">Bình luận</p>
      <Modal open={isLoadImage?.isLoad}>
        <LoadImage
          img={isLoadImage?.img}
          onClose={() => {
            setLoadImage({ isLoad: false });
          }}
        />
      </Modal>
      <div className="flex items-center w-full">
        <div className="bg-[#007AFF1A] w-fit px-[8px] py-[6px] rounded-[8px] mr-[6px]">
          <p className="caption">{totalComment || 0} bình luận</p>
        </div>
        <div
          onClick={() => onVote()}
          className={`${
            voteByUser ? "bg-neu8 text-white border-[1px] border-neu8" : "border-neu1 border-[1px] text-black"
          } py-[5px] mr-[6px] flex items-center rounded-[20px] px-[8px] cursor-pointer`}
        >
          <p id="vote-all" className={`caption mr-[6px] pt-[2px] ${voteByUser ? "text-white" : "text-[#3C3C4399]"}`}>
            {data?.vote_count}
          </p>
          <LikeIcon className="w-[13px] h-[13px]" fill={voteByUser ? "white" : "#3C3C4399"}></LikeIcon>
        </div>
      </div>
      {CommentInput("")}
      {pinList?.map((elm, index) => (
        <div key={index + "pin-" + elm.id}>{CommentUI(elm, "pin")}</div>
      ))}
      {commentList
        ?.sort((a: any, b: any) => b.created_time - a.created_time)
        ?.map((elm: any, index: any) => {
          if (elm.is_pinned) return;
          const isHidden = pinList?.find((item) => item.id == elm.id);
          if (isHidden) return;
          return <div key={index + "cmt-" + elm.id}>{CommentUI(elm, "parent")}</div>;
        })}
      <div id="load-more" className="my-[60px]">
        {loading && (
          <div className="text-center mx-auto w-full h-[30px]">
            <Spin></Spin>
          </div>
        )}
        {commentList?.length < paging?.total_count && !loading && (
          <p className="h-[30px] text-center mt-[20px] text-neu8 cursor-pointer" onClick={() => loadMore("")}>
            Xem thêm
          </p>
        )}
      </div>
    </div>
  );
};
export default Comment;
