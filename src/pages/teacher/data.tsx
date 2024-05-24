import List from "./list";
import Progress from "./progress";

const topR = [
  {
    avatar: "teacher-1.png",
    top: "80%",
    bot: "HS Nộp Bài Đúng Hạn",
    bgcolor: "bg-greenpastel border-greenpastel",
  },
  {
    avatar: "teacher-2.png",
    top: "13",
    bot: "Bài Cần Chấm",
    bgcolor: "bg-orangepastel border-orangepastel",
  },
  {
    avatar: "result-2.png",
    top: "16",
    bot: "Học Sinh",
    bgcolor: "bg-bluepastel border-bluepastel",
  },
];
const weekFilter = [
  { week: "1" },
  { week: "2" },
  { week: "3" },
  { week: "4" },
  { week: "5" },
  { week: "6" },
  { week: "7" },
  { week: "8" },
  { week: "9" },
  { week: "10" },
  { week: "11" },
  { week: "12" },
  { week: "13" },
];

const statusFilter = [
  { status: "Reviewed", value: "reviewed" },
  { status: "Under Review", value: "completed" },
];

const rows = [
  {
    key: "1",
    name: "Liên Phương",
    week: "4",
    quizname: "Quiz 1.1",
    submittime: "00:03:59",
    daysubmit: "02/09/2023",
    reviewtime: "11:00:03",
    dayreview: "02/09/2023",
    status: "Reviewed",
    score: "4.0",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    key: "2",
    name: "Minh",
    week: "2",
    quizname: "Quiz 1.2",
    submittime: "",
    daysubmit: "02/09/2023",
    reviewtime: "11:00:03",
    dayreview: "02/09/2023",
    status: "Under Review",
    score: "",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    key: "3",
    name: "Jane Fisher",
    week: "",
    quizname: "1.1",
    submittime: "6:99:99",
    daysubmit: "02/09/2023",
    reviewtime: "11:00:03",
    dayreview: "02/09/2023",
    status: "Under Review",
    score: "",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
  },
  {
    key: "4",
    name: "William Howard",
    week: "",
    quizname: "1.4",
    submittime: "",
    daysubmit: "02/09/2023",
    reviewtime: "11:00:03",
    dayreview: "02/09/2023",
    status: "Reviewed",
    score: "",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@example.com",
    day: "02/09/2023",
  },
];

const columns = [
  {
    key: "user_created",
    label: "NAME",
  },
  {
    key: "section",
    label: "WEEK",
  },
  {
    key: "quiz",
    label: "QUIZ NAME",
  },
  {
    key: "date_created",
    label: "SUBMIT TIME",
  },
  {
    key: "review",
    label: "REVIEW TIME",
  },
  {
    key: "status",
    label: "STATUS",
  },
  {
    key: "score",
    label: "SCORE",
  },
];

const left = [
  {
    name: "Bloom Advance",
    timestart: "02/09/2023",
  },
  {
    name: "Trunk Basic",
    timestart: "20/08/2023",
  },
  {
    name: "Trunk Advance",
    timestart: "15/08/2023",
  },
];

const titles = [{ title: "Danh sách bài chấm" }, { title: "Tiến độ lớp" }];

const inforows = [
  {
    key: "1",
    name: "Nguyễn Văn A DKJBKJSBFKBJKJ",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "2",
    name: "Nguyễn Văn B",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "3",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "4",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "5",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "6",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "7",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "8",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "9",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "11",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "12",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "13",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "14",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "15",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "16",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "17",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "18",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "19",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "20",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "21",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
  {
    key: "22",
    name: "Nguyễn Văn C",
    tgnop: "14:50:03",
    tgcham: "15:50:50",
  },
];

const infocolumns = [
  {
    key: "name",
    label: "TÊN HỌC SINH",
  },
  {
    key: "submit-time",
    label: "THÒI GIAN NỘP",
  },
  {
    key: "review-time",
    label: "THỜI GIAN CHẤM",
  },
];

export { topR, weekFilter, statusFilter, rows, columns, left, titles, infocolumns, inforows };
