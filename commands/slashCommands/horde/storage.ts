export const storeLoginDetails = (
  discordID: string,
  apiKey: string,
  userDetails: { username: string; id: string }
) => {
  //store the discordID and apiKey in a database
};

export const retrieveLoginDetails = (
  discordID: string
): { apiKey; username; id } => {
  //retrieve the apiKey from the database
  return {
    apiKey: "string",
    username: "string",
    id: "string",
  };
};
