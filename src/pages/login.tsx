import {
  faExclamationCircle,
  faEye,
  faEyeSlash,
  faSignInAlt,
  faSpinner,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/Button";
import { Input } from "@/components/FormControls";
import { Title } from "@/components/Title";
import { APP_NAME } from "@/lib/config";
import { trpc } from "@/utils/trpc";

const FormGroup = ({ children }: React.PropsWithChildren) => (
  <div className="mb-5 [color:#666] [font-size:14px]">{children}</div>
);

const translateErrorMessage = (msg: string) =>
  msg === "Invalid credentials" ? "Identifiants invalides" : msg;

const ErrorMsg = ({ text }: { text: string }) => (
  <p className="[color:#721c24] mb-sm">
    <FontAwesomeIcon icon={faExclamationCircle} className="mr-sm" />
    {text}
  </p>
);

type LoginFormData = {
  username: string;
  password: string;
};

const Login = () => {
  const { register, handleSubmit, formState } = useForm<LoginFormData>();
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
    await utils.user.invalidate();
    if (res.ok) {
      await router.push("/");
    } else {
      const { error } = (await res.json()) as { error: string };
      setErrorMsg(translateErrorMessage(error));
    }
  };
  const { isSubmitting } = formState;

  return (
    <div className="h-full w-full relative">
      <Title>Se connecter</Title>
      <div className="bg-primary-default w-full h-1/2 absolute top-0" />
      <section className="flex flex-col justify-center items-center h-full relative">
        <h1 className="font-['Niconne'] [font-size:52px] text-white mb-4">
          {APP_NAME}
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="[box-shadow: 0px 29px 147.5px 102.5px hsla(0, 0%, 0%, 0.05), 0px 29px 95px 0px hsla(0, 0%, 0%, 0.16) ] p-10 flex flex-col bg-white"
        >
          <h2 className="[border-bottom:1px_solid_#ddd] pb-5 mb-5 uppercase text-center font-medium [font-size:26px]">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Connexion
          </h2>
          {errorMsg && <ErrorMsg text={errorMsg} />}
          <FormGroup>
            <label htmlFor="username" className="uppercase font-medium">
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
            <div className="flex">
              <label htmlFor="password" className="uppercase font-medium">
                Mot de passe
              </label>
              <button
                type="button"
                className="ml-auto"
                onClick={() => {
                  setShowPassword((show) => !show);
                }}
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="mr-1"
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
          <Button type="submit" disabled={isSubmitting}>
            <FontAwesomeIcon
              icon={isSubmitting ? faSpinner : faSignInAlt}
              spin={isSubmitting}
              className="mr-2"
            />
            Connexion
          </Button>
        </form>
      </section>
    </div>
  );
};

Login.isPublic = true;

export default Login;
