import { render, screen } from '@testing-library/react';
import Navbar from './components/Navbar';

test('navbar renders the brand and contact link', () => {
  render(<Navbar />);
  expect(screen.getByText('Jairus Aragon')).toBeInTheDocument();
  expect(screen.getByText('Contact')).toBeInTheDocument();
});
