const ctrl = getCtrl([])
const action = ctrl.action.bind(ctrl)
const getState = ctrl.getState.bind(ctrl)
const getRender = ctrl.getRender.bind(ctrl)

const remove = action(id => state => state.filter(item => item.id !== id))
const add = action(id => state => [...state, { id }])
const toggle = action(id => state => state.map(toggleItem(id)))
const toggleItem = id => item => id === item.id
	? ({ ...item, CHECKED: item.CHECKED ? undefined : true })
	: item

add(1)
add(2)
add(3)

const TwoCheckboxes = ids => El('DIV', ids.map(({ id, CHECKED }) => 
	El('DIV', [
		T(id),
		El('INPUT', [], {
			type: 'checkbox',
			CHECKED,
			ONCHANGE: () => toggle(id)
		}),
		El('BUTTON', [T('Remove')], { ONCLICK: () => remove(id) })
	], {
		id,
		key: id
	})
), { id: 'main' })

getRender(TwoCheckboxes, document.getElementById('root'))()
