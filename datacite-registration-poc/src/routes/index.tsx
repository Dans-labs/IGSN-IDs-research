import { createFileRoute } from '@tanstack/react-router'
import Form from '#/components/Form'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <Form />
    </div>
  )
}
