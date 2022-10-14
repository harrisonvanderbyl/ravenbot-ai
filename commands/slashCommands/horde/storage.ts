const temptest = {};

export const storeLoginDetails = (discordID: string, apiKey: string) => {
  //store the discordID and apiKey in a database
  temptest[discordID] = apiKey;
};

export const retrieveLoginDetails = (discordID: string): { apiKey } => {
  //retrieve the apiKey from the database
  return { apiKey: temptest[discordID] ?? "0000000000" };
};
