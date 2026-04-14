type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={["skeleton rounded-[18px]", className].join(" ")} aria-hidden="true" />;
}
