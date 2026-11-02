import { Input } from '@base-ui/react/input'
import { m } from '#/paraglide/messages'
import { useFieldContext } from '#/components/form-context'
import { useDebounce } from 'use-debounce'
import { useState } from 'react'
import { Combobox } from '@base-ui/react/combobox'
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/solid'
import type { UseQueryResult } from '@tanstack/react-query'

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
          className={`p-1 border rounded-sm text-base 
            ${inValid ? 'border-red-500' : 'border-gray-300'}
            ${props.disabled ? 'bg-gray-100 text-gray-500' : ''}
          `}
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
}: Omit<
  TextFieldProps,
  'inValid' | 'value' | 'defaultValue' | 'name' | 'onChange' | 'onBlur'
>) {
  const field = useFieldContext<string | number>()
  const { isTouched, isValid } = field.state.meta

  return (
    <TextField
      {...props}
      label={label}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      inValid={isTouched && !isValid}
    />
  )
}

type Item = { value: string; label: string }

type TypeAheadFieldProps = Omit<
  TextFieldProps,
  'inValid' | 'value' | 'defaultValue' | 'name' | 'onChange' | 'onBlur'
> & {
  useTypeAhead: (query: string) => UseQueryResult<any, Error>
  onItemSelect?: (item: Item | null) => void
  valueSelector: 'value' | 'label'
}

export function TypeAheadField({
  label,
  useTypeAhead,
  onItemSelect,
  valueSelector,
  ...props
}: TypeAheadFieldProps) {
  const field = useFieldContext<string>()

  const [inputValue, setInputValue] = useState('')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [debouncedQuery] = useDebounce(inputValue, 400)

  // hook called at top level, every render: this is fine
  const { data = [], isFetching } = useTypeAhead(debouncedQuery)

  // keep the selected item in the list so Base UI doesn't drop it
  const items = selectedItem
    ? [selectedItem, ...data.filter((i: any) => i.value !== selectedItem.value)]
    : data

  const { isTouched, isValid } = field.state.meta

  return (
    <Combobox.Root
      items={items}
      filter={null}
      value={selectedItem}
      onValueChange={(item: Item | null) => {
        setSelectedItem(item)
        field.handleChange(item?.[valueSelector] ?? '')
        onItemSelect?.(item)
      }}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      itemToStringLabel={(item: Item) => item.label}
    >
      <div className="flex flex-col gap-1 text-xs">
        <label>{label}</label>
        <Combobox.InputGroup
          className={`p-1 border rounded-sm text-base relative ${
            isTouched && !isValid ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <Combobox.Input
            name={field.name}
            onBlur={field.handleBlur}
            className="h-full w-full outline-none placeholder:text-neutral-500"
            {...props}
          />
          <Combobox.Clear
            aria-label={m.clear()}
            className="absolute top-0 right-0 flex h-full w-8 items-center justify-center"
          >
            <XMarkIcon className="size-4" />
          </Combobox.Clear>
        </Combobox.InputGroup>
      </div>

      {!isValid && isTouched && (
        <span role="alert" className="text-sm text-red-500">
          {m.inValid()}
        </span>
      )}

      <Combobox.Portal>
        <Combobox.Positioner sideOffset={4} className="z-50 outline-none">
          <Combobox.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] border border-gray-300 bg-white text-neutral-900 shadow-md rounded-sm">
            <Combobox.Empty>
              <div className="p-2">
                {isFetching
                  ? m.loading()
                  : !inputValue
                    ? m.startTyping()
                    : m.noResults()}
              </div>
            </Combobox.Empty>
            <Combobox.List className="max-h-60 overflow-y-auto overscroll-contain py-1 outline-none data-[empty]:p-0">
              {(item: Item) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className="grid cursor-default select-none grid-cols-[1rem_1fr] items-center gap-2 px-1 py-1 text-sm outline-none data-[highlighted]:bg-neutral-900 data-[highlighted]:text-white"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-4" />
                  </Combobox.ItemIndicator>
                  <span className="col-start-2">{item.label}</span>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  )
}
