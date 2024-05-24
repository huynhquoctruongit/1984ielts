import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { replaceWord } from "@/services/helper";
import Note from "./note";
const QuestionUI = ({ type, idProps, data, className, getParamsNote, indexPart }: any) => {
  const [modal, setModal]: any = useState({});
  var text = data?.content;
  const location = useLocation();
  const isListening = location.pathname.includes("listening");
  var regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
  var output = [];
  let match;

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    var element: any = document.getElementsByClassName(hash)[0] as any;
    if (element) {
      element.style.scrollMarginTop = window.innerHeight / 2 + "px";
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, [location.hash]);

  function checkLocations(a: any, b: any) {
    const aElement = a.split("#location-")[1];
    const bElement = b.split("#location-")[1];

    if (aElement?.length === 1 && bElement?.length === 2 && bElement?.[0] === aElement) {
      return false;
    }

    const aNumber = parseInt(aElement);
    const bNumbers: any = bElement?.split("-").map((part: any) => parseInt(part));

    if (bNumbers?.includes(aNumber)) {
      return true;
    } else {
      return false;
    }
  }

  while ((match = regex.exec(text)) !== null) {
    const indices = match.slice(2).filter(Boolean).map(String);
    const sentence = match[1].trim();
    for (const index of indices) {
      output.push({ [index]: sentence.replace(/@/g, "") });

      const parts = index.split("-"); // Tách chuỗi theo dấu gạch ngang
      const numbers = parts.map((part) => parseInt(part, 10));

      let className = "";
      if (numbers) {
        numbers.map((elm) => {
          className = className + " " + `location-${elm}`;
        });
      }
      const divId = `location-${index}`;
      const isActive = checkLocations(location.hash, "#" + divId);

      const replacedText = text?.replace(match[0], `<span class="${className} ${isActive ? "active-location" : ""}" id="location-${index}">${sentence}</span>`).replace(/@/g, "");
      text = replacedText;
    }
  }
  useEffect(() => {
    const currentURL = window.location.href;
    const urlObject = new URL(currentURL);
    const locationValue = urlObject.hash.substring(1);

    const activeLocationElements = document.querySelectorAll(".active-location");
    activeLocationElements?.forEach((element) => {
      element.classList.remove("active-location");
    });
    if (locationValue) {
      const elementsWithYourClass = document.querySelectorAll(`.${locationValue}`);
      elementsWithYourClass?.forEach(function (element) {
        if (!element.classList.contains("active-location")) {
          element.classList.add("active-location");
        }
      });
    }
  }, [window.location.href]);
  function replaceText(obj, search, wrapElement, elementClass) {
    switch (obj.nodeType) {
      case 3: // it's a text node
        if (obj.nodeValue.indexOf(search) > -1) {
          var bits = obj.nodeValue.split(search);
          var nextSib = obj.nextSibling;
          obj.nodeValue = bits[0];
          for (var i = 1; i < bits.length; i++) {
            var el = document.createElement(wrapElement);
            el.className = elementClass;
            el.innerHTML = search;
            var tn = document.createTextNode(bits[i]);
            if (nextSib) {
              obj.parentNode.insertBefore(tn, nextSib);
              obj.parentNode.insertBefore(el, tn);
            } else {
              obj.parentNode.appendChild(tn);
              obj.parentNode.insertBefore(el, tn);
            }
          }
          return 2 * (bits.length - 1);
        }
        break;
      default: // it's not a text node
        for (var i = 0; i < obj.childNodes.length; i++) {
          var j = replaceText(obj.childNodes[i], search, wrapElement, elementClass);
          if (j) i += j;
        }
        break;
    }
  }
  var textReplace = text;
  var firstWord = "";
  data?.explanation?.map((elm) => {
    const replacement = `<span style='color : ${elm?.color || "black"}' class='relative explain-popup font-bold cursor-pointer underline' id='explain-${elm.id}'>${
      elm.word
    }</span>`;
    let currentIndex = 0;
    let regex = new RegExp(`\\b${elm.word}\\b`, "gi");
    textReplace = textReplace?.replace(regex, (match) => {
      currentIndex++;
      return currentIndex === elm.offset ? replacement : match;
    });
  });

  useEffect(() => {
    if (modal?.status) {
      setTimeout(() => {
        let target: any = document.querySelector(`#${"explain-" + modal.id}`) as any;
        let wrapper: any = document.getElementById("screen-question") as any;
        let popup: any = document.querySelector(`.${"explain-" + modal.id}`) as any;
        let questionUI: any = document.querySelector("#question-ui-left");

        var wrapperRect = wrapper.getBoundingClientRect();
        var targetRect = target.getBoundingClientRect();

        var currentPostion = questionUI?.scrollTop || 0;
        var popupTop = targetRect.top + currentPostion;
        var popupLeft = targetRect.left - wrapperRect.left;

        if (popupLeft + popup.offsetWidth + 300 > wrapper.offsetWidth) {
          popupLeft = wrapper.offsetWidth - popup.offsetWidth - 300;
        }
        popup.style.left = `${popupLeft}px`;
        popup.style.top = `${popupTop - (isListening ? 170 : 60)}px`;
      }, 100);
    }
  }, [modal]);
  useEffect(() => {
    setTimeout(() => {
      var explainPopup: any = document.querySelectorAll(".explain-popup") as any;
      explainPopup.forEach(function (elm) {
        elm.addEventListener("click", function (event) {
          const item = data?.explanation?.find((child) => "explain-" + child.id == elm.id);
          setModal({
            ...item,
            position: elm.getBoundingClientRect(),
            status: true,
          });
        });
      });
    }, 100);
  }, [data, modal?.status]);

  const isDescendant = (parent, child) => {
    let node = child.parentNode;
    while (node !== null) {
      if (child === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  };

  const handleClickOutside = (event) => {
    const popupElement = document.querySelector("#popup-selected-explain");
    if (popupElement && !isDescendant(popupElement, event.target)) {
      setModal({
        status: false,
      });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div
      id="question-ui-left"
      className={className + ` relative overflow-y-auto md:py-[35px] px-[20px] h-full lg:px-[50px] relative ${isListening ? "h-[calc(100vh-244px)]" : "h-[calc(100vh-133px)]"}`}
    >
      {modal?.status && (
        <div className={`absolute left-[50%] top-[50%] z-[111111] ${"explain-" + modal.id}`} id="popup-selected-explain">
          <span id="popup-selected-explain" className={`popup-explain-ui`}>
            <span className="body3 fond-bold">{modal.word}</span> <span className="font-normal caption">({modal.word_type})</span>
            <br />
            <span className="font-normal">{modal.pronunciation}</span>
            <br />
            <span className="w-full h-[1px] bg-neu4 block my-[3px]"></span>
            <span className="text-[14px] font-medium">{modal.description}</span>
          </span>
        </div>
      )}
      <Note type={type} indexPart={indexPart} idProps={idProps} dataContent={textReplace} getParamsNote={getParamsNote}></Note>
    </div>
  );
};
export default QuestionUI;
