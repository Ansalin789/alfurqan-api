/* eslint-disable */
import { Config } from "../../types/config.types";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig(); // Load environment variables from .env file

export const config: Config = {
  server: {
    port: 5001,
    host: "localhost",
  },
  mongo: {
    url:  "mongodb://alfurqan:Blackstone%232024@88.222.215.48:27017"
    //"mongodb://alfurqan:Blackstone%232024@88.222.215.48:27017"  // First let's test without authentication
  },
  // mongo: {
  //   url: "mongodb://127.0.0.1:27017/alfurqan" // Changed to use IPv4
  // },
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
  },

  zoomConfig:{
    zoom_client_id:process.env.ZOOM_CLIENT_ID!,
    zoom_client_secret:process.env.ZOOM_CLIENT_SECRET!,
    zoom_account_id:process.env.ZOOM_ACCOUNT_ID!  
  }
};

export default config;
