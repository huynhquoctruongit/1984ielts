import Button from "@/components/ui/button";

const NotExistHistory = () => {
  return (
    <div className="flex flex-col gap-8 items-center">
      <p className="text-light-01 h8 text-center pt-3">Bạn chưa làm bài tập này lần nào, <br />làm bài tập ngay bạn nhé.</p>
      <Button className='rounded-[40px] bg-primary1 text-white text-button !px-10 !py-3'>Làm bài tập</Button>
    </div>
  );
};

export default NotExistHistory;
