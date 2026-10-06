type Props = {
  className?: string;
};

export default function VoltMark({ className = "h-8 w-8" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M34.8 6 14 35.4h16.4L26 58l24.8-30.2H34.8L34.8 6Z"
        fill="currentColor"
      />
    </svg>
  );
}
