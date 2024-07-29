import Fragment, { useEffect, useState, useRef, useCallback } from "react";
import { uid, checkSelection } from "@/services/helper.tsx";
import useOnClickOutside from "@/hook/outside";
import { FaceFrownIcon, PlayCircleIcon } from "@heroicons/react/20/solid";
import { PencelIcon, SpeakingIcon, TrashIcon } from "@/components/icons";
import { Textarea, Dropdown, DropdownTrigger, DropdownSection, DropdownItem, DropdownMenu } from "@nextui-org/react";
import axiosClient from "@/libs/api/axios-client.ts";
const Note = ({ type, indexPart, idProps, dataContent, getParamsNote }: any) => {
  let urlParams = new URLSearchParams(window.location.search);
  const answerId = urlParams.get("answerId");
  const [content, setContent]: any = useState();
  const [isClearAll, setClearAll]: any = useState(false);
  const [isPopup, setPopup]: any = useState(false);
  const [isHightlight, setHightlight]: any = useState();
  const [isNote, setNote]: any = useState({
    status: false,
    note: "",
  });
  const [data, setData] = useState([]);
  const [dataRange, setRange]: any = useState();
  const refPopup = useRef();
  const refNote = useRef();
  const refPopupHighlight = useRef();
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isTooltip, setEditTooltip] = useState(false)
  const isMobile = screenWidth <= 768;

  const handleWindowResize = useCallback((event: any) => {
    setScreenWidth(window.innerWidth);
  }, []);
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [handleWindowResize]);
  useOnClickOutside(refPopup, () => {
    setPopup(false);
  });
  useOnClickOutside(refNote, () => {
    setTimeout(() => {
      setEditTooltip(false)
      setNote({
        status: false,
      });
    }, 200);
  });
  useOnClickOutside(refPopupHighlight, () => {
    setHightlight({
      ...isHightlight,
      status: false,
    });
  });
  useEffect(() => {
    if (getParamsNote) {
      getParamsNote(data);
    }
  }, [data]);
  useEffect(() => {
    axiosClient.get(`/items/transcript?filter[answer]=${answerId}`).then((res) => {
      if (res?.data?.data) {
        setData(res?.data?.data?.[0]?.position);
      }
    });
  }, []);
  function saveSelection() {
    if (window.getSelection) {
      var sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        return sel.getRangeAt(0);
      }
    }
    return null;
  }

  useEffect(() => {
    if (isClearAll) {
      setTimeout(() => {
        clearHighlight("all");
      }, 200);
    }
  }, [isClearAll, indexPart]);
  useEffect(() => {
    setTimeout(() => {
      const content: any = document.getElementById("render-ui");
      if (content) {
        if (isMobile) {
          content.addEventListener("touchend", function (event) {
            setHightlight()
            openPopupUI(event);
          });
        } else {
          content.addEventListener("mouseup", function (event) {
            setHightlight()
            openPopupUI(event);
          });
        }
        const openPopupUI = async (event) => {
          const isCheck = await checkSelection(isMobile);
          if (isCheck) return;
          setClearAll(false);
          let elm: any = window.getSelection();
          if (elm?.toString()) {
            setPopup(true);
            const save = saveSelection();
            setRange(save);
            var oRange = elm.getRangeAt(0);
            if (oRange?.commonAncestorContainer?.outerHTML?.indexOf("<input") > -1) return;
            const contentElm = document.getElementById("screen-question")
            let plusHeight = -20
            let plusWidth = 100
            if (event.clientY + 170 > contentElm.clientHeight) plusHeight = 100
            event.clientX < 100 ? plusWidth = 20 : 100
            setTimeout(() => {
              var getTool: any = document.querySelector(".popup-selected") as any;
              if (getTool) {
                var newLeft = event.clientX <= 120 ? 120 : event.clientX;
                elm.toString().length
                  ? ((getTool.style.left = event.clientX - plusWidth + "px"),
                    (getTool.style.top = event.clientY - plusHeight + "px"),
                    getTool.classList.add("active"))
                  : null;
              }
            }, 100);
          }
        };
      }
    }, 500);
  }, [indexPart]);
  useEffect(() => {
    setTimeout(() => {
      var marks: any = document.querySelectorAll("mark") as any;
      marks.forEach(function (mark) {
        mark.addEventListener("click", function (event) {
          var clickedElement = event.target;
          var clickedClass = clickedElement.classList[0];
          var foundElement = data.find(function (item) {
            return item.id == clickedClass;
          });
          openSelected(foundElement);
        });
      });
    }, 300);
  }, [data, indexPart]);

  const openSelected = (param: any) => {
    if (param) {
      var getPostion = document.querySelector(`.${param?.id}`);
      var oRect = getPostion.getBoundingClientRect();
      setTimeout(() => {
        const contentElm = document.getElementById("screen-question")
        let plusHeight = oRect.top + 20
        if (oRect.top + 170 > contentElm.clientHeight) plusHeight = oRect.top - 120
        var getTool: any = document.querySelector(`.popup-selected-${param.type}`) as any;
        const plusAudioElm = location.href.indexOf("/review") > -1 && type == "listening" ? 110 : 0;
        if (getTool) {
          var newLeft = oRect.left <= 120 ? 120 : oRect.left;
          (getTool.style.left = newLeft + oRect.width / 2 - 70 + "px"), // 110 is toolbox.width/2
            (getTool.style.top = plusHeight + "px"), //45 is toolbow.height
            getTool.classList.add("active");
        }
      }, 100);
      if (param.type == "note") {
        setNote({
          status: true,
          type: "show",
          param: param,
        });
      } else {
        setHightlight({
          status: true,
          param: param,
        });
      }
    }
  };
  const clearHighlight = (type: any) => {
    if (type == "item") {
      var elements = document.getElementsByClassName(isHightlight?.param?.id);
      var elementsArray = Array.from(elements);
      elementsArray.forEach(function (element) {
        var newDiv = document.createElement("div");
        while (element.firstChild) {
          newDiv.appendChild(element.firstChild);
        }
        newDiv.normalize();
        element.replaceWith(...newDiv.childNodes);
        const newArray = data.filter((item) => item.id !== isHightlight?.param?.id);
        setData(newArray);
      });
    } else {
      setClearAll(true);
      function replaceAndClean(element) {
        let newElm = document.createElement("span");
        newElm.innerHTML = element.innerHTML;
        newElm.className = "";
        element.parentNode.replaceChild(newElm, element);
        let childElms = newElm.querySelectorAll("." + classDelete);
        childElms.forEach(replaceAndClean);
      }

      let classDelete = "mark-selected";
      let allElms = document.querySelectorAll("." + classDelete);
      allElms.forEach(replaceAndClean);
      setData([]);
    }
    setHightlight({
      status: false,
    });
  };
  const PopupHightlight = () => {
    return (
      <div
        ref={refPopupHighlight}
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        id="popup-selected"
        className="popup-selected-hightlight w-fit max-w-[170px] fixed border-[0.5px] border-gray text-white bg-neu1 z-[1111] rounded-[4px] p-[10px]"
      >
        <div
          className="flex items-center cursor-pointer hover:hover:text-neu3"
          onClick={() => {
            setHightlight({
              ...isHightlight,
              type: "add-note",
              status: false,
            });
            setNote({
              status: true,
              type: "open",
            });
          }}
        >
          <SpeakingIcon className="w-[15px]"></SpeakingIcon>
          <p className="cursor-pointer hover:hover:text-neu3 ml-[10px]">Note</p>
        </div>
        <div className="w-full h-[0.5px] bg-neu4 my-[4px]"></div>
        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => clearHighlight("item")}>
          <TrashIcon className="w-[17px]"></TrashIcon>
          <p className="cursor-pointer hover:text-neu3 ml-[10px]">Clear highlight</p>
        </div>
        <div className="w-full h-[0.5px] bg-neu4 my-[4px]"></div>

        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => clearHighlight("all")}>
          <TrashIcon className="w-[17px]"></TrashIcon>
          <p className="cursor-pointer hover:text-neu3 ml-[10px]">Clear all</p>
        </div>
      </div>
    );
  };

  const getSelectionPopup = (type: any, value: any) => {
    const valueRange = dataRange;
    const randomId = uid();
    var wrap = ["A"];
    var sel: any = valueRange;
    var range: any = valueRange;
    const param = {
      type: type,
      id: `note-${randomId}`,
      textSelected: sel?.toString(),
      note: value,
      dataRange: valueRange,
    };
    let list = [...(data || [])];
    list.push(param);
    setData(list);
    if (!range.startContainer.isSameNode(range.endContainer)) {
      var treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_ALL);
      var nodeList = [];
      var currentNode = treeWalker.currentNode;
      while (currentNode) {
        nodeList.push(currentNode);
        currentNode = treeWalker.nextNode();
      }
      var start = null; // index that our selected nodes start
      var end = null; // index that our selected nodes end
      var selNodes = nodeList.filter(function (val, i) {
        // filter the node list
        var node = nodeList[i];
        start = start ?? (val.isSameNode(range.startContainer) ? i : null); // if same as start node
        end = end ?? (val.isSameNode(range.endContainer) ? i : null); // if same as end node
        var lesser = start == null || i <= start; // is before start node?
        var greater = end != null && i >= end; // is after end node?
        return (
          !lesser &&
          !greater &&
          !node.isSameNode(range.endContainer.parentNode) && // node is not same as end node's parent
          node != undefined &&
          node != null &&
          node.textContent.replace(/\t|\n/g, "") != "" &&
          node.textContent.replace(/\t|\n/g, "") != undefined &&
          !node.contains(range.endContainer) && // node does not contain end node
          !node.isSameNode(range.endContainer.parentNode) // node is not same as end node's parent
        );
      });
      var sParent = range.startContainer.parentNode;
      var sText = range.startContainer.textContent;
      var mark: any = document.createElement("mark") as any;
      mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
      mark.id = `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`;
      mark.addEventListener("click", function () {
        let elm = list?.find((el) => el.id == `note-${randomId}`);
        openSelected(elm);
      });
      // wrap a tags in mark
      if (wrap.includes(sParent.nodeName) && sText.replace(/\t+|\n+/gm, "") == sText.substring(range.startOffset).replace(/\t+|\n+/gm, "")) {
        var node = sParent.cloneNode(true);
        mark.append(node);
        sParent.after(mark);
        sParent.remove();
      } else {
        mark.textContent = sText.substring(range.startOffset);
        range.startContainer.textContent = sText.substring(range.startOffset, -1);
        range.startContainer.after(mark);
      }
      // mark node at end of selection
      var eParent: any = range.endContainer.parentNode;
      var eText: any = range.endContainer.textContent;
      var mark: any = document.createElement("mark") as any;
      mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
      mark.id = `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`;
      mark.addEventListener("click", function () {
        let elm = list?.find((el) => el.id == `note-${randomId}`);
        openSelected(elm);
      });
      // wrap a tags in mark
      if (wrap.includes(eParent.nodeName) && eText.replace(/\t+|\n+/gm, "") == eText.substring(range.endOffset, -1).replace(/\t+|\n+/gm, "")) {
        var node = eParent.cloneNode(true);
        mark.append(node);
        eParent.after(mark);
        eParent.remove();
      } else {
        mark.textContent = eText.substring(range.endOffset, -1);
        range.endContainer.textContent = eText.substring(range.endOffset);
        range.endContainer.before(mark);
      }
      // mark nodes in between start and end
      selNodes.forEach(function (val, idx) {
        var currentNode = selNodes[idx];
        var mark: any = document.createElement("mark") as any;
        mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
        mark.id = `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`;
        mark.addEventListener("click", function () {
          let elm = list?.find((el) => el.id == `note-${randomId}`);
          openSelected(elm);
        });
        if (currentNode.nodeType === Node.TEXT_NODE) {
          // if text node, insert mark after node and remove node
          mark.textContent = currentNode.textContent;
          currentNode.after(mark);
          currentNode.remove();
        } else {
          if (wrap.includes(currentNode.nodeName)) {
            var node = currentNode.cloneNode(true);
            mark.append(node);
            currentNode.after(mark);
            currentNode.remove();
          } else {
            // reset the node's html and append mark
            mark.textContent = currentNode.textContent;
            currentNode.innerHTML = "";
            currentNode.appendChild(mark);
          }
        }
      });
    } else {
      var parentNode = range.startContainer.parentNode;
      var mark: any = document.createElement("mark") as any;
      mark.classList.add(`note-${randomId}`, `mark-selected`, `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`);
      mark.id = `${type == "hightlight" ? "mark-selected-hightlight" : "mark-selected-note"}`;
      mark.addEventListener("click", function () {
        let elm = list?.find((el) => el.id == `note-${randomId}`);
        openSelected(elm);
      });
      if (wrap.includes(parentNode.nodeName)) {
        var node = parentNode.cloneNode(true);
        node.textContent = sel.toString();
        mark.append(node);
        parentNode.after(mark);
        parentNode.remove();
      } else {
        var sText: any = document.createTextNode(range.startContainer.textContent.substring(range.startOffset, -1).toString());
        var eText: any = document.createTextNode(range.endContainer.textContent.substring(range.endOffset).toString());
        mark.textContent = sel.toString();
        range.startContainer.after(eText);
        range.startContainer.after(mark);
        range.startContainer.after(sText);
        range.startContainer.remove();
      }
    }
    setPopup(false);
    setNote({
      status: false,
    });
  };
  useEffect(() => {
    const markedNoteDivs = document.querySelectorAll(".mark-selected-note");
    const markedNoteArray = Array.from(markedNoteDivs);
    const result = markedNoteArray.reduce((acc, current, index, array) => {
      const classes = Array.from(current.classList);
      const hasSameClasses = array.every((element, elementIndex) => {
        if (elementIndex !== index) {
          const otherClasses = Array.from(element.classList);
          return classes.every((className) => otherClasses.includes(className));
        }
        return true;
      });
      array.forEach((element) => {
        element.classList.remove("mark-selected-note");
      });
      if (index === array.length - 1) {
        current.classList.add("active-note");
      }
      return acc;
    }, []);
  }, [data]);
  const Popup = () => {
    return (
      <div
        ref={refPopup}
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        id="popup-selected"
        className="popup-selected w-fit max-w-[150px] fixed border-[0.5px] border-gray bg-neu1 text-white z-[1111] rounded-[4px] p-[10px]"
      >
        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => notePopup()}>
          <SpeakingIcon className="w-[15px]"></SpeakingIcon>
          <button className="cursor-pointer ml-[10px] get_selection">Note</button>
        </div>
        <div className="w-full h-[0.5px] bg-neu4 my-[4px]"></div>
        <div className="flex items-center cursor-pointer hover:text-neu3" onClick={() => getSelectionPopup("hightlight", "")}>
          <PencelIcon className="w-[15px]"></PencelIcon>
          <button className="cursor-pointer hover:text-neu3 get_selection ml-[10px]">Hightlight</button>
        </div>
      </div>
    );
  };
  const notePopup = () => {
    setPopup(false);
    setNote({
      status: true,
      type: "open",
    });
  };
  const editSelected = (value) => {
    let newArray = isNote?.param;
    newArray.note = value;
    openSelected(newArray);
    setNote({
      status: false,
    });
  };
  const Note = () => {
    var getPostion = isHightlight?.type === "add-note" ? document.querySelector(`.${isHightlight?.param?.id}`) : document.querySelector(`.${isNote?.param?.id}`);
    var oRange = dataRange && dataRange?.toString()?.length !== 0 ? dataRange : getPostion;
    var oRect = oRange && oRange?.getBoundingClientRect();
    setTimeout(() => {
      var getTool: any = document.querySelector(".popup-selected-note") as any;
      const contentElm = document.getElementById("screen-question")
      // const plusAudioElm = location.href.indexOf("/review") > -1 && type == "listening" ? 110 : 0;
      let plusHeight = oRect.top + 20
      if (oRect.top + (isMobile ? 0 : 170) > contentElm.clientHeight) plusHeight = oRect.top - 200
      if (getTool) {
        var newLeft = oRect.left
        if (isMobile && oRect.left + 150 > contentElm.clientWidth) {
          newLeft = contentElm.clientWidth / 2 - 90
        }
        (getTool.style.left = newLeft + "px"),
          (getTool.style.top = plusHeight + "px"),
          (getTool.classList.add("active"));
      }
    }, 100);
    let value = "";
    if (isHightlight?.type === "add-note") {
      const elm = data?.find((el) => el.id == isHightlight?.param?.id);
      setRange(elm.dataRange);
    }
    const onAction = (type: any) => {
      if (type == "edit") {
        setNote({
          status: true,
          type: "edit",
          param: isNote?.param,
        });
      } else {
        var elements = document.getElementsByClassName(isNote?.param?.id);
        var elementsArray = Array.from(elements);
        elementsArray.forEach(function (element) {
          var newDiv = document.createElement("div");
          while (element.firstChild) {
            newDiv.appendChild(element.firstChild);
          }
          newDiv.normalize();
          element.replaceWith(...newDiv.childNodes);
        });
        setNote({
          status: false,
        });
      }
    };
    const changeToNote = () => {
      let elm = data?.findIndex((el) => el.id == isHightlight?.param?.id);
      let arr = data?.find((el) => el.id == isHightlight?.param?.id);
      let cloneData = data;
      arr.note = value;
      arr.type = "note";
      if (elm !== -1) {
        cloneData[elm] = arr;
      }
      const listElm = document.getElementsByClassName(isHightlight?.param?.id)
      const classes = Array.from(listElm);
      classes.map((elm) => {
        elm.classList.add("active-note");
      })
      setData(cloneData);
      setNote({
        status: false,
      });
    };
    useEffect(() => {
      const noteInput = document.getElementById("input-note-textarea");
      if (noteInput) {
        setTimeout(() => {
          noteInput.focus();
        }, 200);
      }
    }, []);

    return (
      <div
        ref={refNote}
        style={{ boxShadow: "0px 0px 15px 0px rgb(0 0 0 / 0.03), 0px 2px 30px 0px rgb(0 0 0 / 0.08), 0px 0px 1px 0px rgb(0 0 0 / 0.3)" }}
        id="popup-selected"
        className="popup-selected-note min-w-[200px] max-w-[400px] fixed border-[0.5px] border-gray bg-[#E8F4FF] z-[11111] rounded-[14px] p-[20px]"
      >
        <div className="flex items-center justify-between mb-[12px]">
          <p className="font-bold">Note</p>
          {isNote?.type === "show" &&
            <div className="relative">
              <div onClick={() => setEditTooltip(!isTooltip)}>
                <div className="bg-primary1 p-[6px] rounded-full cursor-pointer">
                  <PencelIcon fill="red" className="w-[9px] h-[9px]" />
                </div>
              </div>
              {isTooltip && <div className="absolute mt-[6px] w-[100px] bg-white p-[12px] rounded-[8px] border-[1px] border-gray">
                <p className="mb-[6px] cursor-pointer caption hover:text-primary1" onClick={() => onAction("edit")}>Edit</p>
                <p className="cursor-pointer caption hover:text-primary1" onClick={() => onAction("delete")}>Delete</p>
              </div>}
            </div>
          }

        </div>
        {isNote?.type === "show" ? (
          <div className="break-words">{isNote?.param?.note}</div>
        ) : (
          <div>
            <textarea
              className="bg-white rounded-[4px] p-[10px] w-full"
              id="input-note-textarea"
              placeholder="Nhập nội dung..."
              maxLength={200}
              defaultValue={isNote?.param?.note}
              onChange={(e) => (value = e.target.value)}
            ></textarea>
            <br />
            <button
              onClick={() =>
                isNote?.type == "edit" ? editSelected(value || isNote?.param?.note) : isHightlight?.type === "add-note" ? changeToNote() : getSelectionPopup("note", value)
              }
              className="bg-primary1 px-[20px] py-[3px] text-center cursor-pointer rounded-[5px] text-white mt-[12px] caption get_selection"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    );
  };
  useEffect(() => {
    try {
      const parsedArray = JSON.parse(dataContent);
      setContent(parsedArray[indexPart].html);
    } catch (error) {
      setContent(dataContent);
    }
  }, [indexPart, dataContent]);

  return (
    <div>
      {isHightlight?.status && <PopupHightlight></PopupHightlight>}
      {isPopup && <Popup></Popup>}
      {isNote.status && <Note></Note>}
      <div className="parent-node">
        <div id="render-ui" className={`ui-part-${indexPart}`}>
          <div id={idProps} dangerouslySetInnerHTML={{ __html: content }}></div>
        </div>
      </div>
    </div>
  );
};
export default Note;
