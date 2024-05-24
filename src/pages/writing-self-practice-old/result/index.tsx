import { useState, useEffect } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import { Tabs, Tab, Card, CardBody, Tooltip } from "@nextui-org/react";
import { Link, useParams } from "react-router-dom";
import Modal from "@/components/layouts/modal/template";
import FullPage from "@/components/layouts/modal/full-page/index";
import { FullPageIcon, CopyIcon } from "@/components/icons/svg";
import axiosClient, { fetcherClient } from "@/libs/api/axios-client.ts";
import { useToast } from "@/context/toast";
import { AnimatePresence, Variants, motion } from "framer-motion";
import { tabContentVariants } from "@/services/motion";
import * as diff from "diff";

const Result = () => {
  const { classId, courseId, sectionId, quizId, answerId }: any = useParams();
  const [answerList, setAnwserList]: any = useState({});
  const [isFullPage, setFullPage]: any = useState(false);
  const [dataChatGPT, setChatGPT]: any = useState({});
  const [activeTab, setActiveTab]: any = useState("grammar");
  const [diffList, setDiff] = useState([]);
  const { fail, success }: any = useToast();

  const styles = {
    added: {
      color: "green",
      backgroundColor: "#b5efdb",
    },
    removed: {
      color: "red",
      backgroundColor: "#fec4c0",
      textDecoration: "line-through",
      margin: "0 4px 0 0",
    },
  };
  const getLink = `/class/${classId}/course/${courseId}/section/${sectionId}/writing-self-practice/${quizId}`;

  useEffect(() => {
    axiosClient.get(`items/answer?limit=1&filter[quiz].id=${quizId}&filter[id]=${answerId}&fields=*,user_created.*,review.*&sort=-date_created`).then((res: any) => {
      setAnwserList(res?.data?.data?.[0] || []);

      const data = res?.data?.data?.[0];
      const list = data.chatgpt[0];

      var listResult = {
        answer: data.writing[0].answer,
        grammar: "",
        improvement: "",
        vocabulary: "",
        vocabularyNew: "",
      };
      list?.map((elm) => {
        listResult[elm.output_type] = elm.result;
      });

      var modifiedText = listResult?.vocabulary?.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      var newObject = { ...listResult };
      newObject.vocabularyNew = modifiedText;
      setChatGPT(newObject);
    });
  }, []);
  useEffect(() => {
    var string1 = dataChatGPT?.answer || "";
    var string2 = dataChatGPT?.[activeTab] || "";
    if (activeTab == "improvement") {
      string1 = dataChatGPT?.grammar || "";
    }
    var groups = diff.diffWordsWithSpace(string1, string2);
    const mappedNodes = groups.map((group) => {
      let { value, added, removed }: any = group;
      if ((added || removed) && !/\S/.test(value)) {
        const linebreaks = value.match(/(\r\n|\r|\n)/g);
        if (linebreaks) {
          if (removed) value = `\u00b6`.repeat(0);
          // if (added) value = `\u00b6\n`.repeat(linebreaks.length);
        }
      }
      let nodeStyles;
      if (added) nodeStyles = styles.added;
      if (removed) nodeStyles = styles.removed;
      return <span style={nodeStyles}>{value}</span>;
    });

    setDiff(mappedNodes);
  }, [dataChatGPT, activeTab]);

  const getTab = (active: any) => {
    switch (active) {
      case "grammar":
        return "Grammar Correction";
        break;
      case "improvement":
        return "Improvement";
        break;
      case "vocabulary":
        return "Vocabulary";
        break;
      default:
        return "grammar";
        break;
    }
  };
  const copyFunc = () => {
    var content = "";
    if (activeTab == "grammar") {
      content = dataChatGPT?.grammar;
    } else if (activeTab == "improvement") {
      content = dataChatGPT?.improvement;
    } else if (activeTab == "vocabulary") {
      content = dataChatGPT?.vocabulary?.replaceAll("**", "");
    }
    navigator.clipboard
      .writeText(content)
      .then(() => {
        success("Đã sao chép");
      })
      .catch((err) => {
        fail("Lỗi khi sao chép");
      });
  };
  const closeScreen = () => {
    window.close();
  };
  console.log(activeTab, "activeTab");

  return (
    <div className="h-[calc(100%-56px)]" id="wrap-parent">
      <div id="child-2 h-full">
        <div className="my-[20px]">
          <p className="body1 mb-[20px]">Writing Revision</p>
          <div className="flex md:justify-start justify-between">
            <Tooltip
              size="md"
              showArrow={true}
              color="default"
              className="p-[10px]"
              content={
                <div>
                  <p>CHỈ sửa lỗi grammar</p> <p>KHÔNG sửa lỗi word choice</p>
                </div>
              }
            >
              <div
                onClick={() => setActiveTab("grammar")}
                className={`bg-neu1 text-white px-[20px] py-[5px] rounded-tl-[8px] rounded-tr-[8px] caption flex items-center justify-center md:body2 mr-[6px] cursor-pointer ${
                  activeTab == "grammar" && "active-tab-writing"
                }`}
              >
                Grammar Correction
              </div>
            </Tooltip>
            <Tooltip
              showArrow={true}
              size="md"
              color="default"
              className="p-[10px]"
              content={
                <div>
                  <p>Sửa lỗi hoặc nâng cấp word choice, dựa trên bài đã sửa grammar</p>
                </div>
              }
            >
              <div
                onClick={() => setActiveTab("improvement")}
                className={`bg-neu1 text-white px-[20px] py-[5px] rounded-tl-[8px] rounded-tr-[8px] caption flex items-center justify-center md:body2 mr-[6px] cursor-pointer ${
                  activeTab == "improvement" && "active-tab-writing"
                }`}
              >
                Improvement
              </div>
            </Tooltip>
            <Tooltip
              showArrow={true}
              size="md"
              color="default"
              className="p-[10px]"
              content={
                <div>
                  <p>AI gợi ý các topic-specific collocations được dùng trong bài</p>
                </div>
              }
            >
              <div
                onClick={() => setActiveTab("vocabulary")}
                className={`bg-neu1 text-white px-[20px] py-[5px] rounded-tl-[8px] rounded-tr-[8px] caption flex items-center justify-center md:body2 cursor-pointer ${
                  activeTab == "vocabulary" && "active-tab-writing"
                }`}
              >
                Vocabulary
              </div>
            </Tooltip>
          </div>
          <div className="h-[calc(100vh-278px)]">
            <div className="h-full w-full bg-white rounded-bl-[20px] rounded-br-[20px] px-[24px] pb-[24px] mr-[14px]">
              <div className="flex items-center justify-between sticky top-0 bg-white py-[12px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab ? "animation" : "empty"}
                    variants={tabContentVariants}
                    initial="initial"
                    animate="enter"
                    exit="exit"
                    className="h-full"
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <p className="headline1">{getTab(activeTab)}</p>
                  </motion.div>
                </AnimatePresence>
                <div
                  onClick={() => {
                    copyFunc();
                  }}
                  className="cursor-pointer px-[12px] py-[3px] rounded-[5px] bg-neu1 text-white flex items-center"
                >
                  <p className="mr-[4px]">Copy</p>
                  <CopyIcon></CopyIcon>
                </div>
              </div>
              {activeTab == "vocabulary" ? (
                <span style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: dataChatGPT?.vocabularyNew }}></span>
              ) : (
                <span style={{ whiteSpace: "pre-wrap" }}>{diffList}</span>
              )}
            </div>
          </div>
          {/* <Tabs onClick={(e) => setTab(e)} aria-label="Options" className="tabs-wraper">
            <Tab key="photos" title={<span className="caption md:body5">Grammar Correction</span>} className="py-0 tab-writing px-0 text-white grammar-tab relative">
              <Card className="tab-self-writing">
                <CardBody className="tab-body">
                  <div className="h-[calc(100vh-278px)]">
                    <div className="w-full bg-white rounded-[20px] px-[24px] pb-[24px] mr-[14px]">
                      <div className="flex items-center justify-between sticky top-0 bg-white py-[12px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTab ? "animation" : "empty"}
                            variants={tabContentVariants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="h-full"
                            transition={{
                              duration: 0.3,
                            }}
                          >
                            <p className="headline1">Grammar Correction</p>
                          </motion.div>
                        </AnimatePresence>

                        <div
                          onClick={() => {
                            copyFunc(dataChatGPT?.grammar);
                          }}
                          className="cursor-pointer px-[12px] py-[3px] rounded-[5px] bg-neu1 text-white flex items-center"
                        >
                          <p className="mr-[4px]">Copy</p>
                          <CopyIcon></CopyIcon>
                        </div>
                      </div>
                      <span style={{ whiteSpace: "pre-wrap" }}>{diffList}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab key="music" title={<span className="caption md:body5">Improvement</span>} className="py-0 tab-writing px-0 text-white">
              <Card className="tab-self-writing">
                <CardBody className="tab-body">
                  
                </CardBody>
              </Card>
            </Tab>
            <Tab key="videos" title={<span className="caption md:body5">Vocabulary</span>} className="py-0 tab-writing px-0 text-white">
              <Card className="tab-self-writing">
                <CardBody className="tab-body">
                  <div className="h-[calc(100vh-278px)]">
                    <div className="w-full bg-white rounded-[20px] px-[24px] pb-[24px] mr-[14px]">
                      <div className="flex items-center justify-between sticky top-0 bg-white py-[12px]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeTab ? "animation" : "empty"}
                            variants={tabContentVariants}
                            initial="initial"
                            animate="enter"
                            exit="exit"
                            className="h-full"
                            transition={{
                              duration: 0.3,
                            }}
                          >
                            <p className="headline1">Vocabulary</p>
                          </motion.div>
                        </AnimatePresence>
                        <div className="flex items-center gap-[5px]">
                          <div
                            onClick={() => {
                              copyFunc(dataChatGPT?.vocabulary?.replaceAll("**", ""));
                            }}
                            className="cursor-pointer px-[12px] py-[3px] rounded-[5px] bg-neu1 text-white flex items-center"
                          >
                            <p className="mr-[4px]">Copy</p>
                            <CopyIcon></CopyIcon>
                          </div>
                        </div>
                      </div>
                      <span style={{ whiteSpace: "pre-wrap" }} dangerouslySetInnerHTML={{ __html: dataChatGPT?.vocabularyNew }}></span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs> */}
        </div>
        <div className="sticky bottom-0 w-full py-[20px] bg-neu7 w-full">
          <div className="flex">
            <Link to={getLink} className="w-full mr-[12px]">
              <div className="w-full bg-neu1 px-[12px] py-[8px] body3 rounded-[10px] text-white text-center cursor-pointer">Rewrite the paragraph</div>
            </Link>
            <div onClick={() => closeScreen()} className="bg-neu1 px-[12px] py-[8px] body3 rounded-[10px] text-white text-center cursor-pointer">
              Close
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Result;
