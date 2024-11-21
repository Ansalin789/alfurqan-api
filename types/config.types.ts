export interface Config {
    server: {
        host: string;
        port?: number | string;
    };
    mongo: {
        url: string,
    };
    // sentry: {
    //     dsn: string,
    //     env: string
    // },
    encryption: {
        iv: string
    },
    jwtAuth: {
        secret: string,
        expiresIn: string,
        algorithm: string
    },

    emailConfig: {
        sendinbule: string,
        sender_name: string,
        sender_email: string,
        api_key: string,
        header_key: string
    },

     microsoftTeamsConfig:{
        microsoft_team_calender_event_url :string;
        microsoft_team_access_token_url :string;
        microsoft_team_cancel_url:string;
        microsoft_team_calender_update_event_url:string;
      }

    zoomConfig:{
        zoom_client_id:string;
        zoom_client_secret:string;
        zoom_account_id:string;
    }
}
