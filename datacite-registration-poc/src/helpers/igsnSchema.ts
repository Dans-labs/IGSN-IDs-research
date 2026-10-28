import { z } from 'zod'

export type igsnForm = {
  url: string
  creators: [
    {
      name: string
      nameType?: string
    },
  ]
  titles: [
    {
      title: string
      lang?: string
      titleType?: 'AlternativeTitle' | 'Subtitle' | 'TranslatedTitle' | 'Other'
    },
  ]
  publisher: {
    name: string
    publisherIdentifier: string
    publisherIdentifierScheme: 'ROR'
    schemeUri: 'https://ror.org'
  }
  publicationYear: number
  types: {
    resourceTypeGeneral: 'PhysicalObject'
  }
}

export const schema = z.object({
  url: z.string().min(1),
  creators: z
    .array(
      z.object({ name: z.string().min(1), affiliation: z.string().min(1) }),
    )
    .min(1),
  titles: z.array(z.object({ title: z.string().min(1) })).min(1),
  publisher: z.object({
    name: z.string().min(1),
    identifier: z.string().min(1),
  }),
  // Inputs return strings, so coerce to a number
  publicationYear: z.coerce
    .number<number>()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1),
})
