// /**
//  * Batch permission modification
//  * @param{string} fileId file ID
//  * @param{string} targetUserEmail username
//  * @param{string} targetDomainName domain
//  * @return{list} permission id
//  * */
// async function shareFile(fileId, targetUserEmail, targetDomainName) {
//   const { GoogleAuth } = require("google-auth-library");
//   const { google } = require("googleapis");
//   const async = require("async");

import { drive_v3 } from "googleapis";

// Get credentials and build service
// TODO (developer) - Use appropriate auth mechanism for your app

export const shareFile = async (
  service: drive_v3.Drive,
  fileId: string,
  targetUserEmails: string[],
  role: "reader" | "writer" | "commenter",
  emailMessage: string = "",
  expireAtEndOfMonth: boolean = true
) => {
  const permissions = targetUserEmails.map((targetUserEmail) => ({
    type: "user",
    role,
    emailAddress: targetUserEmail, // 'user@partner.com',
  }));

  // Date at the first of next month

  const expirationDate = new Date(
    new Date().getTime() + 30 * 24 * 60 * 60 * 1000
  );
  // set to first of next month
  expirationDate.setDate(1);

  //Make into a rfc3339 string (YYYY-MM-DDTHH:MM:SS.sssZ)
  const expirationDateString = `${expirationDate.getFullYear()}-${expirationDate.getMonth()}-${expirationDate.getDate()}T00:00:00.000Z`;

  // Using the NPM module 'async'
  return Promise.all(
    permissions.map(async (permission) => {
      service.permissions
        .create({
          fileId: fileId,
          fields: "id",
          emailMessage,
          requestBody: {
            emailAddress: permission.emailAddress,
            role: permission.role,
            type: permission.type,
            ...(expireAtEndOfMonth
              ? { expirationDate: expirationDateString }
              : {}),
          },
        })
        .then(function (result) {
          console.log("Permission Id:", result.data.id);
          return result.data.id;
        });
    })
  );
};
