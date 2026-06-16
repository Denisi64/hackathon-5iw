import { IsUUID } from 'class-validator'

export class CreateCheckoutDto {
  @IsUUID()
  subscriptionId!: string
}
