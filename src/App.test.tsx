import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders GuessRu heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/GuessRu/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders game description', () => {
  render(<App />);
  const descriptionElement = screen.getByText(/Daily drag queen guessing game/i);
  expect(descriptionElement).toBeInTheDocument();
});
