import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import Logo from './Logo';

describe('Logo Component', () => {

    it('should render the logo icon and text by default', () => {
        render(<Logo />);

        expect(screen.getByText(/Task Tracker/i)).toBeInTheDocument();
        expect(screen.getByText(/Project Management/i)).toBeInTheDocument();
        const svgCircle = document.querySelector('circle[fill="url(#pulseCircleGradient)"]');
        expect(svgCircle).toBeInTheDocument();
    });

    it('should NOT render text when showText is false', () => {
        render(<Logo showText={false} />);

        expect(screen.queryByText(/Task Tracker/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Project Management/i)).not.toBeInTheDocument();
    });

    it('should apply the correct size to the SVG container', () => {
        const customSize = 80;
        render(<Logo size={customSize} />);

        // The SVG element should have width and height matching the prop
        const svgElement = document.querySelector('svg');
        expect(svgElement).toHaveAttribute('width', customSize.toString());
        expect(svgElement).toHaveAttribute('height', customSize.toString());
    });

    it('should apply custom text color', () => {
        const customColor = 'rgb(255, 0, 0)'; // Red
        render(<Logo textColor={customColor} />);

        const textElement = screen.getByText(/Task Tracker/i);
        expect(textElement).toHaveStyle({ color: customColor });
    });

    it('should trigger onClick when the logo is clicked', () => {
        const handleClick = vi.fn();
        render(<Logo onClick={handleClick} />);

        const container = screen.getByText(/Task Tracker/i).closest('.MuiBox-root');

        if (container) {
            fireEvent.click(container);
        }

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have pointer cursor only when onClick is provided', () => {
        const { rerender } = render(<Logo />);
        const noClickContainer = screen.getByText(/Task Tracker/i).parentElement?.parentElement;
        expect(noClickContainer).toHaveStyle({ cursor: 'default' });

        rerender(<Logo onClick={() => {}} />);
        const clickContainer = screen.getByText(/Task Tracker/i).parentElement?.parentElement;
        expect(clickContainer).toHaveStyle({ cursor: 'pointer' });
    });
});