export const rorTextSearch = async (query: string) => {
  const url = `https://api.ror.org/organizations?query=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  const json = await res.json()
  if (json && json.number_of_results > 0) {
    return json.items.map((item: any) => ({
      label:
        item.names.filter(
          (name: any) => name.types.indexOf('ror_display') !== -1,
        )[0].value || 'Unknown',
      value: item.id,
    }))
  }
  return undefined
}
