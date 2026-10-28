import { Button } from '@base-ui/react/button';

type FormButtonProps = Button.Props & {
  text: string;
  className?: string;
};

export function FormButton({ text, className, ...props }: FormButtonProps) {
  return (
    <Button
      className={`bg-teal-700 text-white rounded-sm py-1 px-4 ${className ?? ''}`}
      {...props}
    >
      {text}
    </Button>
  );
}