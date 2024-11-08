/* eslint-disable */
import { Config } from "../../types/config.types";

export const config: Config = {
  server: {
    port: 5001,
    host: process.env.SERVER_HOST ?? "localhost",
  },
  mongo: {
    url: "mongodb://localhost:27017/alfurqan"  // First let's test without authentication
  },
 
  // sentry: {
  //   dsn: process.env.SENTRY_DSN ?? "",
  //   env: process.env.SENTRY_ENVIRONMENT!,
  // },
  encryption: {
    iv: process.env.ENCRYPTION_IV!,
  },
  jwtAuth: {
    secret: '3b2d7161d7fc10390806247aad445d75f925008a428525d92942b98a7fd2306d999d0a03eda790d593c1881ae9777cb24896d7920ca0b5022e6aedf220899111',
    expiresIn: '24h',
    algorithm: 'HS256',
  },
 

  emailConfig: {
    sendinbule: process.env.EMAIL_SENDER_URL!,
    sender_name: process.env.EMAIL_SENDER_NAME!,
    sender_email: process.env.EMAIL_SENDER_EMAIL!,
    api_key: process.env.EMAIL_API_KEY!,
    header_key: process.env.EMAIL_HEADER_KEY!,
  },


  microsoftTeamsConfig:{
    microsoft_team_calender_event_url :process.env.MICROSOFT_TEAM_CALENDAR_EVENT_URL!,
    microsoft_team_access_token_url :process.env.MICROSOFT_TEAM_ACCESS_TOKEN_URL!,
    microsoft_team_cancel_url:process.env.MICROSOFT_TEAM_CANCEL_EVENT_URL!,
    microsoft_team_calender_update_event_url:process.env.MICROSOFT_TEAM_CALENDER_UPDATE_EVENT_URL!
  }
};

export default config;
