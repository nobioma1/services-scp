import { render, screen } from '@testing-library/react';

import Header from './Header';

describe('Header', () => {
  it('renders headline', () => {
    render(<Header />);
    const headline = screen.getByText(/Open Events/i);
    expect(headline).toBeInTheDocument();
  });
});
