import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResultDisplay from './ResultDisplay';

describe('ResultDisplay', () => {
  const defaultProps = {
    distance: 10000,
    duration: 0,
    region: 'Киров',
    address: 'Тестовый адрес',
    price: { price: 1000, description: ['Комментарий 1', 'Комментарий 2'] },
    weight: 500,
    mapDistance: 10000,
    regions: [],
    reset: () => {}
  };

  it('should render distance correctly', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('10.0 км')).toBeInTheDocument();
  });

  it('should render 0.0 км when distance is 0', () => {
    render(<ResultDisplay {...defaultProps} distance={0} />);
    expect(screen.getByText('0.0 км')).toBeInTheDocument();
  });

  it('should render 0.0 км when distance is not set', () => {
    render(<ResultDisplay {...defaultProps} distance={null} />);
    expect(screen.getByText('0.0 км')).toBeInTheDocument();
  });

  it('should show "Установлено вручную" when distance differs from mapDistance', () => {
    render(<ResultDisplay {...defaultProps} distance={20000} mapDistance={10000} />);
    expect(screen.getByText('Установлено вручную')).toBeInTheDocument();
  });

  it('should render region and address', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('Киров')).toBeInTheDocument();
    expect(screen.getByText('Тестовый адрес')).toBeInTheDocument();
  });

  it('should render weight', () => {
    render(<ResultDisplay {...defaultProps} weight={750} />);
    expect(screen.getByText(/750 кг/)).toBeInTheDocument();
  });

  it('should render price correctly', () => {
    render(<ResultDisplay {...defaultProps} price={{ price: 1500, description: [] }} />);
    expect(screen.getByText('1500 руб')).toBeInTheDocument();
  });

  it('should render "Бесплатно" for zero price', () => {
    render(<ResultDisplay {...defaultProps} price={{ price: 0, description: [] }} />);
    expect(screen.getByText('Бесплатно')).toBeInTheDocument();
  });

  it('should render "Нет" for invalid price', () => {
    render(<ResultDisplay {...defaultProps} price={{ price: -1, description: [] }} />);
    expect(screen.getByText('Нет')).toBeInTheDocument();
  });

  it('should render comments', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('Комментарий 1')).toBeInTheDocument();
    expect(screen.getByText('Комментарий 2')).toBeInTheDocument();
  });

  it('should show "Нет комментариев" when description is empty', () => {
    render(<ResultDisplay {...defaultProps} price={{ price: 1000, description: [] }} />);
    expect(screen.getByText('Нет комментариев.')).toBeInTheDocument();
  });

  it('should render reset button', () => {
    render(<ResultDisplay {...defaultProps} />);
    expect(screen.getByText('Сбросить')).toBeInTheDocument();
  });

  it('should call reset when button is clicked', () => {
    const resetMock = vi.fn();
    render(<ResultDisplay {...defaultProps} reset={resetMock} />);
    
    const resetButton = screen.getByText('Сбросить');
    resetButton.click();
    
    expect(resetMock).toHaveBeenCalledTimes(1);
  });
});

