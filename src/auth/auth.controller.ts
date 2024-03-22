import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { bodyLogin } from './dto/login.dto';
import { bodySignup } from './dto/signup.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("Auth")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @HttpCode(200) 

  
  @Post('login')
  login(@Body() bodyLogin: bodyLogin ){
    try{
      return this.authService.login(bodyLogin)
    }
    catch(exception){
      if(exception.status != 500){
        throw new HttpException(exception.response, exception.status)
      }
      throw new HttpException('Lỗi...', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  } 

  @Post('signup')
  signup(@Body() bodySignup: bodySignup){
    return this.authService.signup(bodySignup)
  }
}
