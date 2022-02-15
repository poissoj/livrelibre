import {
  faExclamationCircle,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import tw from "twin.macro";

import { Button } from "@/components/Button";
import { Input } from "@/components/FormControls";
import { Title } from "@/components/Title";
import { trpc } from "@/utils/trpc";

const Form = tw.form`box-shadow[
    0px 29px 147.5px 102.5px hsla(0, 0%, 0%, 0.05),
    0px 29px 95px 0px hsla(0, 0%, 0%, 0.16)
] p-10 flex flex-col bg-white`;

const FormGroup = tw.div`mb-5 color[#666] font-size[14px]`;

const translateErrorMessage = (msg: string) =>
  msg === "Invalid credentials" ? "Identifiants invalides" : msg;

const ErrorMsg = ({ text }: { text: string }) => (
  <p tw="color[#721c24] mb-sm">
    <FontAwesomeIcon icon={faExclamationCircle} tw="mr-sm" />
    {text}
  </p>
);

type LoginFormData = {
  username: string;
  password: string;
};

const Login = () => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const utils = trpc.useContext();
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await utils.invalidateQueries(["user"]);
    if (res.ok) {
      void router.push("/");
    } else {
      const { error } = (await res.json()) as { error: string };
      setErrorMsg(translateErrorMessage(error));
    }
  };
  return (
    <div tw="h-full w-full relative">
      <Title>Se connecter</Title>
      <div tw="bg-primary-default w-full h-1/2 absolute top-0" />
      <section tw="flex flex-col justify-center items-center h-full relative">
        <h1 tw="font-family['Niconne'] font-size[52px] text-white mb-4">
          {process.env.NEXT_PUBLIC_APP_NAME}
        </h1>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <h2 tw="border-bottom[1px solid #ddd] pb-5 mb-5 uppercase text-center font-medium font-size[26px]">
            <FontAwesomeIcon icon={faUser} tw="mr-2" />
            Connexion
          </h2>
          {errorMsg && <ErrorMsg text={errorMsg} />}
          <FormGroup>
            <label htmlFor="username" tw="uppercase font-medium">
              Identifiant
            </label>
            <Input
              id="username"
              type="text"
              {...register("username")}
              autoFocus
              required
            />
          </FormGroup>
          <FormGroup>
            <div tw="flex">
              <label htmlFor="password" tw="uppercase font-medium">
                Mot de passe
              </label>
              <button
                type="button"
                tw="ml-auto"
                onClick={() => setShowPassword((show) => !show)}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  tw="mr-1"
                />
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="off"
              {...register("password")}
              required
            />
          </FormGroup>
          <Button type="submit">
            <FontAwesomeIcon icon={faSignInAlt} tw="mr-2" />
            Connexion
          </Button>
        </Form>
      </section>
    </div>
  );
};

Login.isPublic = true;

export default Login;
