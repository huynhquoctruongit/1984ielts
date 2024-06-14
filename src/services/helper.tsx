import dayjs from "dayjs";

export const compareDay = (a: any, b: any) => {
  if (a.get("date") !== b.get("date")) return false;
  if (a.get("month") !== b.get("month")) return false;
  if (a.get("year") !== b.get("year")) return false;
  return true;
};
export const compareDayByString = (a: any, b: any) => {
  const dataA = dayjs(a);
  const dataB = dayjs(b);
  if (dataA.get("date") !== dataB.get("date")) return false;
  if (dataA.get("month") !== dataB.get("month")) return false;
  if (dataA.get("year") !== dataB.get("year")) return false;
  return true;
};
export const emailValidate = (value: string) => {
  const isEmail = value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
  return isEmail;
};

export const containLine = (time_start: string, time_end: string, time_current: string) => {
  const [hour_s, minute_s] = time_start.split(":");
  const [hour_e, minute_e] = time_end.split(":");
  const [hour_c, minute_c] = time_current.split(":");

  const start = parseInt(hour_s) * 60 + parseInt(minute_s);
  const end = parseInt(hour_e) * 60 + parseInt(minute_e);
  const current = parseInt(hour_c) * 60 + parseInt(minute_c);

  if (current <= end && current >= start) {
    const percent = Math.floor(((current - start) / (end - start)) * 100 * 10) / 10;
    return { percent: percent };
  }
};
export const diffDate = (start: any, end: any) => {
  var startTime = new Date(start);
  var endTime = new Date(end);
  var difference = endTime.getTime() - startTime.getTime();
  var resultInMinutes = Math.round(difference / 60000);
  return resultInMinutes;
};
export const convertMinsToHrsMins = (minutes: number) => {
  if (minutes) {
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    h = h < 10 ? 0 + h : h;
    m = m < 10 ? 0 + m : m;
    if (h == 0o0) {
      return m + " phút";
    }
    if (m == 0o0) {
      return h + " giờ";
    } else {
      return h + " giờ " + m + " phút";
    }
  }
};
export const convertSecondToMinsSecond = (minutes: number) => {
  if (minutes) {
    var sec_num = parseInt(minutes as any, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  }
};

export const listImageError: any[] = [];
export const addImageError = (url: string) => {
  listImageError.push(url);
};
export const renderImageById = (id: String, imageDefault?: string) => {
  if (!id) return imageDefault || "/images/bean.png";
  const domain = import.meta.env.VITE_CMS;
  return domain + "/assets/" + id;
};
export const imageDefault = "/images/bean.png";
export const getAlphabetIndex = (number: number) => {
  switch (number) {
    case 0:
      return "A";
    case 1:
      return "B";
      break;
    case 2:
      return "C";
      break;
    case 3:
      return "D";
      break;
    case 4:
      return "E";
      break;
    case 5:
      return "F";
      break;
    case 6:
      return "G";
      break;
    case 7:
      return "H";
      break;
    case 8:
      return "I";
      break;
    case 9:
      return "K";
      break;
    case 10:
      return "L";
      break;
    case 11:
      return "M";
      break;
    case 12:
      return "N";
      break;
    default:
      return "";
      break;
  }
};

export const regexFillBlank = (content: any) => {
  if (content) {
    var regex = /{\[([^[\]]+)\]\[(\d+(?:-\d+)?)\]}/g;
    var matches = [...content.matchAll(regex)];
    matches.map((elm: any, index: any) => {
      var words = elm[1].split("|");
      var number = elm[2];
    });
    return matches;
  }
};
export const wordCountFunc = (content: any) => {
  const trimmedText = content?.trim();
  const words = trimmedText?.split(" ");
  const count = words?.length;
  return content ? count : 0;
};

export const domainCMS = import.meta.env.VITE_CMS;

// create function conver time second to time format
export const convertSecondToTime = (seconds: number) => {
  if (seconds === 0) return "00:00";
  if (seconds) {
    const hour = Math.floor(seconds / 3600);
    const minute = Math.floor((seconds - hour * 3600) / 60);
    const second = seconds - hour * 3600 - minute * 60;
    const result = `${minute >= 10 ? minute : "0" + minute}:${second >= 10 ? second : "0" + second}`;
    return result;
  }
};

export function minutesToHours(input: any) {
  const minutes = input;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  const formattedTime = `${hours}h ${remainingMinutes}m`;
  return formattedTime;
}

export function removeVietnameseTones(str: string) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
  return str;
}

