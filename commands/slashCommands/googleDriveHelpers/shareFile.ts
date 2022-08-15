

/**
 * Batch permission modification
 * @param{string} fileId file ID
 * @param{string} targetUserEmail username
 * @param{string} targetDomainName domain
 * @return{list} permission id
 * */
async function shareFile(fileId, targetUserEmail, targetDomainName) {
  const { GoogleAuth } = require("google-auth-library");
  const { google } = require("googleapis");
  const async = require("async");

  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app
  const auth = new GoogleAuth({
    scopes: "https://www.googleapis.com/auth/drive",
  });
  const service = google.drive({ version: "v3", auth });

  let id;
  const permissions = [
    {
      type: "user",
      role: "writer",
      emailAddress: targetUserEmail, // 'user@partner.com',
    },
    {
      type: "domain",
      role: "writer",
      domain: targetDomainName, // 'example.com',
    },
  ];
  // Using the NPM module 'async'
  try {
    async.eachSeries(permissions, function (permission) {
      service.permissions
        .create({
          resource: permission,
          fileId: fileId,
          fields: "id",
        })
        .then(function (result) {
          id = result.data.id;
          console.log("Permission Id:", id);
        });
    });
    return id;
  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}
