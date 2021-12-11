/**
 * @name DeadNameReplacer
 * @version 0.0.1
 * @description Removes your dead name from the discord by changing it to your chosen input.
 * @author Averyyyyyyyy
 * @authorId 787415934247108629
 */
const MessageModule = BdApi.findModule(m => m.default && m.default.toString && m.default.toString().includes('childrenRepliedMessage'));
const Dispatcher = BdApi.findModuleByProps('dirtyDispatch');
module.exports = class DeadNameReplacer {
    get name() { return this.constructor.name; }
    start() {
        console.log('DeadNameReplacer: Starting...');
        const DeadNameReplacer = BdApi.findModule(m => m?.type?.displayName === "DeadNameReplacer");

        const deadname = /deadname/gi;
        const input = `userInput`;

        this.unpatch = BdApi.monkeyPatch(MessageModule, 'default', {
            after: (patchData) => {
                const message = patchData.thisObject.props.childrenMessageContent.props.message;
                const content = patchData.thisObject.props.childrenMessageContent.props.message.content;
                const hasDeadName = message.match(deadname);
                if (hasDeadName) {
                    const newMessage = content.replaceAll(deadname, input);
                    patchData.thisObject.props.childrenMessageContent.props.message.content = newMessage;
                    Dispatcher.dirtyDispatch({
                        type: "MESSAGE_UPDATE",
                        message: message
                    })
                }
                return patchData.returnValue;
            }
        });
    }
    stop() {
        console.log('DeadNameReplacer: Stopping...');
        if (this.unpatch) this.unpatch();
    }
}
