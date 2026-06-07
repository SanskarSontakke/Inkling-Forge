import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-4 font-label">
      <h1 className="font-headline text-2xl uppercase border-b-2 border-border-color pb-2">Supabase Integration Test</h1>
      {todos && todos.length > 0 ? (
        <ul className="list-disc list-inside space-y-1">
          {todos.map((todo: any) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-foreground/50 uppercase">No todos found or todos table is empty.</p>
      )}
    </div>
  )
}