export const convertTimeToFormat = (time: any) => {
  const seconds = time * 60;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = (seconds % 60).toString().padStart(2, "0");
  const countdownOutput = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  if (countdownOutput !== "NaN:NaN:NaN") {
    return countdownOutput;
  } else {
    return "00:00:00";
  }
};

export const changeTheme = (theme: string) => {
  document.querySelector("html")?.setAttribute("data-theme", theme);
};
export const replaceBetween = (str: any, roles: any) => {
  let styledStr = str;
  roles.sort((a: any, b: any) => b.start - a.start);
  roles.forEach((r: any) => {
    const { start, end, text, sliceFirst } = r;
    const numberSlice = sliceFirst || 0;

    styledStr = styledStr.substring(0, start - numberSlice) + text + styledStr.substring(end - numberSlice + 1);
    styledStr.slice(start - numberSlice, end - numberSlice + 1, text);
  });
  return styledStr;
};

export const getSeconsTime = (time: any) => {
  if (time) {
    var arrayTime = time.toString().split(".");
    var result = arrayTime[0];
    return result;
  }
};

export const replceByIndex = (text: any, textSelect: any, position: any) => {
  var result = text.substring(0, position?.start) + textSelect + text.substring(position?.end);
  return result;
};

export const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
export const replaceWord = (inputString, targetWord, replacement) => {
  const regex = new RegExp(`\\b${targetWord?.trim()}\\b`, "gi");
  const result = inputString?.trim().replace(regex, replacement?.trim());
  return result;
};
export const getStatusSection = (dataClass, user_id) => {
  if (!dataClass) return;
  const { students = [], course, duration } = dataClass;
  const { sections = [], timestamp = [] } = course;

  const dayJoinByStudent = students.find((item) => item.directus_users_id === user_id)?.date_join;
  const dayJoin = dayjs(duration >= 0 ? dayJoinByStudent : dataClass.date_start).startOf("day");

  const current = dayjs();
  const statusSections = sections.map((item, index) => {
    const afterDay = timestamp[index].unlock || 0;
    const dayUnLock = dayJoin.add(afterDay, "day");
    const isUnLock = current.isAfter(dayUnLock);
    return { id: item.id, title: item.title, status: isUnLock ? "unlocked" : "locked", isLocked: !isUnLock };
  });
  return statusSections;
};

export const checkSelection = () => {
  return new Promise((resolve) => {
    let isCheck = false;
    document.addEventListener("touchend", function () {
      const selection = window.getSelection().toString().trim();
      if (selection.length > 0) {
        const selectedMarks = document.querySelectorAll("mark");
        if (selectedMarks) {
          selectedMarks.forEach((mark) => {
            if (mark.contains(window.getSelection().anchorNode)) {
              isCheck = true;
            }
          });
        }
      } else {
        isCheck = false;
      }
      resolve(isCheck);
    });
  });
};
export function sliceLongText(str, maxLength) {
  if (str?.length > maxLength) {
    return str.substring(0, maxLength) + "...";
  } else {
    return str;
  }
}
export function endcodeUTF8(str) {
  if (str) {
    var decoderElement = document.createElement("div");
    decoderElement.innerHTML = str;
    var decodedData = decoderElement.innerHTML;
    return decodedData;
  }
}

export function formatTimeAgo(timestamp) {
  if (timestamp) {
    const now = dayjs();
    const timeAgo: any = now.subtract(now.diff(dayjs.unix(timestamp), "minute"), "minute");
    return timeAgo.fromNow();
  }
}

export function placeCaretAtEnd(el) {
  if (el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }
}
export function fullName(item: any) {
  if (item?.fullname) {
    return item?.fullname;
  } else {
    if (item?.first_name || item?.last_name) {
      return item?.first_name || "" + item?.last_name || "";
    }
  }
}
export function checkSpace(input) {
  return /^\s*$/.test(input);
}
export function replaceSpace(input) {
  let text = input;
  let trimmedText = text.trim();
  let words = trimmedText.split(/\s+/);
  let processedText = words.join(" ");
  return processedText;
}

export const dowloadFile = (url: any, fileName: any) => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((pdfBlob) => {
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName.replace(" ", "");
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};
