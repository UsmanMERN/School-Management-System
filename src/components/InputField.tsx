
type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: any;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  inputProps,
  className,
}: InputFieldProps) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        type={type}
        {...register(name, {
          valueAsNumber: type === "number",
          setValueAs:
            type === "date"
              ? (value: string) => new Date(value).toISOString()
              : type === "checkbox"
              ? (value: string) => (value === "true" ? true : false)
              : type === "array"
              ? (value: string) => value.split(",").map((x: string) => x.trim())
              : (value: any) => value,
        })}
        className="bg-transparent outline-none border-b border-secondary p-2 rounded-md text-sm w-full"
        {...inputProps}
        {...(type === "checkbox"
          ? {
              defaultChecked: Boolean(defaultValue),
              onChange: (e) => {
                register(name).onChange({
                  target: {
                    name,
                    value: e.target.checked,
                  },
                });
              },
            }
          : type !== "date"
          ? { defaultValue: defaultValue }
          : {
              defaultValue: new Date(defaultValue || Date.now())
                .toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
                .split("/")
                .reverse()
                .join("-"),
            })}
      />
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
