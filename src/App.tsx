import { generateClient } from 'aws-amplify/api'
import './App.css'
import { type Schema } from '../amplify/data/resource'
import { useOptimistic, Suspense, useTransition } from 'react'
import { useApi } from 'react-promise-cache'
import { useAutoAnimate } from '@formkit/auto-animate/react'

const client = generateClient<Schema>()

function TodoList() {
  const [isPending, startTransition] = useTransition()
  const fetchTodos = useApi(client.models.Todo.list)
  const { data } = fetchTodos.use()
  const [todos, setOptimisticTodos] = useOptimistic(data)
  const [animationParent] = useAutoAnimate()

  return <>
    <div >
      <button disabled={isPending} onClick={async () => {
        startTransition(async () => {
          const newName = window.prompt("New todo name") ?? ""
          setOptimisticTodos([...data, { id: "", createdAt: "", updatedAt: "", content: newName }])
          await client.models.Todo.create({
            content: newName
          })
          fetchTodos.evict()
        })
      }}>
        Add todo
      </button>
      <ul ref={animationParent}>
        {todos.map(todo => <li onClick={() => {
          startTransition(async () => {
            setOptimisticTodos(todos.filter(t => t.id !== todo.id))
            await client.models.Todo.delete({
              id: todo.id
            })
            fetchTodos.evict()
          })
        }} key={todo.id}>{todo.content}</li>)}
      </ul>
    </div>
  </>
}

function App() {
  return (
    <>
      <h1>Todo list</h1>
      <Suspense fallback={<div>Loading todo list</div>}>
        <TodoList />
      </Suspense>
    </>
  )
}

export default App
