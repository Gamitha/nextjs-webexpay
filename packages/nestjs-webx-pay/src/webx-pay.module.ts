import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { WebXPayService } from './services/webx-pay.service';
import { WebXPayController } from './controllers/webx-pay.controller';
import { WebXPayModuleConfig } from './interfaces/webx-pay.interface';

export interface WebXPayModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<WebXPayModuleConfig> | WebXPayModuleConfig;
  inject?: any[];
  imports?: any[]; // Optional imports for async module
  // disableDefaultController?: boolean;
}

// Alternative with better type safety
export interface WebXPayModuleAsyncOptionsTyped<T extends any[] = any[]> {
  useFactory: (...args: T) => Promise<WebXPayModuleConfig> | WebXPayModuleConfig;
  inject?: [...T];
  // disableDefaultController?: boolean;
}

@Module({})
export class WebXPayModule {
  /**
   * Create WebXPayModule with synchronous configuration
   */
  static forRoot(config: WebXPayModuleConfig): DynamicModule {
    const configProvider: Provider = {
      provide: 'WEBX_PAY_CONFIG',
      useValue: config
    };

    return {
      module: WebXPayModule,
      providers: [
        configProvider,
        WebXPayService
      ],
      // controllers: config.disableDefaultController ? [] : [WebXPayController],
      controllers: [WebXPayController],
      exports: [WebXPayService]
    };
  }

  /**
   * Create WebXPayModule with asynchronous configuration
   */
  static forRootAsync(options: WebXPayModuleAsyncOptions): DynamicModule {
    const configProvider: Provider = {
      provide: 'WEBX_PAY_CONFIG',
      useFactory: options.useFactory,
      inject: options.inject || []
    };

    return {
      module: WebXPayModule,
      imports: options.imports || [],
      providers: [
        configProvider,
        WebXPayService
      ],
      // controllers: options.disableDefaultController ? [] : [WebXPayController],
      controllers: [WebXPayController],
      exports: [WebXPayService]
    };
  }
}
