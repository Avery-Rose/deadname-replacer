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
const { TooltipContainer } = BdApi.findModuleByProps("TooltipContainer");
const Pin = BdApi.findModuleByDisplayName('Pin');

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
            note: "Insert your dead name to be replaced withg your name.",
            id: "deadname",
            value: ""
        },
        {
            type: "textbox",
            name: "Name",
            note: "Insert your name that will replace your dead name.",
            id: "name",
            value: ""
        }
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
                console.log(this.settings);
                return this.buildSettingsPanel().getElement();
            };
        }

        //#region Methods

        escapeRegex(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        }

        //#endregion

        onStart() {
            this.unpatch = BdApi.monkeyPatch(MessageModule, 'default', {
                after: (patchData) => {
                    let deadname = this.settings.deadname.trim()
                    let regex = new RegExp(this.escapeRegex(this.settings.deadname.trim()), "gi");
                    if (patchData.thisObject.props.childrenMessageContent.props.message.content.includes(deadname) ||
                        patchData.thisObject.props.childrenMessageContent.props.message.content.match(regex)) {

                        const newContent = patchData.thisObject.props.childrenMessageContent.props.message.content.replaceAll(regex, this.settings.name.trim());
                        patchData.thisObject.props.childrenMessageContent.props.message.content = newContent;

                        Dispatcher.dirtyDispatch({
                            type: "MESSAGE_UPDATE",
                            message: patchData.thisObject.props.childrenMessageContent.props.message
                        })
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
