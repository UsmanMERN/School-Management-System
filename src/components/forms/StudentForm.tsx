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
  name: z.string().min(1, { message: "Name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  registrationNo: z
    .string()
    .min(1, { message: "Registration Number is required!" }),
  admissionNo: z.string().min(1, { message: "Admission Number is required!" }),
  birthdate: z.string().min(1, { message: "Birthdate is required!" }),
  gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  DOA: z.string().min(1, { message: "Date of Admission is required!" }),
  class: z.string().min(1, { message: "Class is required!" }),
  parentName: z.string().min(1, { message: "Parent Name is required!" }),
  parentEmail: z.string().email({ message: "Parent Eamil is required!" }),
  parentNo: z.string().min(1, { message: "Parent Phone Number is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
});

type Inputs = z.infer<typeof schema>;

const StudentForm = ({
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
      const res = await apiClient.post(`/students`, {
        totalData: formData,
        type,
        id: data?.id,
      });
      if (res.status === 200) {
        toast.success(res.data.message);
        close();
      } else toast.error(res.data.message);
    } catch (err: any) {
      console.log(err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || "Operation unsuccessful";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update student"}
      </h1>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          className="w-full md:w-1/4"
          error={errors.email}
        />
        <InputField
          label="Parent Number"
          name="parentNo"
          defaultValue={data?.parentNo}
          register={register}
          error={errors.parentNo}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Parent Name"
          name="parentName"
          defaultValue={data?.parentName}
          register={register}
          error={errors.parentName}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Parent Email"
          name="parentEmail"
          defaultValue={data?.parent?.email || ""}
          register={register}
          error={errors.parentEmail}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Registration Number"
          name="registrationNo"
          defaultValue={data?.registrationNo}
          register={register}
          error={errors.registrationNo}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Admission Number"
          name="admissionNo"
          defaultValue={data?.admissionNo}
          register={register}
          error={errors.admissionNo}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Birthdate"
          name="birthdate"
          defaultValue={data?.birthdate}
          register={register}
          error={errors.birthdate}
          type="date"
          className="w-full md:w-1/4"
        />
        <InputField
          label="Date of Admission"
          name="DOA"
          defaultValue={"12/10/2021"}
          register={register}
          error={errors.DOA}
          className="w-full md:w-1/4"
          type="date"
        />
        <InputField
          label="Class"
          name="class"
          defaultValue={data?.class}
          register={register}
          error={errors.class}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
          className="w-full md:w-1/4"
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Gender</label>
          <select
            {...register("gender")}
            className="bg-transparent outline-none border-b border-secondary p-2 rounded-md text-sm w-full"
            defaultValue={data?.gender || ""}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.gender?.message && (
            <p className="text-xs text-red-400">{errors.gender.message}</p>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end">
        <button className="button p-2 rounded-md">
          {loading && <LoaderCircle className="animate-spin" />}{" "}
          {type === "create" ? "Create" : "Update"}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
