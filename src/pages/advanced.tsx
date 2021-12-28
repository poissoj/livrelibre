import { Title } from "@/components/Title";
import type { GetStaticProps } from "next";

const Advanced = (): JSX.Element => {
  return (
    <div>
      <Title>Avancé</Title>
      Avancé
    </div>
  );
};

export default Advanced;

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
