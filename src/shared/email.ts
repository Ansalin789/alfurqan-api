import axios from "axios";
import config from "../config/env";
import AppLogger from "../helpers/logging";

export const sendEmailClient = async (
  To: { email: string; name: string }[],
  Subject: string,
  HTMLPart: string
) => {
  let emailConfigDetails: any = {
    sender: {
      name: "Alfurgan Admin",
      email: "tech@alfurqan.academy",
    },
    to: To,
    subject: Subject,
    htmlContent: HTMLPart,
  };
  // if (Cc && Cc.length !== 0) {
  //   emailConfigDetails = {
  //     ...emailConfigDetails,
  //     cc: Cc,
  //   }
  // }
  try {
    const { data: res } = await axios.post("https://api.sendinblue.com/v3/smtp/email",
      emailConfigDetails,
      {
        headers: {
        },
      }
    );
    return res;
  } catch (err) {
    AppLogger.error("Send Mail", err);
  }

};