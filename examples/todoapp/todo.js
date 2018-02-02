// const {
//     getCtrl,
//     El,
//     T,
//     SVGEl
// } = require('../../source/cycle.js')

//

const newId = (count => () => count++)(0)

const ctrl = getCtrl({})
const action = ctrl.action.bind(ctrl)
const getState = ctrl.getState.bind(ctrl)
const getRender = ctrl.getRender.bind(ctrl)

const switchStatus = action(id => state => ({
    ...state,
    todos: state.todos.map(todo =>
        todo.id !== id
            ? todo
            : {
                ...todo,
                status: todo.status === 'Active' ? 'Completed' : 'Active'
            }
        )
}))

const addTodo = action(text => state => ({
    ...state,
    todos: [
        ...(state.todos || []),
        ...(text ? [{ id: newId(), text, status: 'Active' }] : [])
    ]
}))

const areAllTodosCompleted = state => state.todos.reduce((acc, todo) => acc && todo.status === 'Completed', true)

const toggleAll = action(() => state => ({
    ...state,
    todos: state.todos.map(todo => ({
        ...todo,
        status: areAllTodosCompleted(state) ? 'Active' :  'Completed'
    }))
}))

const removeTodo = action(id => state => ({
    ...state,
    todos: state.todos.filter(todo => todo.id !== id)
}))

const setFilter = action(filter => state => ({ ...state, filter }))

const clearCompleted = action(() => state => ({
    ...state,
    todos: state.todos.filter(todo => todo.status !== 'Completed')
}))

const setEditingTodoId = action(id => state => ({ ...state, editingTodoId: id }))
const unsetEditingTodoId = action(id => state => ({ ...state, editingTodoId: null }))

const newTodoHandler = function() {
    if (event.key === 'Enter') {
        const value = document.getElementById('new-todo').value
        document.getElementById('new-todo').value = ''
        addTodo(value).then(() => {
            document.getElementById('new-todo').focus()
        })
    }
}

//

const TodoApp = ({ todos, filter, editingTodoId }) => {
    const filteredTodos = filter === 'All' ? todos
        : todos.filter(({ status }) => status === filter)
    const todoCount = todos.filter(todo => todo.status === 'Active').length

    return El('DIV', [
        El('SECTION', [
            El('HEADER', [
                El('H1', [T('todos')]),
                El('INPUT', [], { id: 'new-todo', class: 'new-todo', autofocus: true, placeholder: 'What needs to be done?' })
            ], {
                class: 'header',
                onkeyup: 'newTodoHandler()'
            }),
            El('SECTION', [
                El('INPUT', [], {
                    class: 'toggle-all',
                    id: 'toggle-all',
                    type: 'checkbox',
                    checked: !todoCount || undefined,
                    onclick: `toggleAll()`
                }),
                El('LABEL', [T('Mark all as complete')], { for: 'toggle-all' }),
                El('UL',
                    filteredTodos.map(todo => El('LI', [Todo({ ...todo, editingTodoId })], {
                        class: [todo.status === 'Completed' ? 'completed' : '', editingTodoId === todo.id ? 'editing' : ''].join(' ')
                    })),
                    { class: 'todo-list' }
                ),
                El('FOOTER', [
                    El('SPAN', [El('STRONG', [T(todoCount)]), T(' items left')], { class: 'todo-count' }),
                    El('UL', 
                        ['All', 'Active', 'Completed'].map(value => El('LI', [Filter({ selected: filter, value: value })])),
                        { class: 'filters' }
                    ),
                    El('BUTTON', [T('Clear completed')], {
                        class: 'clear-completed',
                        onclick: 'clearCompleted()'
                    })
                ], { class: 'footer' })
            ], {
                class: 'main',
                style: 'display: block;'
            })
        ], {
            id: 'todo-app',
            class: 'todoapp'
        }),
        El('FOOTER', [
            El('P', [T('Double click to edit a todo')]),
            El('P', [
                T('Written by '),
                El('A', [T('Carlos Vázquez')], { href: 'https://github.com/CarlosVazPI' })
            ]),
            El('P', [
                T('Part of '),
                El('A', [T('TodoMVC')], { href: 'http://todomvc.com' })
            ])
        ], { class: 'info' })
    ])
}

Filter = ({ value, selected }) => El('A', [
    T(value)
], {
    href: value === 'All' ? '#/' : `#/${value}`,
    class: value === selected ? 'selected' : undefined,
    onclick: `setFilter('${value}')`
})

Todo = ({ id, status, text, editingTodoId }) => El('DIV', [
    El('INPUT', [], {
        class: 'toggle',
        type: 'checkbox',
        CHECKED: status === 'Completed' || undefined,
        onclick: `switchStatus(${id})`
    }),
    El('LABEL', [T(text)], {
        ondblclick: `setEditingTodoId(${id})`,

    }),
    El('BUTTON', [], {
        class: 'destroy',
        onclick: `removeTodo(${id})`
    })
], { class: 'view' })

//

// Initial state

addTodo('Finish specs')
addTodo('Create more things')
addTodo('Be amazing')
state = setFilter('All')

// 

getRender(TodoApp, document.getElementById('root'))()
