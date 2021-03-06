/**
 * `ChatMessage`
 * Represents a message from the user or the bot.
 */
export class ChatMessage {
    /**
     * 
     * @param {String} id the id of the message in the convo
     * @param {String} text the text of the message
     * @param {Date} createdAt a `Date` object of when this message was created
     * @param {Object} gcUser the gifted chat user object that sent this message
     */
    constructor(id, text, createdAt, gcUser) {
        this._id = id;
        this.text = text;
        this.createdAt = createdAt;
        this.user = gcUser;
    }

    /**
     * createChatMessageFromData()
     * creates a ChatMessage object with data from the database
     * @param {Object} data the data object from the database
     * @returns a `ChatMessage` with the same fields as the data object passed in
     */
    static createChatMessageFromFirestore(data) {
        let date = new Date(data.createdAt.seconds * 1000);
        return new ChatMessage(data._id, data.text, date, data.user);
    }

    /**
     * createChatMessageFromData()
     * creates a ChatMessage object with data from the gifted chat
     * @param {Object} data the data object from gifted chat
     * @returns a `ChatMessage` with the same fields as the data object passed in
     */
    static createChatMessageFromData(data) {
        let date = new Date(data.createdAt);
        return new ChatMessage(data._id, data.text, date, data.user);
    }

    /**
     * toDataObject()
     * @returns an object with the same data as the `ChatMessage` that can be saved to the database or displayed in Gifted Chat
     */
    toDataObject() {
        return {
            _id: this._id,
            text: this.text,
            createdAt: this.createdAt,
            user: this.user
        }
    }
}