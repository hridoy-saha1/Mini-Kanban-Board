import { IsEmail, IsNotEmpty } from 'class-validator';

export class ShareBoardDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}