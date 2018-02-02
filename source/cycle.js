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
        let attributeKey
        let isDirectAttribute

        // Remove old attributes
        for (let i = 0; i < oldAttributesKeysLength; i++) {
            attributeKey = oldAttributesKeys[i]
            isDirectAttribute = attributeKey.charAt(0) === attributeKey.charAt(0).toUpperCase()
            if (!attrKeys.includes(attributeKey) || attrs[attributeKey] === undefined) {
                if (isDirectAttribute) {
                    currentNode[attributeKey.toLowerCase()] = undefined
                } else {
                    currentNode.removeAttribute(attributeKey)
                }
            }
        }

        // Set new attributes
        for (let i = 0; i < attrKeysLength; i++) {
            attributeKey = attrKeys[i]
            isDirectAttribute = attributeKey.charAt(0) === attributeKey.charAt(0).toUpperCase()
            if (attrs[attributeKey] !== undefined) {
                if (isDirectAttribute) {
                    currentNode[attributeKey.toLowerCase()] = attrs[attributeKey]
                } else {
                    currentNode.setAttribute(attributeKey, attrs[attributeKey])
                }
            } else if (isDirectAttribute) {
                currentNode[attributeKey.toLowerCase()] = undefined
            }
        }        
    }

    if (__proto__.canHaveChildren) {
        const childrenLength = children.length
        const childrenKeys = children.map(getKey)
        const childrenKeysLength = children.length
        const oldChildrenKeys = oldChildren.map(getKey)
        const oldChildrenLength = oldChildren.length
        const childrenByKey = children.reduce((acc, child, i) => (acc[child.key || i] = child, acc), {})
        let key

        if (attrs.id === 'main') {
            // debugger
        }

        // Remove or update old children
        for (let i = 0; i < oldChildrenLength; i++) {
            key = oldChildren[i].key || i
            if (!childrenKeys.includes(key)) {
                currentNode.removeChild(oldChildren[i].node)
            } else if (isPreserved) {
                mount(childrenByKey[key], oldChildren[i].node, currentNode)
            } else {
                mount(childrenByKey[key], null, currentNode)
            }
        }

        /* TODO: Take care of the KEYS */

        // Add children
        for (let i = 0; i < childrenKeysLength; i++) {
            key = children[i].key || i
            if (!oldChildrenKeys.includes(key)) {
                mount(childrenByKey[key], null, currentNode)
            // } else {
            //     /* Careful with this line... needs test */
            //     /* Probably redundant */
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
            actionInstance.onlyUpdate(params)
            return this.render && this.render()
        }
        actionInstance.definition = def
        actionInstance.onlyUpdate = params => {
            return this.state = def(params)(this.state)
        }
        return actionInstance
    },
    getRender: function getRender(builder, host) {
        let node = null
        return this.render = this.render || (() => {
            const vDom = builder(this.state)
            return new Promise((resolve, reject) => {
                window.requestAnimationFrame(() => {
                    node = mount(vDom, node, host)
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