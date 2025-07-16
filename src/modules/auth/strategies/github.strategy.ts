import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get('GITHUB_CALLBACK_URL') || '',
      scope: ['user:email', 'repo'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { id, username, displayName, emails, photos } = profile;

    const user = {
      githubId: id,
      githubUsername: username,
      email: emails[0].value,
      name: displayName,
      profilePicture: photos[0].value,
      githubAccessToken: accessToken,
    };

    done(null, user);
  }
}
