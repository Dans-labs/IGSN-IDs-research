import { Input } from '@base-ui/react/input'
import { m } from '#/paraglide/messages'
import { useFieldContext } from '#/components/form-context'

type TextFieldProps = Input.Props & {
  label: string
  inValid?: boolean
}

// Presentational: usable anywhere (e.g. FieldArray items)
export function TextField({ label, inValid, ...props }: TextFieldProps) {
  return (
    <div>
      <label className="text-xs flex flex-col gap-1">
        {label}
        <Input
          aria-invalid={inValid || undefined}
          className={`p-1 border rounded-sm text-base ${
            inValid ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
      </label>
      {inValid && (
        <span role="alert" className="text-sm text-red-500">
          {m.inValid()}
        </span>
      )}
    </div>
  )
}

// Bound to the TanStack field from <form.AppField>
export function FormTextField({
  label,
  ...props
}: Omit<TextFieldProps, 'inValid' | 'value' | 'defaultValue' | 'name' | 'onChange' | 'onBlur'>) {
  const field = useFieldContext<string | number>()
  const { isTouched, isValid } = field.state.meta

  return (
    <TextField
      {...props}
      label={label}
      name={field.name}
      value={field.state.value ?? ''}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      inValid={isTouched && !isValid}
    />
  )
}