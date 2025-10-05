// Additional popup utilities for Chrome extension

// Simple state management
const state = {
  events: [],
  isLoading: false
}

// Simple React-like functions (minimal implementation)
const React = {
  createElement: (type, props, ...children) => {
    const element = document.createElement(type)
    
    if (props) {
      Object.keys(props).forEach(key => {
        if (key === 'className') {
          element.className = props[key]
        } else if (key === 'onClick') {
          element.addEventListener('click', props[key])
        } else if (key === 'onChange') {
          element.addEventListener('change', props[key])
        } else if (key.startsWith('on')) {
          const eventName = key.toLowerCase().substring(2)
          element.addEventListener(eventName, props[key])
        } else {
          element.setAttribute(key, props[key])
        }
      })
    }
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child))
      } else if (child) {
        element.appendChild(child)
      }
    })
    
    return element
  },
  
  useState: (initialValue) => {
    const state = { value: initialValue }
    const setState = (newValue) => {
      state.value = typeof newValue === 'function' ? newValue(state.value) : newValue
    }
    return [state.value, setState]
  },
  
  useEffect: (callback, deps) => {
    // Simple effect implementation
    callback()
  },
  
  StrictMode: ({ children }) => children
}

// Export for compatibility
window.React = React
window.state = state