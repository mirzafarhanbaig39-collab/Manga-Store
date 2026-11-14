import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App.jsx'

describe('Mirza storefront', () => {
  beforeEach(() => localStorage.clear())

  it('shows the brand hero and featured collection', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /everyday finds\./i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /pieces to live with/i })).toBeInTheDocument()
    expect(screen.getByText('Kanso Ceramic Set')).toBeInTheDocument()
  })

  it('filters the collection by category', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(within(document.getElementById('collection')).getByRole('button', { name: 'Wellness', exact: true }))
    expect(within(document.getElementById('collection')).getByRole('button', { name: 'Mizu Daily Bottle' })).toBeInTheDocument()
    expect(screen.queryByText('Kanso Ceramic Set')).not.toBeInTheDocument()
  })

  it('includes an electronics collection with filterable products', async () => {
    const user = userEvent.setup()
    render(<App />)
    const collection = document.getElementById('collection')
    await user.click(within(collection).getByRole('button', { name: 'Electronics', exact: true }))
    expect(screen.getByText('Studio Wireless Headphones')).toBeInTheDocument()
    expect(screen.getByText('Arc Rechargeable Lamp')).toBeInTheDocument()
    expect(screen.queryByText('Kanso Ceramic Set')).not.toBeInTheDocument()
  })

  it('searches products by name', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getAllByRole('textbox', { name: /search products|search the collection/i })[0], 'Mizu')
    expect(within(document.getElementById('collection')).getByRole('button', { name: 'Mizu Daily Bottle' })).toBeInTheDocument()
    expect(screen.queryByText('Kanso Ceramic Set')).not.toBeInTheDocument()
  })

  it('offers product search suggestions and applies the selected result', async () => {
    const user = userEvent.setup()
    render(<App />)
    const desktopSearch = document.querySelector('.desktop-search')
    const input = within(desktopSearch).getByRole('textbox', { name: 'Search products' })
    await user.type(input, 'Mizu')
    const suggestion = within(desktopSearch).getByRole('option', { name: /Mizu Daily Bottle/ })
    await user.click(suggestion)
    expect(screen.getByText('Mizu Daily Bottle')).toBeInTheDocument()
    expect(screen.queryByText('Kanso Ceramic Set')).not.toBeInTheDocument()
  })

  it('opens a curated new arrivals collection', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Shop Just arrived' }))
    expect(screen.getByRole('heading', { name: /new arrivals/i })).toBeInTheDocument()
    expect(screen.getByText('Arc Stoneware Vase')).toBeInTheDocument()
    expect(screen.queryByText('Kanso Ceramic Set')).not.toBeInTheDocument()
  })

  it('adds a product to the bag and updates quantity and subtotal', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = screen.getByText('Kanso Ceramic Set').closest('article')
    await user.click(within(card).getByRole('button', { name: /add to bag/i }))
    await user.click(screen.getByRole('button', { name: /shopping bag, 1 items/i }))
    expect(screen.getByRole('dialog', { name: 'Shopping bag' })).toBeInTheDocument()
    expect(within(screen.getByRole('dialog', { name: 'Shopping bag' })).getAllByText('$68.00')).toHaveLength(2)
    const increase = screen.getByRole('button', { name: /increase kanso ceramic set quantity/i })
    await user.click(increase)
    expect(within(increase.parentElement).getByText('2')).toBeInTheDocument()
    expect(within(screen.getByRole('dialog', { name: 'Shopping bag' })).getAllByText('$136.00')).toHaveLength(2)
  })

  it('toggles a product in the wishlist and persists it', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = screen.getByText('Kanso Ceramic Set').closest('article')
    await user.click(within(card).getByRole('button', { name: /add kanso ceramic set to wishlist/i }))
    expect(localStorage.getItem('mirza-wishlist')).toContain('kanso-ceramic-set')
    await user.click(screen.getByRole('button', { name: /wishlist, 1 items/i }))
    expect(screen.getByRole('heading', { name: /your saved pieces/i })).toBeInTheDocument()
    expect(screen.getByText('Kanso Ceramic Set')).toBeInTheDocument()
  })

  it('opens quick view and supports adding its product to the bag', async () => {
    const user = userEvent.setup()
    render(<App />)
    const card = screen.getByText('Kanso Ceramic Set').closest('article')
    await user.click(within(card).getByRole('button', { name: /quick view/i }))
    expect(screen.getByRole('dialog', { name: 'Quick view: Kanso Ceramic Set' })).toBeInTheDocument()
    await user.click(within(screen.getByRole('dialog', { name: 'Quick view: Kanso Ceramic Set' })).getByRole('button', { name: /add to bag/i }))
    expect(screen.getByRole('button', { name: /shopping bag, 1 items/i })).toBeInTheDocument()
  })

  it('opens an addressable full product detail view', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Kanso Ceramic Set' }))
    expect(screen.getByRole('heading', { name: 'Kanso Ceramic Set' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#product/kanso-ceramic-set')
    await user.click(screen.getByRole('button', { name: /increase quantity/i }))
    await user.click(screen.getByRole('button', { name: /add 2 to bag/i }))
    expect(screen.getByRole('button', { name: /shopping bag, 2 items/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back to the collection/i }))
    expect(window.location.hash).toBe('#top')
  })

  it('opens the account page from the account control and validates sign-in fields', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Account' }))
    expect(screen.getByRole('heading', { name: 'Welcome back.' })).toBeInTheDocument()
    const email = screen.getByRole('textbox', { name: 'Email address' })
    expect(email).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Password')).toHaveAttribute('minLength', '8')
    await user.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('heading', { name: 'Join us.' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Full name' })).toBeRequired()
  })

  it('recommends real catalogue products in the demo shopping assistant', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Open MIRZA AI shopping assistant' }))
    await user.click(screen.getByRole('button', { name: 'Suggest a gift under $50' }))
    const assistant = within(screen.getByRole('region', { name: 'MIRZA AI shopping assistant' }))
    expect(assistant.getByText('Here are catalogue picks at or below $50.')).toBeInTheDocument()
    expect(assistant.getByText('Sculpted Candle')).toBeInTheDocument()
    expect(assistant.queryByText('Kanso Ceramic Set')).not.toBeInTheDocument()
    expect(assistant.getByText(/No external AI service is connected/)).toBeInTheDocument()
  })

  it('explains that INR budgets cannot be verified against USD catalogue prices', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Open MIRZA AI shopping assistant' }))
    const input = screen.getByRole('textbox', { name: 'Ask MIRZA AI' })
    await user.type(input, 'Suggest a premium gift under ₹3,000')
    await user.click(screen.getByRole('button', { name: 'Send message' }))
    const assistant = within(screen.getByRole('region', { name: 'MIRZA AI shopping assistant' }))
    expect(assistant.getByText(/prices are currently listed in USD, so I can’t verify which fit an INR budget/i)).toBeInTheDocument()
    expect(assistant.getByText('Sculpted Candle')).toBeInTheDocument()
  })
})
