import ContentLoader from "react-content-loader";

const CategorySkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="27%" height="10" />
    <rect x="35%" y={n * 30 + 15} rx="2" ry="2" width="27%" height="10" />
    <rect x="65%" y={n * 30 + 15} rx="2" ry="2" width="27%" height="10" />
  </>
);

export const CategorySkeleton = (): JSX.Element => (
  <ContentLoader height={150} width="100%">
    {Array(5)
      .fill(0)
      .map((_, i) => (
        <CategorySkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);
