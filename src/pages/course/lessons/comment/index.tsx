import { LikeIcon, FileAttachIcon, TimeIcon, SubmitIcon, ReplyIcon, CloseIcon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { formatTimeAgo, placeCaretAtEnd, fullName, checkSpace } from "@/services/helper";
import { AxiosAPI, AxiosClient } from "@/libs/api/axios-client";
import { useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/context/toast";
import { Spin } from "antd";
import { useAuth } from "@/hook/auth";
import Modal from "@/components/layouts/modal/template";
import LoadImage from "@/components/layouts/modal/load-image/index";

const Comment = ({ classUser }: any) => {
    const { id } = useParams();
    const { profile } = useAuth();
    const domain = import.meta.env.VITE_CMS;
    let [searchParams] = useSearchParams();
    const commentId = searchParams.get("commentId");
    const course = classUser?.course
    const idLesson: any = location.pathname.indexOf("lesson") > -1 ? id : ""
    const idQuiz: any = location.pathname.indexOf("quiz") > -1 ? id : ""

    const [commentList, setCommentList]: any = useState([])
    const [isLoadImage, setLoadImage]: any = useState({
        isLoad: false,
        img: ""
    })
    const [statusVote, setStatusVote]: any = useState()
    const [userList, setUserList]: any = useState([])
    const [reply, setReply]: any = useState({});
    const [paging, setPaging]: any = useState();
    const [loading, setLoading]: any = useState(false);
    const [isSend, setSend]: any = useState(false)
    const [uploadImg, setUploadImg]: any = useState();
    const [tempImage, setTempImage]: any = useState();
    const [reaction, setReaction]: any = useState();
    const [refreshApi, setRefeshApi]: any = useState(false);
    const [commentInput, setCommentInput]: any = useState();
    const [voteList, setVoteList]: any = useState([]);
    const [page, setPage]: any = useState(1)
    const [pageChild, setPageChild]: any = useState()
    const { fail, success }: any = useToast();
    const inputRef: any = useRef()

    useEffect(() => {
        setTimeout(() => {
            const refComment = document.getElementById(`commentid-${commentId}`)
            if (refComment) {
                refComment.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
                refComment.classList.add("ref-active-comment");
            }
        }, 500);
    }, [])

    useEffect(() => {
        if (course && (idLesson || idQuiz)) {
            callApi("")
        }
    }, [course, idLesson, idQuiz, refreshApi, page])


    const callApi = (itemParent) => {
        var number = 0
        if (itemParent) {
            number = (pageChild?.[itemParent.parent_id] || 1) + 1
        }
        const numberPage = itemParent ? number : page
        let limit = itemParent ? 2 : 5

        AxiosAPI.get(`/private/v1/e-learning/comment?sort=CREATE_DESC&limit=${limit}&page=${numberPage}` + `${idQuiz ? "&quiz_id=" + idQuiz : "&lesson_id=" + idLesson}` + `${itemParent?.parent_id !== undefined ? "&parent_id=" + itemParent.parent_id : ""}`).then((res: any) => {
            const lists = res?.data?.data?.comments || []
            const users = res?.data?.data?.users || []
            const votes = res?.data?.data?.liked_post || []
            var mergeListUser = []
            var mergeListVote = []
            mergeListUser = [...userList, ...users]
            mergeListVote = [...votes, ...voteList]

            var list = commentList;

            for (var i = 0; i < lists.length; i++) {
                if (lists[i]?.parent_id) {
                    list.map((item) => {
                        if (item.id == lists[i].parent_id) {
                            item.child = [...item.child, lists[i]]
                        }
                    });
                } else {
                    var foundIndex = list.findIndex(item => item.id === lists[i].id);
                    if (foundIndex !== -1) {
                        list[foundIndex] = lists[i];
                    } else {
                        list.push(lists[i]);
                    }
                    setPaging(res?.data?.paging)
                    setLoading(false)
                }
            }
            setCommentList(list);
            setUserList(mergeListUser);
            setVoteList(mergeListVote)
        })
    }

    const RoleImage = (role: any) => {
        if (role == "Teacher") {
            return (
                <div className="flex items-center">
                    <img className="w-[30px] md:w-[40px] relative z-[10]" src="/images/teacher-role.png"></img>
                    <p className="translate-x-[-10px] bg-neu7 px-[16px] py-[6px] rounded-tr-[20px] rounded-br-[20px] caption whitespace-nowrap">Giáo viên</p>
                </div>
            );
        }
        if (role == "Operator" || role == "Administrator") {
            return (
                <div className="flex items-center">
                    <img className="w-[30px] md:w-[40px] relative z-[10]" src="/images/support-role.png"></img>
                    <p className="translate-x-[-10px] bg-[#D1E8FF] px-[16px] py-[6px] rounded-tr-[20px] rounded-br-[20px] caption whitespace-nowrap">Trợ giảng</p>
                </div>
            );
        }
        if (role == "End User") {
            return (
                <div className="flex items-center">
                    <img className="w-[30px] md:w-[40px] relative z-[10]" src="/images/support-role.png"></img>
                    <p className="translate-x-[-10px] bg-[#D1E8FF] px-[16px] py-[6px] rounded-tr-[20px] rounded-br-[20px] caption whitespace-nowrap">Học sinh</p>
                </div>
            );
        }
    };
    function findParentId(data, childId) {
        const find = data?.find((item) => item.id == childId.parent_id)
        return find?.child?.find((elm) => elm.id == childId.id)
    }
    const getReply = (elm: any) => {
        const parent: any = findParentId(commentList, elm);
        const infoUser = userList?.find((user) => user.id == elm.user_id)
        if (elm?.child_count !== undefined) {
            setReply({
                ...reply,
                [elm.id]: {
                    status: !reply?.[elm.id]?.status,
                },
            });
            setTimeout(() => {
                var elmInput: any = document.getElementById(`input-comment-${elm.id}`)
                if (elmInput) {
                    elmInput.innerHTML = `<div><span class="text-neu8 md:body5 caption">@${fullName(infoUser)}</span><span>&nbsp;</span></div>`
                    placeCaretAtEnd(elmInput)
                }
            }, 0);
        } else {
            setReply({
                ...reply,
                [elm?.parent_id]: {
                    status: true,
                },
            });
            setTimeout(() => {
                var elmInput: any = document.getElementById(`input-comment-${elm?.parent_id}`)
                if (elmInput) {
                    elmInput.innerHTML = `<div><span class="text-neu8 md:body5 caption">@${fullName(infoUser)}</span><span>&nbsp;</span></div>`
                    placeCaretAtEnd(elmInput)
                }
            }, 0);
        }
    };
    const displayImage = () => {
        const fileInput: any = document.getElementById(`fileInput-${tempImage?.id}`);
        const files = fileInput.files;
        const convertArr = Array.from(files);

        var sizeBig = false
        convertArr?.map((elm: any) => { if (elm.size > 2000000) { sizeBig = true } })
        if (!sizeBig) {
            if (files?.length <= 3) {
                var formData: any = new FormData();
                formData.append('images', files[0]);
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
                                blob: filesArray
                            },
                        });
                    };
                    reader.readAsDataURL(elm);
                })
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
            return item !== img
        })
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

    const reactionAction = (item: any) => {
        const link = "/private/v1/e-learning/vote"
        const match = voteList?.find((elm) => elm == item.id)
        const paramDelete: any = {
            comment_id: match
        }

        if (match) {
            setStatusVote({
                [match]: !statusVote?.[match]
            })
            AxiosAPI.put(link, paramDelete).then((res: any) => { })
        } else {
            const param = {}
            param['comment_id'] = item?.id
            AxiosAPI.post(link, param).then((res: any) => {
                if (res) {
                    var newList = [...voteList]
                    newList.push(item?.id)
                    setVoteList(newList)
                    const elmCount: any = document.getElementById(`vote-count-${item.id}`)
                    if (elmCount) {
                        elmCount.innerText = parseInt(elmCount.innerText) + 1
                    }
                }
            }).catch((err) => {
                console.log(err, 'err');
                fail("Đã có lỗi, vui lòng thử lại.")
            });
        }

        setReaction({
            ...reaction,
            [item.id]: !reaction?.[item.id],
        });
    };
    const onSend = (item: any) => {
        if (!isSend) {

            const { id: idParent } = item
            var formData: any = new FormData();
            const image = uploadImg?.[item?.id || 0]?.blob
            const content = commentInput?.[item.id]?.value || ""

            if ((content && !checkSpace(content)) || image?.length > 0) {
                setSend(true)
                // formData.append('course_id', course?.id);
                content && formData.append('content', `${content?.trim()}`);
                if (image) {
                    for (var i = 0; i < image.length; i++) {
                        formData.append('images', image[i]);
                    }
                }
                idParent ? formData.append('parent_id', idParent * 1) : null
                idQuiz ? formData.append('quiz_id', idQuiz * 1) : formData.append('lesson_id', idLesson * 1)
                const link = "/private/v1/e-learning/comment"
                AxiosAPI.post(link, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }).then((res: any) => {
                    if (res?.data?.data) {
                        setTimeout(() => {
                            const elmClear = document.getElementById(`input-comment-${item.id}`)
                            elmClear.innerText = ""
                        }, 100);
                        setSend(false)
                        getInput("", item)
                        success("Gửi bình luận thành công");
                        setRefeshApi(!refreshApi)
                        setPageChild({
                            ...pageChild,
                            [item.id]: 1
                        })
                        inputRef.current.textContent = ""
                        setUploadImg({
                            ...uploadImg,
                            [item?.id || 0]: {
                                images: [],
                                blob: [],
                            },
                        });
                    } else {
                        setSend(false)
                        fail("Đã có lỗi trong quá trình tải lên, vui lòng thử lại.")
                    }
                }).catch((err) => {
                    setSend(false)
                    fail("Đã có lỗi trong quá trình tải lên, vui lòng thử lại.")
                });
            }
        }



    };
    const getInput = (val: any, item: any) => {
        const valueInput = val?.target?.innerHTML || ""
        setCommentInput({
            ...commentInput,
            [item.id]: {
                value: valueInput,
            },
        });
    };

    const returnTag = (content: any) => {
        const user = userList.find((elm) => content?.indexOf(fullName(elm)) > -1)
        let inputText = content;
        let outputStr = inputText?.replace(("@" + fullName(user)), `<span class="text-neu8">@${fullName(user)}</span>`);
        let replacedText = outputStr?.replace(/(#.*?#)/, (match) => {
            return match.replace('#', '&nbsp;');
        });

        return replacedText
    }
    const shareComment = (elm: any) => {
        const commentLink = location.origin + location.pathname + "?commentId=" + elm.id
        navigator.clipboard
            .writeText(commentLink)
            .then(() => {
                success("Đã chia sẻ");
            })
            .catch((err) => {
                fail("Lỗi khi chia sẻ");
            });
    }
    var moreList = {}
    const loadMore = (item: any) => {
        if (item) {
            setPageChild({
                ...pageChild,
                [item.parent_id]: (pageChild?.[item.parent_id] || 1) + 1
            })
            moreList = moreList[item.parent_id] = (moreList[item.parent_id] || 1) + 1
            item["page"] = moreList
            callApi(item)
        } else {
            setPage(page + 1)
            setLoading(true)
        }
    }
    const returnImage = (role: any) => {
        if (role == "End User") {
            return "/images/avt-student.png"
        } else {
            return "https://www.nea.org/sites/default/files/legacy/2020/04/new_teacher.jpeg"
        }
    }
    const CommentUI = (elm: any) => {
        const infoUser = userList?.find((user) => user.id == elm.user_id)

        const voted = statusVote?.[elm.id]

        return (
            <div id={`commentid-${elm.id}`} className="rounded-[20px] mt-[20px]">
                <div className="flex md:items-center">
                    <div className="md:w-[50px] md:h-[50px] w-[35px] h-[35px] object-cover oveflow-hidden rounded-[20px] mr-[10px] md:mr-[12px]">
                        {infoUser?.avatar ? <img src={domain + "/assets/" + infoUser?.avatar} className="rounded-[20px] object-cover md:w-[50px] md:h-[50px] w-full h-full"></img> : <img className="rounded-[20px] object-cover md:w-[50px] md:h-[50px] w-full h-full" src={returnImage(infoUser?.directus_roles?.name)} />}
                    </div>
                    <div className="hidden md:flex items-center">
                        {RoleImage(infoUser?.directus_roles?.name)}
                        <p className="text-primary1 font-bold body5 md:text-[16px]">{fullName(infoUser)}</p>
                    </div>
                    <div className="block md:hidden">
                        <p className="mb-[10px] text-primary1 mr-[6px] flex items-center rounded-[20px] md:px-[12px] cursor-pointermary1 font-bold body5 md:body1">{fullName(infoUser)}</p>
                        {RoleImage(infoUser?.directus_roles?.name)}
                    </div>
                    <div className="flex md:items-center md:mt-[0px] mt-[3px]">
                        <p className="mx-[12px] caption whitespace-nowrap">{formatTimeAgo(elm.created_time)}</p>
                        <TimeIcon className="w-[20px]"></TimeIcon>
                    </div>
                </div>
                <div className="ml-[45px] md:ml-[65px]">
                    <div className="flex items-center mt-[10px]">
                        {elm?.attach_images?.map((img) => (
                            <div onClick={() => setLoadImage({ isLoad: true, img: img })} className="cursor-pointer rounded-[12px] mr-[8px] object-cover h-[200px] w-[200px] relative wraper-img-upload">
                                <img src={img} className="h-[200px] w-[200px] object-cover rounded-[12px] image-upload" />
                            </div>
                        ))}
                    </div>
                    <p className="mt-[6px]" dangerouslySetInnerHTML={{ __html: returnTag(elm.content) }}></p>
                    <div className="w-fit flex items-center mt-[12px]">
                        {/* <div
                            onClick={() => reactionAction(elm)}
                            className={`${voted ? "bg-neu8 text-white border-[1px] border-neu8" : "bg-white border-[1px] border-neu1 text-black"
                                } py-[6px] mr-[6px] flex items-center rounded-[20px] px-[12px] cursor-pointer`}
                        >
                            <p className="caption mr-[10px]" id={`vote-count-${elm.id}`}>{elm.vote_count}</p>
                            <LikeIcon fill={voted ? "white" : "black"}></LikeIcon>
                        </div> */}
                        <div onClick={() => getReply(elm)} className="bg-neu5 text-white py-[6px] mr-[4px] flex items-center rounded-[20px] px-[12px] cursor-pointer">
                            <p className="caption mr-[10px] text-black">Trả lời</p>
                            <ReplyIcon></ReplyIcon>
                        </div>
                        <div onClick={() => shareComment(elm)} className="bg-neu5 text-white py-[6px] mr-[4px] flex items-center rounded-[20px] px-[12px] cursor-pointer">
                            <p className="caption mr-[8px] text-black">Chia sẻ</p>
                            <SubmitIcon fill="#374957" className={`w-[12px]`}></SubmitIcon>
                        </div>
                    </div>
                    {elm?.child?.sort((a: any, b: any) => b.created_time - a.created_time)?.map((item: any, indexItem: any) => (
                        <div>
                            {CommentUI(item)}
                            {indexItem + 1 == elm?.child?.length && elm.child_count > elm?.child?.length && <div onClick={() => loadMore(item)} className="px-[16px] py-[2px] bg-neu4 w-fit rounded-[20px] my-[20px] caption cursor-pointer">Xem thêm phản hồi</div>}
                        </div>
                    ))}

                    {reply?.[elm.id]?.status && CommentInput(elm)}
                </div>
            </div>
        )
    }

    const triggerCall = (item: any) => {
        const id = item?.id || 0
        const elment = document.getElementById(`on-send-${id}`)
        if (elment) {
            setTimeout(() => {
                elment.click()
            }, 100);
        }
    }

    const CommentInput = (elm: any) => {
        if (!elm?.id) elm = { id: 0 };
        return (
            <div>
                <div className="mt-[20px] flex items-center">
                    <div>
                        <div className="md:w-[50px] md:h-[50px] w-[35px] h-[35px] object-cover oveflow-hidden rounded-[20px] md:mr-[12px] mr-[6px]">
                            {profile?.avatar ? <img src={domain + "/assets/" + profile?.avatar} className="rounded-[20px] object-cover md:w-[50px] md:h-[50px] w-full h-full"></img> : <img src="/images/avt-student.png" className="md:mr-[12px] mr-[6px] md:w-[50px] md:h-[50px] w-full h-full"></img>}
                        </div>
                    </div>
                    <div className="relative w-full md:w-[90%] overflow-hidden">
                        <div
                            ref={inputRef}
                            onInput={(e: any) => getInput(e, elm)}
                            contentEditable
                            id={`input-comment-${elm?.id}`}
                            className="input-comment min-h-[50px] block md:ml-[12px] md:ml-[6px] bg-neu5 pl-[12px] md:pr-[120px] pr-[90px] pt-[12px] pb-[8px] rounded-[8px]"
                        ></div>
                        <input accept="image/*" multiple onChange={displayImage} type="file" id={`fileInput-${elm?.id}`} className="hidden" />
                        <div className="mt-[8px] flex absolute right-[10px] top-[0px]">
                            <div
                                onClick={() => setOpenFolder(elm)}
                                className=" w-fit cursor-pointer bg-white px-[10px] md:px-[14px] py-[2px] rounded-[8px] mr-[6px]"
                                style={{ boxShadow: "0px 2px 10px 0px rgba(0, 70, 251, 0.20)" }}
                            >
                                <FileAttachIcon className="w-[14px] md:w-[18px]"></FileAttachIcon>
                            </div>
                            <div
                                onClick={() => triggerCall(elm)}
                                className=" cursor-pointer w-fit bg-primary1 px-[11px] md:px-[13px] py-[5px] rounded-[9px]"
                                style={{ boxShadow: "0px 2px 10px 0px rgba(0, 70, 251, 0.20)" }}
                            >
                                <SubmitIcon className={`w-[12px] md:w-[18px] ${isSend ? "opacity-[0.5]" : "opacity-[1]"}`}></SubmitIcon>
                            </div>
                            <div onClick={() => onSend(elm)} id={`on-send-${elm.id || 0}`}></div>

                        </div>
                    </div>
                </div>
                <div className="flex items-center ml-[63px] mt-[10px]">
                    {uploadImg?.[elm.id]?.images?.map((img) => (
                        <div className="rounded-[12px] mr-[8px] object-cover h-[80px] w-[80px] relative wraper-img-upload">
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
        <div className="w-full">
            <Modal open={isLoadImage?.isLoad}>
                <LoadImage
                    img={isLoadImage?.img}
                    onClose={() => {
                        setLoadImage({ isLoad: false });
                    }}
                />
            </Modal>
            {/* <div className="flex items-center w-full">
                <div className="bg-[#D1E8FF] w-fit px-[12px] py-[2px] rounded-[8px] font-bold mr-[6px]">
                    <p>200+ bình luận</p>
                </div>
                <div className="bg-neu8 text-white py-[6px] mr-[6px] flex items-center rounded-[20px] px-[12px] cursor-pointer">
                    <p className="caption mr-[10px]">100</p>
                    <LikeIcon></LikeIcon>
                </div>
            </div> */}
            {CommentInput("")}
            {commentList?.sort((a: any, b: any) => b.created_time - a.created_time)
                ?.map((elm: any, index: any) => {
                    return (
                        <div key={index}>
                            {CommentUI(elm)}
                        </div>
                    )
                }
                )}
            <div id="load-more" className="my-[60px]">
                {loading && <div className="text-center mx-auto w-full h-[30px]"><Spin></Spin></div>}
                {commentList?.length < paging?.total_count && !loading && <p className="h-[30px] text-center mt-[20px] text-neu8 cursor-pointer" onClick={() => loadMore("")}>Xem thêm</p>}
            </div>
        </div>
    );
};
export default Comment;