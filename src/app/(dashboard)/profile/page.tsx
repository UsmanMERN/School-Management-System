"use client";

import { useEffect, useState } from "react";
import { useRole, useUserData } from "@/store";
import apiClient from "@/lib/apiclient";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoaderCircle, Save, Upload } from "lucide-react";
import Image from "next/image";

const Profile = () => {
  const router = useRouter();
  const role = useRole((state) => state.role);
  const { userData, setUserData } = useUserData();
  const [roleState, setRoleState] = useState(role);
  const [user, setUser] = useState<typeof userData>({
    ...userData,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    toast.dismiss()
    const fetchUser = async () => {
      try {
        const res = await apiClient.get("/profile");
        setUser(res.data);
        setUserData(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (!userData?.id) fetchUser();
  }, [userData?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post("/profile", {
        data: user,
        role,
        roleState,
      });
      if (res.status === 200) {
        toast.success("Profile updated!");
        if (res.data?.roleChange) {
          toast.loading("Logging out...");
          router.push("/logout");
          return;
        }
        setUser(res.data);
        setUserData(res.data);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Update failed");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setUser((prev) => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (role === "ADMIN") {
    return (
      <div className="bg-primary-light p-4 rounded-md flex flex-col m-4 mt-0">
        <h1 className="text-xl font-bold mb-4">Admin Profile</h1>
        <label className="block mb-1 font-bold mx-auto text-center text-large">
          Switch Role
        </label>
        <div className="mb-4 flex justify-center gap-6 w-full p-2">
          <div
            className={
              "w-[40%] border cursor-pointer rounded-md h-20 lg:h-40 flex justify-center items-center font-bold md:text-large " +
              (roleState === "ADMIN"
                ? "border-accent-3 bg-accent-3 text-primary"
                : " opacity-60 select-none")
            }
            onClick={() => setRoleState("ADMIN")}
          >
            ADMIN
          </div>
          <div
            className={
              "w-[40%] border cursor-pointer rounded-md h-20 lg:h-40 flex justify-center items-center font-bold md:text-large " +
              (roleState !== "ADMIN"
                ? "border-accent-3 bg-accent-3 text-primary"
                : " opacity-60 select-none")
            }
            onClick={() =>
              setRoleState(userData?.teaching ? "TEACHER" : "NONTEACHING")
            }
          >
            STAFF
          </div>
        </div>
        <div className="w-full flex justify-end">
          <button
            className="button bg-primary text-white px-4 py-2 rounded"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? <LoaderCircle className="animate-spin" /> : <Save />}{" "}
            Update Profile
          </button>
        </div>
      </div>
    );
  }

  // STAFF, STUDENT, PARENT
  return (
    <div className="flex flex-col lg:flex-row bg-primary-light p-4 gap-3 rounded-md m-4 mt-0">
      {role !== "PARENT" && (
        <label
          htmlFor="image"
          className="flex items-center justify-center w-full lg:w-1/2 h-60 lg:h-full rounded-md overflow-hidden relative bg-black"
        >
          <Image
            width={200}
            height={400}
            src={user?.image || "/avatar.png"}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 w-full z-10 h-full flex items-center justify-center cursor-pointer p-2 rounded-md bg-primary-light opacity-0 hover:opacity-60">
            <Upload className="size-8" />
          </div>
          <input
            type="file"
            accept="image/*"
            id="image"
            hidden
            onChange={handleFileChange}
            className="input"
          />
        </label>
      )}
      <form
        className="flex flex-col gap-4 h-full w-full"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
        }}
      >
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            name="name"
            value={user?.name}
            onChange={handleChange}
            className="input p-2 border-b-2 border-primary outline-none rounded-md w-full bg-transparent"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">
            {role === "STUDENT" ? "Parent's " : ""}Phone Number
          </label>
          <input
            name={role === "STUDENT" ? "parentNo" : "phoneNo"}
            value={user?.phoneNo || user?.parentNo}
            onChange={role !== "STUDENT" ? handleChange : () => console.log("Nice Try")}
            className="input p-2 border-b-2 border-primary outline-none rounded-md w-full bg-transparent"
            disabled={role === "STUDENT"}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Address</label>
          <input
            name="address"
            value={user?.address}
            onChange={handleChange}
            className="p-2 border-b-2 border-primary outline-none rounded-md w-full bg-transparent"
          />
        </div>
        {userData?.admin && (
          <div className="flex justify-center items-center w-full gap-6">
            <div
              className={
                "w-[40%] border cursor-pointer rounded-md h-20 lg:h-40 flex justify-center items-center font-bold md:text-large " +
                (roleState === "ADMIN"
                  ? "border-accent-3 bg-accent-3 text-primary"
                  : "opacity-60 select-none")
              }
              onClick={() => setRoleState("ADMIN")}
            >
              ADMIN
            </div>
            <div
              className={
                "w-[40%] border cursor-pointer rounded-md h-20 lg:h-40 flex justify-center items-center font-bold md:text-large " +
                (roleState !== "ADMIN"
                  ? "border-accent-3 bg-accent-3 text-primary"
                  : "opacity-60 select-none")
              }
              onClick={() =>
                setRoleState(userData?.teaching ? "TEACHER" : "NONTEACHING")
              }
            >
              STAFF
            </div>
          </div>
        )}
        <div className="h-full w-full flex items-end justify-end">
          <button
            className="button bg-primary text-white px-4 py-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? <LoaderCircle className="animate-spin" /> : <Save />}{" "}
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
