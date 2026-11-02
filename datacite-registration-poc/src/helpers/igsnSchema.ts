import type { GeoFeature } from '#/components/GeoField'
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

export const toGeoLocations = (features: Array<GeoFeature>) =>
  features.map((f) =>
    f.type === 'point'
      ? {
          geoLocationPoint: {
            pointLongitude: String(f.lng),
            pointLatitude: String(f.lat),
          },
        }
      : {
          geoLocationBox: {
            westBoundLongitude: String(f.west),
            eastBoundLongitude: String(f.east),
            southBoundLatitude: String(f.south),
            northBoundLatitude: String(f.north),
          },
        },
  )

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

const place = z.string().optional() // for later (geoLocationPlace)

const apiGeoLocation = z.union([
  z.object({
    geoLocationPoint: z.object({
      pointLongitude: z.string(),
      pointLatitude: z.string(),
    }),
    geoLocationPlace: place,
  }),
  z.object({
    geoLocationBox: z.object({
      westBoundLongitude: z.string(),
      eastBoundLongitude: z.string(),
      southBoundLatitude: z.string(),
      northBoundLatitude: z.string(),
    }),
    geoLocationPlace: place,
  }),
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
  geoLocations: z.array(geoFeature),
})

export const payloadSchema = schema
  .omit({ geoLocations: true })
  .extend({ geoLocations: z.array(apiGeoLocation) })
