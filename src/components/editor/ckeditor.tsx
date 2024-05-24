import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    ["link", "image"],
    ["clean"],
  ],
};

const formats = ["header", "bold", "italic", "underline", "strike", "blockquote", "color", "font", "background", "list", "bullet", "indent", "link", "image"];
const EditorYoupass = ({ setData, data }: any) => {
  return <ReactQuill className="custom-editor" formats={formats} modules={modules} theme="snow" value={data} onChange={setData} />;
};

export default EditorYoupass;
