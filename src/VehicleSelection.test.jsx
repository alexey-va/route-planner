import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VehicleSelection from './VehicleSelection';

const mockVehiclesConfig = {
  0: { name: 'Газель', max_weight: 1500 },
  1: { name: 'Газель', max_weight: 2000 },
  2: { name: 'Газон', max_weight: 4300 },
  3: { name: 'Камаз', max_weight: 10000 }
};

describe('VehicleSelection', () => {
  const defaultProps = {
    vehiclesConfig: mockVehiclesConfig,
    weight: 500,
    vehicle: 0,
    setVehicle: vi.fn()
  };

  it('should render all vehicles', () => {
    render(<VehicleSelection {...defaultProps} />);
    
    expect(screen.getByLabelText(/Газель.*1.5т/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Газон.*4.3т/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Камаз.*10т/)).toBeInTheDocument();
  });

  it('should show selected vehicle', () => {
    render(<VehicleSelection {...defaultProps} vehicle={2} />);
    
    const gazonRadio = screen.getByLabelText(/Газон/);
    expect(gazonRadio).toBeChecked();
  });

  it('should disable vehicles that cannot carry the weight', () => {
    render(<VehicleSelection {...defaultProps} weight={2000} />);
    
    const gazel1Radio = screen.getByLabelText(/Газель.*1.5т/);
    expect(gazel1Radio).toBeDisabled();
    
    const gazel2Radio = screen.getByLabelText(/Газель.*2т/);
    expect(gazel2Radio).not.toBeDisabled();
  });

  it('should call setVehicle when vehicle is selected', async () => {
    const user = userEvent.setup();
    const setVehicleMock = vi.fn();
    
    render(<VehicleSelection {...defaultProps} setVehicle={setVehicleMock} />);
    
    const gazonRadio = screen.getByLabelText(/Газон/);
    await user.click(gazonRadio);
    
    expect(setVehicleMock).toHaveBeenCalledWith(2);
  });

  it('should display max weight in tons', () => {
    render(<VehicleSelection {...defaultProps} />);
    
    expect(screen.getByText('1.5т')).toBeInTheDocument();
    expect(screen.getByText('2т')).toBeInTheDocument();
    expect(screen.getByText('4.3т')).toBeInTheDocument();
    expect(screen.getByText('10т')).toBeInTheDocument();
  });
});

