import SubNotify from './SubNotify'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

const message = 'this is important success notification'

it('Notify text is visible', () => {
  render(<SubNotify message={message} />)
  expect(
    screen.getByText('this is important success notification')
  ).toBeInTheDocument()
  expect(
    screen.getByText('this is important success notification')
  ).toHaveStyle('color: green')
})
