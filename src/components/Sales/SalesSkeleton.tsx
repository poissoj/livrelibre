import ContentLoader from "react-content-loader";

const SalesSkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x={0} y={n * 30 + 15} rx="2" ry="2" width="35%" height="15" />
    <rect x="42%" y={n * 30 + 15} rx="2" ry="2" width="20%" height="15" />
    <rect x="76%" y={n * 30 + 15} rx="2" ry="2" width="2%" height="15" />
    <rect x="80%" y={n * 30 + 15} rx="2" ry="2" width="3%" height="15" />
    <rect x="85%" y={n * 30 + 15} rx="2" ry="2" width="3%" height="15" />
    <rect x="90%" y={n * 30 + 15} rx="2" ry="2" width="4%" height="15" />
    <rect x="96%" y={n * 30 + 15} rx="2" ry="2" width="2%" height="15" />
  </>
);

export const SalesSkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(9)
      .fill(0)
      .map((_, i) => (
        <SalesSkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);
