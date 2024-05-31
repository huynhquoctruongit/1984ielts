// import { useState } from "react";
// import ModalView from "../modal/template";
// import { AxiosAPI } from "@/libs/api/axios-client";

// const ButtonEntranceTest = ({ classUser }) => {
//   const [open, setOpen] = useState(false);
//   const onSubmitEntranceTest = async () => {
//     AxiosAPI.put(`/v1/e-learning/user/class/${classUser.id}/entrance-test/completed`);
//     setOpen(false);
//   };

//   return (
//     <div className="button-entrance-test">
//       <div onClick={() => setOpen(true)} className="bg-neu4 py-2 text-center w-full rounded-md mt-10 cursor-pointer hover:bg-neu3 text-neu1 body3 duration-200 shadow-sm">
//         Đã hoàn thành
//       </div>
//       <ModalView open={open} toggle={() => setOpen((open) => !open)}>
//         <div className="p-3">
//           <div className="bg-white px-10 pt-7 rounded-md md:w-[50rem] mx-auto">
//             <div className="web-h4 text-center">Xác nhận đã hoàn thành khóa học</div>
//             <div className="mt-10 md:w-40 mx-auto">
//               <img className="w-40 mx-auto aspect-square" src={"/images/submit-entrance-test.png"} alt="" />
//             </div>
//             <div>
//               <div>
//                 <div className="web-body1 text-light-01  mt-8 max-w-[30rem] mx-auto">
//                   Bạn lưu ý: sau khi bấm Đã hoàn thành, kết quả khóa học của bạn sẽ được lưu lại và toàn bộ các thao tác sau đó sẽ không được tính. Hãy chắc chắn mình đã hoàn thành
//                   các nội dung được yêu cần bạn nhé!!
//                 </div>
//               </div>
//             </div>
//             <div className="flex -mx-10 px-4 gap-3 py-6 border-t border-[#E5E5EA] items-center justify-center md:justify-between mt-10 flex-wrap flex-col-reverse md:flex-row">
//               <div
//                 onClick={() => setOpen(false)}
//                 className="text-light-02 px-8 py-2 rounded-full text-center hover:bg-neutrual-06 web-button cursor-pointer  border border-neutrual-06 duration-200"
//               >
//                 Quay lại
//               </div>
//               <div
//                 onClick={onSubmitEntranceTest}
//                 className="bg-primary2 px-4 py-2 text-center rounded-full cursor-pointer hover:bg-primary1 text-white web-button duration-200 shadow-sm ml-4"
//               >
//                 Xác nhận hoàn thành khóa học
//               </div>
//             </div>
//           </div>
//         </div>
//       </ModalView>
//     </div>
//   );
// };

// export default ButtonEntranceTest;
