"use client";

import toast, { Toaster } from "react-hot-toast";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { BACKGROUND_IMAGES, useRole, useUser } from "@/store";
import axios from "axios";
import { getRoleLabel } from "@/lib/helpers";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Input a valid email").trim(),
  password: z
    .string()
    .min(6, "Password is too short")
    .max(30, "Password is too long")
    .trim(),
});

type FormData = z.infer<typeof schema>;

const LoginPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });
  const setRole = useRole((state) => state.setRole);
  const setUser = useUser((state) => state.setUser);
  const [error, setError] = useState("");
  const [pnsNote, setPNSNote] = useState("");
  const [pns, setPNS] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    if (!pns) {
      try {
        const { status, data: result } = await axios.post("/api/auth/login", {
          email: data.email,
          password: data.password,
        });

        if (status === 200) {
          setUser(result);
          setRole(result.role);
          toast.loading("Redirecting");
          router.push(`/${getRoleLabel(result.role)}`);
        }
      } catch (err: any) {
        toast.dismiss();
        if (err.response?.data?.error === "PNS" || err.message === "PNS") {
          setValue("password", "");
          setPNSNote(
            "Password not set. Type your desired password and click 'Set Password'."
          );
          setPNS(true);
        } else
          setError(
            err.response?.data?.error || err.message || "An error occurred"
          );
      }
    } else {
      try {
        const res = await axios.post("/api/auth/email", {
          email: data.email,
          password: data.password,
        });

        if (res.status === 200) {
          toast("Check your email inbox to confirm your password setup.");
          setPNS(false);
          setPNSNote("");
        } else toast.error("Error sending confirmation email");
      } catch (err: any) {
        toast.dismiss();
        setPNSNote("");
        setError(
          err.response?.data?.error || err.message || "An error occurred"
        );
      }
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="rounded-lg h-full w-full hidden lg:flex overflow-hidden">
        <Image
          width={740}
          height={100}
          alt="background"
          className="w-full h-full object-cover"
          src={
            BACKGROUND_IMAGES[
              Math.ceil(Math.random() * BACKGROUND_IMAGES.length - 1)
            ]
          }
        />
      </div>
      <div className="flex flex-col items-center justify-center w-full p-6 md:w-[80%] lg:w-[40%]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2 w-full justify-start items-start overflow-x-hidden"
        >
          <div className="flex flex-col w-full items-center text-center">
            <h1 className="text-4xl font-bold">Welcome back</h1>
            <p className="text-balance text-muted-foreground">
              Login to your account
            </p>
          </div>
          {Object.keys(schema.shape).map((key, i) => {
            return (
              <div className="mb-4 w-full" key={i}>
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </Label>
                <input
                  {...(key === "password" && { type: key })}
                  {...register(key as keyof FormData)}
                  className="input w-full p-2 border rounded-lg outline-none"
                />
                {errors[key as keyof FormData] && (
                  <p className="text-red-500 text-xs">
                    {errors[key as keyof FormData]?.message}
                  </p>
                )}
              </div>
            );
          })}
          {error && <p className="text-red-500 text-xs">{error}</p>}
          {pns && pnsNote && (
            <p className="text-green-600 font-semibold text-xs">{pnsNote}</p>
          )}
          <div className="text-xs flex gap-1 self-end">
            Forgot password?
            <p
              onClick={() => {
                setPNSNote("Set new password and confirm with email");
                setValue("password", "");
                setPNS(true);
              }}
              className="text-accent underline font-semibold cursor-pointer"
            >
              Set new password
            </p>
          </div>
          <button type="submit" className="button w-full justify-center">
            {loading && <LoaderCircle className="animate-spin stroke-black" />}
            {pns ? "Set Password" : "Login"}
          </button>
          <p className="text-sm mt-10 mx-auto">
            New here?
            <a
              href="/create"
              className="ml-2 text-accent underline font-semibold"
            >
              Create new school
            </a>
          </p>
        </form>
        <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary mt-10">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
      <Toaster
        toastOptions={{
          className: "!bg-primary !text-secondary",
        }}
      />
    </div>
  );
};

export default LoginPage;
