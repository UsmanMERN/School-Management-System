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
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long!" })
    .max(50, { message: "Name must be at most 50 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  oracleNo: z
    .string()
    .min(4, { message: "Oracle Number must be at least 4 characters long!" }),
  registrationNo: z
    .string()
    .min(1, { message: "Registration Number is required!" }),
  designation: z.string().min(1, { message: "Designation is required!" }),
  post: z
    .string()
    .min(3, { message: "Post must be at least 3 characters long!" }),
  payrollNo: z.string().min(1, { message: "Payroll Number is required!" }),
  level: z.string().min(1, { message: "Level is required!" }),
  yearOfService: z
    .number()
    .min(1, { message: "Year of Service must be at least 1!" }),
  teaching: z.boolean(),
  admin: z.boolean(),
  classesTeaching: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "")
        : val,
    z.string().array()
  ),
  subjectsTaught: z.preprocess(
    (val) =>
      typeof val === "string"
        ? val
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== "")
        : val,
    z.string().array()
  ),
  address: z.string().min(1, { message: "Address is required!" }),
  phoneNo: z.string().min(1, { message: "Phone Number is required!" }),
  yearOfExit: z
    .number()
    .min(1, { message: "Year of Exit must be at least 1!" }),
});

type Inputs = z.infer<typeof schema>;

const StaffForm = ({
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
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [loading, setLoading] = useState(false);
  const onSubmit = handleSubmit(async (formData: Inputs) => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/staffs`, {
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
        {type === "create" ? "Create a New Staff" : "Update Staff"}
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
          error={errors.email}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Oracle No"
          name="oracleNo"
          defaultValue={data?.oracleNo}
          register={register}
          error={errors.oracleNo}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Registration No"
          name="registrationNo"
          defaultValue={data?.registrationNo}
          register={register}
          error={errors.registrationNo}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Designation"
          name="designation"
          defaultValue={data?.designation}
          register={register}
          error={errors.designation}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Post"
          name="post"
          defaultValue={data?.post}
          register={register}
          error={errors.post}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Payroll No"
          name="payrollNo"
          defaultValue={data?.payrollNo}
          register={register}
          error={errors.payrollNo}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Level"
          name="level"
          defaultValue={data?.level}
          register={register}
          error={errors.level}
          className="w-full md:w-1/4"
        />
        <InputField
          label="Year of Service"
          name="yearOfService"
          defaultValue={data?.yearOfService}
          register={register}
          error={errors.yearOfService}
          type="number"
          className="w-full md:w-1/4"
        />
        <InputField
          label="Year of Exit"
          name="yearOfExit"
          defaultValue={data?.yearOfExit}
          register={register}
          error={errors.yearOfExit}
          type="number"
          className="w-full md:w-1/4"
        />
        <InputField
          label="Phone No"
          name="phoneNo"
          defaultValue={data?.phoneNo}
          register={register}
          error={errors.phoneNo}
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
        <InputField
          label="Classes Teaching"
          name="classesTeaching"
          defaultValue={data?.classesTeaching?.join(",")}
          register={register}
          error={errors.classesTeaching}
          className="w-full md:w-1/4"
          type="array"
        />
        <InputField
          label="Subjects Teaching"
          name="subjectsTaught"
          defaultValue={data?.subjectsTaught?.join(",")}
          register={register}
          error={errors.subjectsTaught}
          className="w-full md:w-1/4"
          type="array"
        />
        <InputField
          label="Teaching"
          name="teaching"
          defaultValue={data?.teaching}
          register={register}
          error={errors.teaching}
          type="checkbox"
          className="w-full md:w-1/4"
        />
        <InputField
          label="Admin"
          name="admin"
          defaultValue={data?.admin}
          register={register}
          error={errors.admin}
          type="checkbox"
          className="w-full md:w-1/4"
        />
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

export default StaffForm;
