export type SlashCommand = {
    slashCommand: (client,interaction)=>Promise<void>,
    contextCommand: (client,interaction)=>Promise<void>,
    modalSubmit: (client, interaction)=>Promise<void>,
    commandSchema: any,
    skipDeferReply?: boolean,
}