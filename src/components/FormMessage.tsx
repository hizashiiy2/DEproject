type FormMessageProps = {
  message?: string;
};

export function FormMessage({ message }: FormMessageProps) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-600 dark:text-red-400" role="alert">
      {message}
    </p>
  );
}
