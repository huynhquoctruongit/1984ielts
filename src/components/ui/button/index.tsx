const Button = ({ className, onClick, children }: any) => {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer h-[40px] px-[30px] w-fit rounded-full flex items-center ${className}`}
    >
      {children}
    </div>
  );
};
export default Button;
