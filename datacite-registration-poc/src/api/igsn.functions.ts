import { createServerFn } from '@tanstack/react-start'
import { schema } from '#/helpers/igsnSchema'

export const registerIgsn = createServerFn({ method: 'POST' })
  .validator(schema)
  .handler(async ({ data }) => {
    const formattedData = {
      data: {
        attributes: {
          prefix: process.env.IGSN_PREFIX,
          state: "draft",
          types: { 
            resourceTypeGeneral: "PhysicalObject",
          },
          ...data
        },
        type: "dois",
      }
    }
    const res = await fetch(`${process.env.IGSN_API_URL}/dois`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.IGSN_API_KEY}`,
      },
      body: JSON.stringify(formattedData),
    })

    if (!res.ok) {
      // Log details server-side, but don't leak upstream errors or headers to the client
      console.error('IGSN API error', res.status, await res.text())
      throw new Error(`Registration failed (${res.status})`)
    }

    return await res.json()
  })