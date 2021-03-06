# Cycle
MVC Framework for the front end

## Contents

The module Cycle exposes:

- getCtrl
- El
- T
- SVGEl

## `getCtrl()`

Function that takes the state and returns an object that manages the state through the following methods:

- getState
- action
- getRender
- component

### `getState()`

Function that returns the current state

### `action(params => state => newState)`

Function that takes a definition of an action and returns an updater function

The definition of an action is a function `(...params) => state => newState` that takes some parameters, and then the current state, and returns the new state.

The updater function returned by `action(...)` takes some parameters (that corresponds to the parameters that the definition takes), updates the state and re-renders the view.

The updater function has the following attributes
- `definition`: is the definition function passed to action that created the updater function.
- `onlyUpdate`: can be used with the same parameters as the updater itself, but doesn't re-render the view (only updates the state). Returns the updated state. 

When called, the updater function returns the render promise.

### `getRender(state => vDOM, host)`

Function that takes a builder function and a host node, and returns a render function.

The builder function takes a state and returns the corresponding virtual DOM. The host is the node that should be the parent of the root node returned by the builder.

The render function renders the virtual DOM build from the state passed to the builder function as a child of the host node. The render function takes no parameters and returns the render promise.

### Render promise

It is a promise such that the resolve function takes the rendered node root of the view, and the reject function doesn't take any argument. This promise is resolved if the render produces a DOM output, and is rejected otherwise.

## Nodes

### El(tag, children, attributes)

`tag` is an uppercase string indicating the tag of the element.
`children` is a list of child virtual Dom nodes.
`attributes` is an object containing the attributes to be added to the element. Attributes in lower case will be added via `setAttribute`, while attributes in upper case (or just capital case) will be added directly to the node.

### T

### SVGEl