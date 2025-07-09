import React from 'react';
import { WebXPayButtonProps } from '../types';

export const WebXPayButton: React.FC<WebXPayButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  children,
  className = '',
  variant = 'primary',
  size = 'medium'
}) => {
  const baseClasses = 'webx-pay-button';
  const variantClasses = {
    primary: 'webx-pay-button--primary',
    secondary: 'webx-pay-button--secondary',
    success: 'webx-pay-button--success',
    danger: 'webx-pay-button--danger'
  };
  const sizeClasses = {
    small: 'webx-pay-button--small',
    medium: 'webx-pay-button--medium',
    large: 'webx-pay-button--large'
  };

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className,
    loading && 'webx-pay-button--loading',
    disabled && 'webx-pay-button--disabled'
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="webx-pay-button__spinner" />}
      <span className="webx-pay-button__content">
        {children}
      </span>
    </button>
  );
};
