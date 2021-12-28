import ContentLoader from "react-content-loader";

const SkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="5" ry="5" width="70%" height="10" />
    <circle cx="90%" cy={n * 30 + 20} r="8" />
    <circle cx="95%" cy={n * 30 + 20} r="8" />
  </>
);

export const BookmarksSkeleton = () => (
  <ContentLoader height={250} width="100%">
    {Array(8)
      .fill(0)
      .map((_, i) => (
        <SkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);
