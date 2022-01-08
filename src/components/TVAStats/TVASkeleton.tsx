import ContentLoader from "react-content-loader";

const TVASkeletonRow = ({ n }: { n: number }) => (
  <>
    <rect x="5%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="27%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="49%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
    <rect x="71%" y={n * 30 + 15} rx="2" ry="2" width="19%" height="10" />
  </>
);

export const TVASkeleton = (): JSX.Element => (
  <ContentLoader height={300} width="100%">
    {Array(9)
      .fill(0)
      .map((_, i) => (
        <TVASkeletonRow key={i} n={i} />
      ))}
  </ContentLoader>
);
