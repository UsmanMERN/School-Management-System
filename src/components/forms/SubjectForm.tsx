"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import apiClient from "@/lib/apiclient";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { LoaderCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "")
        : val,
    z.string().array()
  ),
});

type Inputs = z.infer<typeof schema>;

const SubjectForm = ({
  type,
  data,
  close,
}: {
  type: "create" | "update";
  data?: any;
  close: () => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const onSubmit = handleSubmit(async (formData) => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/subjects`, {
        data: formData,
        type,
        id: data?.id,
      });
      if (res.status === 200) {
        toast.success(res.data.message);
        close();
      } else toast.error(res.data.message);
    } catch (err) {
      console.log(err);
      toast.error("Operation unsuccessfull");
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update subject"}
      </h1>
      <div className="flex flex-col w-full gap-4">
        <InputField
          label="Subject Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
          className="w-full"
        />
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Teachers</label>
          <textarea
            className="bg-transparent outline-none border border-secondary p-2 rounded-md text-sm w-full"
            {...register("teachers")}
            defaultValue={data?.teachers?.join(", ")}
            placeholder="Enter teacher names separated by commas"
          />
          {errors.teachers?.message && (
            <p className="text-xs text-red-400">{errors.teachers.message}</p>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end">
        <button className="button p-2 rounded-m">
          {loading && <LoaderCircle className="animate-spin" />}{" "}
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default SubjectForm;
