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

const lng = z.number().min(-180).max(180)
const lat = z.number().min(-90).max(90)
const geoFeature = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('point'), lng, lat }),
  z
    .object({
      id: z.string(),
      type: z.literal('bbox'),
      west: lng,
      east: lng,
      south: lat,
      north: lat,
    })
    .refine((b) => b.south <= b.north, 'south must be ≤ north'),
])

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
  locations: z.array(geoFeature),
})
