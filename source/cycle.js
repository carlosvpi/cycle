const getKey = ({ key }, index) => key || index

const mount = (data, node, parentNode) => {
    if (node && node.mvcData === data) {
        return node
    }
    const tagName = node && node.tagName || null
    const oldChildren = (node && node.mvcData && node.mvcData.children) || []
    const { el, children, __proto__, ...attrs} = data
    const isPreserved = tagName === el
    const currentNode = isPreserved ? node : __proto__.create.apply(data)

    data.node = currentNode
    currentNode.mvcData = data

    if (__proto__.hasAttributes) {
        const attrKeys = Object.keys(attrs)
        const attrKeysLength = attrKeys.length
        const oldAttributesKeys = currentNode.getAttributeNames()
        const oldAttributesKeysLength = oldAttributesKeys.length
        let attribute

        // Remove old attributes
        for (let i = 0; i < oldAttributesKeysLength; i++) {
            attribute = oldAttributesKeys[i]
            if (!attrKeys.includes(attribute) || attrs[attribute] === undefined) {
                currentNode.removeAttribute(attribute)
            }
        }

        // Set new attributes
        for (let i = 0; i < attrKeysLength; i++) {
            attribute = attrKeys[i]
            if (attrs[attribute] !== undefined) {
                currentNode.setAttribute(attribute, attrs[attribute])
            }
        }        
    }

    if (__proto__.canHaveChildren) {
        const childrenLength = children.length
        const childrenKeys = children.map(getKey)
        const childrenKeysLength = children.length
        const oldChildrenKeys = oldChildren.map(getKey)
        const oldChildrenLength = oldChildren.length

        // Remove or update old children
        for (let i = 0; i < oldChildrenLength; i++) {
            if (!childrenKeys.includes(oldChildren[i].key || i)) {
                currentNode.removeChild(oldChildren[i].node)
            } else if (isPreserved) {
                mount(children[i], oldChildren[i].node, currentNode)
            } else {
                mount(children[i], null, currentNode)
            }
        }

        /* TODO: Take care of the KEYS */

        // Add children
        for (let i = 0; i < childrenKeysLength; i++) {
            if (!oldChildrenKeys.includes(children[i].key || i)) {
                mount(children[i], null, currentNode)
            // } else {
            //     /* Careful with this line... needs test */
            //     mount(children[i], oldChildren[i].node, currentNode)
            }
        }

        // Put children in order
        for (let i = 0; i < childrenLength; i++) {
            currentNode.appendChild(children[i].node)
        }
    }

    // Insert into the DOM
    if (!node) {
        parentNode.appendChild(currentNode)
    } else if (!isPreserved) {
        parentNode.replaceChild(currentNode, node)
    }

    // Call onMount
    if (attrs.onmount) {
        attrs.onmount(currentNode, data)
    }

    return currentNode
}

const ElProto = {
    create: function() { return document.createElement(this.el) },
    mount: function(host) { host.appendChild(this.node) },
    canHaveChildren: true,
    hasAttributes: true
}

const El = (el, children, attr) => {
    const element = {
        el,
        children,
        ...attr
    }
    element.__proto__ = ElProto
    return element
}

const TProto = {
    create: function() { return document.createTextNode(this.text) },
    mount: function(host) { host.appendTextNode(this.node) },
    canHaveChildren: false,
    hasAttributes: false
}

const T = text => {
    const textElement = { text }
    textElement.__proto__ = TProto
    return textElement
}

const SVGElProto = {
    create: function(host) { return host.appendElementNS('http://www.w3.org/2000/svg', this.el) },
    mount: function(host) { host.appendChild(this.node) },
    canHaveChildren: true,
    hasAttributes: true
}

const SVGEl = (el, children, attr) => {
    const element = {
        el,
        children,
        ...attr
    }
    element.__proto__ = SVGElProto
    return element
}

const ctrlProto = {
    getState: function getState() {
        return this.state
    },
    action: function action(def) {
        const actionInstance = params => {
            this.state = def(params)(this.state)
            return this.render && this.render()
        }
        actionInstance.definition = def
        return actionInstance
    },
    getRender: function getRender(builder, host) {
        let node = null
        return this.render = this.render || (() => {
            return new Promise((resolve, reject) => {
                window.requestAnimationFrame(() => {
                    node = mount(builder(this.state), node, host)
                    if (node) {
                        resolve(node)
                    } else {
                        reject()
                    }
                })
            })
        })
    },
    component: function component(f) {
        let values = {}
        return input => {
            const key = JSON.stringify(input)
            if (values[key] !== undefined) {
                return values[key]
            } else {
                return values[key] = f(input)
            }
        }
    }
}

const getCtrl = state => {
    const ctrl = { state }
    ctrl.__proto__ = ctrlProto
    return ctrl
}

const cycle = {
    getCtrl,
    El,
    T,
    SVGEl
}

if (typeof module !== 'undefined') {
    module.exports = cycle
} else {
    window.cycle = cycle
}