import { IsString, IsEmail, IsNumber, IsOptional, Min, Length, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaymentRequestDto {
  @IsString()
  @Length(2, 50)
  firstName: string;

  @IsString()
  @Length(2, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(10, 20)
  contactNumber: string;

  @IsString()
  @Length(5, 100)
  addressLineOne: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  addressLineTwo?: string;

  @IsString()
  @Length(2, 50)
  city: string;

  @IsString()
  @Length(2, 50)
  state: string;

  @IsString()
  @Length(2, 20)
  postalCode: string;

  @IsString()
  @Length(2, 50)
  country: string;

  @IsString()
  @IsIn(['LKR', 'USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD'])
  processCurrency: string;

  @IsOptional()
  @IsString()
  paymentGatewayId?: string;

  @IsOptional()
  @IsString()
  multiplePaymentGatewayIds?: string;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  description?: string;

  @IsOptional()
  @IsString()
  orderId?: string;
}

export class WebhookRequestDto {
  @IsString()
  orderId: string;

  @IsString()
  referenceNumber: string;

  @IsString()
  timestamp: string;

  @IsString()
  statusCode: string;

  @IsString()
  statusMessage: string;

  @IsString()
  gatewayId: string;

  @IsString()
  transactionAmount: string;

  @IsOptional()
  @IsString()
  requestedAmount?: string;

  @IsOptional()
  @IsString()
  customFields?: string;

  @IsOptional()
  @IsString()
  payment?: string;
}
