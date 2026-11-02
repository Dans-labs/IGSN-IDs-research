import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { rorTextSearch } from '#/integrations/tanstack-query/ror'

export const useRor = (query: string) =>
  useQuery({
    queryKey: ['ror', query],
    queryFn: () => rorTextSearch(query), // must return Array<{ value, label }>
    enabled: query.trim().length >= 2,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  })
