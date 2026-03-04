import { useState, useCallback, useMemo } from 'react'
import './index.css'

const FILTERS = ['All', 'Active', 'Completed']

let nextId = 1

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 6L5 9L10 3"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M1.75 3.5h10.5M5.25 3.5V2.333a.583.583 0 0 1 .583-.583h2.334a.583.583 0 0 1 .583.583V3.5m1.167 0v7.583a.583.583 0 0 1-.584.584H4.667a.583.583 0 0 1-.584-.584V3.5h7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TodoItem({ todo, onToggle, onDelete }) {
  const [removing, setRemoving] = useState(false)

  const handleDelete = () => {
    setRemoving(true)
    setTimeout(() => onDelete(todo.id), 230)
  }

  return (
    <li className={`todo-item${todo.completed ? ' completed' : ''}${removing ? ' removing' : ''}`}>
      <button
        className={`checkbox-btn${todo.completed ? ' checked' : ''}`}
        onClick={() => onToggle(todo.id)}
        aria-label={todo.completed ? 'Mark as active' : 'Mark as completed'}
      >
        {todo.completed && <CheckIcon />}
      </button>

      <span className="todo-text">{todo.text}</span>

      <button
        className="delete-btn"
        onClick={handleDelete}
        aria-label="Delete todo"
      >
        <TrashIcon />
      </button>
    </li>
  )
}

function EmptyState({ filter }) {
  const messages = {
    All: { icon: '✨', text: 'No todos yet. Add one above!' },
    Active: { icon: '🎉', text: 'Nothing left to do!' },
    Completed: { icon: '📋', text: 'Nothing completed yet.' },
  }
  const { icon, text } = messages[filter] || messages.All

  return (
    <div className="empty-state">
      <span className="empty-state-icon">{icon}</span>
      <p>{text}</p>
    </div>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: nextId++, text: 'Build something amazing 🚀', completed: false },
    { id: nextId++, text: 'Review pull requests', completed: true },
  ])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('All')

  const addTodo = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    setTodos(prev => [...prev, { id: nextId++, text, completed: false }])
    setInputValue('')
  }, [inputValue])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTodo()
  }

  const toggleTodo = useCallback((id) => {
    setTodos(prev =>
      prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    )
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearCompleted = () => {
    setTodos(prev => prev.filter(t => !t.completed))
  }

  const filteredTodos = useMemo(() => {
    if (filter === 'Active') return todos.filter(t => !t.completed)
    if (filter === 'Completed') return todos.filter(t => t.completed)
    return todos
  }, [todos, filter])

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length
  const activeCount = totalCount - completedCount
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
  const hasCompleted = completedCount > 0

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <span className="header-emoji">✅</span>
        <h1>My Todo List</h1>
        <p>Stay focused. Get things done.</p>
      </header>

      {/* Main Card */}
      <main className="card">
        {/* Input */}
        <div className="input-row">
          <input
            className="todo-input"
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            maxLength={200}
            aria-label="New todo text"
          />
          <button
            className="add-btn"
            onClick={addTodo}
            disabled={!inputValue.trim()}
            aria-label="Add todo"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            <span>Add</span>
          </button>
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="progress-container">
            <div className="progress-label">
              <span>Progress</span>
              <span>{progressPct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="filter-bar" role="group" aria-label="Filter todos">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === 'Active' && activeCount > 0 && ` (${activeCount})`}
              {f === 'Completed' && completedCount > 0 && ` (${completedCount})`}
            </button>
          ))}
        </div>

        {/* Stats */}
        {totalCount > 0 && (
          <div className="stats-bar">
            <span className="stats-text">
              <span>{activeCount}</span> task{activeCount !== 1 ? 's' : ''} remaining
            </span>
            {hasCompleted && (
              <button className="clear-btn" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </div>
        )}

        {/* List */}
        {filteredTodos.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="todo-list">
            {filteredTodos.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
