import { MaxLength, MinLength } from 'class-validator';

export class UserUpdateDto {
  // заменить на проверку существования
  @MinLength(3)
  @MaxLength(255)
  login?: string;

  @MinLength(8)
  @MaxLength(255)
  password?: string;
}
