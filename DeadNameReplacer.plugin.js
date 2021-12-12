/**
 * @name DeadNameReplacer
 * @version 0.0.1
 * @description Removes your dead name from the discord by changing it to your chosen input.
 * @updateUrl https://raw.githubusercontent.com/Averyyyyyyyy/deadname-replacer/main/DeadNameReplacer.plugin.js
 * @website https://github.com/Averyyyyyyyy/deadname-replacer
 * @author Averyyyyyyyy
 * @authorId 787415934247108629
 */

const MessageModule = BdApi.findModule(m => m.default && m.default.toString && m.default.toString().includes('childrenRepliedMessage'));

const config = {
    info: {
        name: "DeadNameReplacer",
        authors: [
            {
                name: "Averyyyyyyyy",
                discord_id: "787415934247108629",
                github_username: "Averyyyyyyyy"
            }
        ],
        version: "0.0.1",
        description: "Removes your dead name from the discord by changing it to your chosen input.",
    },
    changelog: [
        {
            title: "First Release",
            items: [
                "First Release"
            ]
        }
    ],
    defaultConfig: [
        {
            type: "textbox",
            name: "Dead Name",
            note: "Insert your dead name to be replaced withg your name. you can use multiple names seperated by a comma.",
            id: "deadname",
            value: ""
        },
        {
            type: "textbox",
            name: "Replace With",
            note: "Replaces your dead name with input.",
            id: "replaceWith",
            value: ""
        },
        {
            type: "category",
            name: "Styles",
            id: "styles",
            settings: [
                {
                    type: "switch",
                    name: "Bold",
                    note: "bolds the replaced name.",
                    id: "bold",
                    value: false
                },
                {
                    type: "switch",
                    name: "Italic",
                    note: "italicizes the replaced name.",
                    id: "italic",
                    value: false
                },
                {
                    type: "switch",
                    name: "Underline",
                    note: "underlines the replaced name.",
                    id: "underline",
                    value: false
                },
                {
                    type: "switch",
                    name: "Strikethrough",
                    note: "strikethroughs the replaced name.",
                    id: "strikethrough",
                    value: false
                },
                {
                    type: "switch",
                    name: "Spoiler",
                    note: "makes the replaced name a spoiler.",
                    id: "spoiler",
                    value: false
                },
                {
                    type: "switch",
                    name: "Inline Code",
                    note: "makes the replaced name an inline code. if enabled only this style will be applied.",
                    id: "inlineCode",
                    value: false
                }
            ]
        },
    ]
};

module.exports = !global.ZeresPluginLibrary ? class {
    constructor() {
        this._config = config;
    }

    load() {
        BdApi.showConfirmationModal("Library plugin is needed",
            `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`, {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
                request.get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", (error, response, body) => {
                    if (error)
                        return electron.shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");

                    fs.writeFileSync(path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body);
                });
            }
        });
    }

    start() { }

    stop() { }
} : (([Plugin, Library]) => {
    const { DiscordModules, Patcher } = Library;
    const { Dispatcher } = DiscordModules;

    return class plugin extends Plugin {

        constructor() {
            super();

            this.getSettingsPanel = () => {
                return this.buildSettingsPanel().getElement();
            }
        }

        //#region Methods

        escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        }

        //#endregion

        onStart() {
            this.unpatch = BdApi.monkeyPatch(MessageModule, 'default', {
                after: (patchData) => {
                    const { replaceWith, deadname } = this.settings;

                    // sanitize replaceWith and deadname and remove ['*','|','_','`','~']
                    let replaceWithSanitized = replaceWith.replace(/[*|_`~]/g, '').trim();
                    let deadnameSanitized = deadname.replace(/[*|_`~]/g, '').trim();

                    if (!deadnameSanitized || !replaceWithSanitized) {
                        return patchData.returnValue;
                    }

                    let deadnames = deadnameSanitized.split(",");

                    // sort deadnames by longest to shortest
                    deadnames = deadnames.sort((a, b) => b.length - a.length);

                    const boolSettings = {
                        bold: this.settings.styles.bold,
                        italic: this.settings.styles.italic,
                        underline: this.settings.styles.underline,
                        strikethrough: this.settings.styles.strikethrough,
                        inlineCode: this.settings.styles.inlineCode,
                        spoiler: this.settings.styles.spoiler
                    };

                    if (boolSettings.inlineCode) {
                        replaceWithSanitized = `\`${replaceWithSanitized}\``;
                    } else {
                        replaceWithSanitized = boolSettings.bold ? `**${replaceWithSanitized}**` : replaceWithSanitized;
                        replaceWithSanitized = boolSettings.italic ? `*${replaceWithSanitized}*` : replaceWithSanitized;
                        replaceWithSanitized = boolSettings.underline ? `__${replaceWithSanitized}__` : replaceWithSanitized;
                        replaceWithSanitized = boolSettings.strikethrough ? `~~${replaceWithSanitized}~~` : replaceWithSanitized;
                        replaceWithSanitized = boolSettings.spoiler ? `||${replaceWithSanitized}||` : replaceWithSanitized;
                    }
                    for (let i = 0; i < deadnames.length; i++) {
                        let deadname = deadnames[i].trim();
                        let regex = new RegExp(this.escapeRegex(deadname), "gi");

                        // if the requested replacer contains the deadname
                        if (!replaceWith.match(regex)) {
                            if (patchData.thisObject.props.childrenMessageContent.props.message.content.includes(deadname)
                                || patchData.thisObject.props.childrenMessageContent.props.message.content.match(regex)) {
                                const newContent = patchData.thisObject.props.childrenMessageContent.props.message.content.replaceAll(regex, replaceWithSanitized);
                                patchData.thisObject.props.childrenMessageContent.props.message.content = newContent;

                                Dispatcher.dirtyDispatch({
                                    type: "MESSAGE_UPDATE",
                                    message: patchData.thisObject.props.childrenMessageContent.props.message
                                })
                            }
                        }
                    }
                    return patchData.returnValue;
                }
            });
        }

        onStop() {
            Patcher.unpatchAll();
        }

    };

    return plugin;
})(global.ZeresPluginLibrary.buildPlugin(config));
