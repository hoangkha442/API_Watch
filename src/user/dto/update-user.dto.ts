import { ApiProperty } from "@nestjs/swagger"
import { users_role } from "@prisma/client"


export class updateUserDto {

    @ApiProperty({ description: 'Password of the user', example: 'Password123!' })
    password?: string;

    @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
    full_name?: string;

    @ApiProperty({ description: 'Phone number of the user', example: '+1234567890' })
    phone?: string;

    @ApiProperty({ description: 'Last login date of the user', example: '2024-01-20T15:30:00.000Z' })
    last_login_date?: string;

    @ApiProperty({ description: 'Users address', example: '123 Main St, Anytown' })
    address?: string;

    @ApiProperty({ description: 'Users age', example: 30 })
    age?: number;

    @ApiProperty({ description: 'Active status of the user', example: true })
    isActive?: boolean;
}

export class updateUserWRoleDto {
    @ApiProperty({ description: 'Email of the user', example: 'user@example.com' })
    email?: string;

    @ApiProperty({ description: 'Password of the user', example: 'Password123!' })
    password?: string;

    @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
    full_name?: string;

    @ApiProperty({ description: 'Phone number of the user', example: '+1234567890' })
    phone?: string;

    @ApiProperty({ description: 'Last login date of the user', example: '2024-01-20T15:30:00.000Z' })
    last_login_date?: string;

}

export class updateUserRole {
    @ApiProperty({ enum: users_role, enumName: 'users_role', description: 'Role of the user', example: users_role.customer })
    role: users_role;
}
