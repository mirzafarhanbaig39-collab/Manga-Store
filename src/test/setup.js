import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

Element.prototype.scrollIntoView = () => {}
window.scrollTo = () => {}

afterEach(() => {
  cleanup()
  localStorage.clear()
})
