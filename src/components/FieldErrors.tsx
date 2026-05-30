type FieldErrorsProps = {
  errors?: Record<string, string[]>;
  name: string;
};

export function FieldErrors({ errors, name }: FieldErrorsProps) {
  const list = errors?.[name];
  if (!list?.length) return null;
  return (
    <ul className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
      {list.map((msg) => (
        <li key={msg}>{msg}</li>
      ))}
    </ul>
  );
}
