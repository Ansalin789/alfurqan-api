import axios from "axios";
import config from "../config/env";
import AppLogger from "../helpers/logging";

export const sendEmailClient = async (
  To: { email: string; name: string }[],
  Cc: { email?: string; name?: string }[],
  Subject: string,
  HTMLPart: string
) => {
  let emailConfigDetails: any = {
    sender: {
      name: config.emailConfig.sender_name,
      email: config.emailConfig.sender_email,
    },
    to: To,

    subject: Subject,
    htmlContent: HTMLPart,
  };
  if (Cc && Cc.length !== 0) {
    emailConfigDetails = {
      ...emailConfigDetails,
      cc: Cc,
    }
  }
  try {
    const { data: res } = await axios.post(config.emailConfig.sendinbule,
      emailConfigDetails,
      {
        headers: {
          "api-key": config.emailConfig.api_key,
        },
      }
    );
    return res;
  } catch (err) {
    AppLogger.error("Send Mail", err);
  }

};