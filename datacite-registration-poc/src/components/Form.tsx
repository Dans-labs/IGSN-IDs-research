import { createFormHook, useField, type AnyFieldApi } from '@tanstack/react-form'
import { FormButton } from '#/components/Buttons'
import { m } from '#/paraglide/messages'
import { schema } from '#/helpers/igsnSchema'
import { useState, type ComponentType, type ReactNode } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { registerIgsn } from '#/api/igsn.functions'
import { fieldContext, formContext } from '#/components/form-context'
import { FormTextField, TextField } from '#/components/Input'

const { useAppForm } = createFormHook({
  fieldComponents: { TextField: FormTextField },
  formComponents: { FormButton },
  fieldContext,
  formContext,
})

export default function Form() {
  const register = useServerFn(registerIgsn)
  const [result, setResult] = useState<Awaited<ReturnType<typeof register>> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      url: '',
      creators: [{ name: '', affiliation: '' }],
      titles: [{ title: '' }],
      publisher: { name: '', identifier: '' },
      publicationYear: new Date().getFullYear(),
    },
    validators: {
      onChange: schema,
    },
    onSubmitInvalid: ({ value, formApi }) => {
      console.log('submit blocked', {
        value,
        formErrors: formApi.state.errors,
        fieldErrors: formApi.state.fieldMeta,
      })
    },
     onSubmit: async ({ value }) => {
      setError(null)
      setResult(null)
      try {
        const parsed = schema.parse(value)
        setResult(await register({ data: parsed }))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="flex flex-col gap-2 max-w-xl"
    >
      <h1>{m.registerAnIGSN()}</h1>

      <form.AppField name="url">
        {(field) => <field.TextField label={m.url()} />}
      </form.AppField>

      <form.AppField name="creators">
        {(field) => (
          <FieldArray
            form={form}
            title={m.creators()}
            field={field}
            fieldConfig={[
              { name: 'name', type: 'TextField' },
              { name: 'affiliation', type: 'TextField' },
            ]}
          />
        )}
      </form.AppField>

      <form.AppField name="titles">
        {(field) => (
          <FieldArray
            form={form}
            title={m.titles()}
            field={field}
            fieldConfig={[{ name: 'title', type: 'TextField' }]}
          />
        )}
      </form.AppField>

      <form.AppField name="publisher.name">
        {(field) => <field.TextField label={`${m.publisher()} ${m.name()}`} />}
      </form.AppField>

      <form.AppField name="publisher.identifier">
        {(field) => (
          <field.TextField
            label={`${m.publisher()} ${m.identifier()}`}
            placeholder="ROR typeahead field..."
          />
        )}
      </form.AppField>

      <form.AppField name="publicationYear">
        {(field) => <field.TextField label={m.publicationYear()} type="number" />}
      </form.AppField>

      <form.AppForm>
        <form.FormButton type="submit" text={m.submit()} />
      </form.AppForm>

      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      {result && <p className="text-green-500">{m.success({id: result.data.id})}</p>}

    </form>
  )
}
 
type FieldConfig = {
  name: SimpleMessageKey
  type: 'TextField' // key of fieldComponents in createFormHook
}

type SimpleMessageKey = {
  [K in keyof typeof m]: {} extends Parameters<(typeof m)[K]>[0] ? K : never
}[keyof typeof m]

type AppFormLike = {
  AppField: ComponentType<{
    name: any
    children: (field: any) => ReactNode
  }>
}

function FieldArray({ form, title, field, fieldConfig }: {
  form: AppFormLike
  title: string
  field: AnyFieldApi
  fieldConfig: FieldConfig[]
}) {
  const items = field.state.value as Record<string, string>[]

  return (
    <div>
      <div>{title}</div>
      {items.map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-sm p-2 mb-2">
          {fieldConfig.map((config) => (
            <form.AppField key={config.name} name={`${field.name}[${i}].${config.name}`}>
              {(subField) => {
                const Component = subField[config.type]
                return <Component label={`${m[config.name]()} ${i + 1}`} />
              }}
            </form.AppField>
          ))}
          {i > 0 && (
            <FormButton onClick={() => field.removeValue(i)} type="button" text={m.remove()} className="mt-2" />
          )}
        </div>
      ))}
      <FormButton
        onClick={() =>
          field.pushValue(Object.fromEntries(fieldConfig.map((c) => [c.name, ''])))
        }
        type="button"
        text={m.addMore()}
      />
    </div>
  )
}