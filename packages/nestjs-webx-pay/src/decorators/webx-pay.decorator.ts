import { Inject } from '@nestjs/common';

/**
 * Decorator for injecting WebX Pay configuration
 */
export const InjectWebXPayConfig = () => Inject('WEBX_PAY_CONFIG');

/**
 * Decorator for injecting WebX Pay service
 */
export const InjectWebXPayService = () => Inject('WebXPayService');
