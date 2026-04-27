type FormFieldProps = {
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  value: string;
};

export function FormField({
  label,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: FormFieldProps) {
  return (
    <label className="block text-base font-extrabold text-slate-600" htmlFor={name}>
      {label}
      <input
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-base font-semibold text-slate-900 shadow-[0_3px_10px_rgba(15,23,42,0.07)] outline-none transition placeholder:text-slate-300 focus:border-[#3481ff] focus:ring-4 focus:ring-blue-100"
        id={name}
        name={name}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}
