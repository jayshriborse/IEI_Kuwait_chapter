import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';

export enum DevicePlatformDto {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
}

export class SaveDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^ExponentPushToken\[.+\]$/, {
    message: 'token must be a valid Expo push token starting with "ExponentPushToken["',
  })
  token: string;

  @IsEnum(DevicePlatformDto, {
    message: 'platform must be either IOS or ANDROID',
  })
  platform: DevicePlatformDto;
}

export class DeleteDeviceTokenDto {
  @IsString()
  @IsOptional()
  token?: string;
}
