import ChatHistory from "./ChatHistory.js"

/**
 * User
 * contains info for the database
 */
export class User {

    /**
     * creates a new User
     */
    constructor(firstName, lastName, chatHistory, uid, email, avatar, proficiencyScore) {              
        this.name = {
            first: firstName,
            last: lastName
        };
        this.chatHistory = chatHistory;
        this.uid = uid;
        this.email = email;
        this.avatar = avatar;
        this.proficiencyScore = proficiencyScore;
    }

    /**
     * createUserFromObject()
     * converts a plain object from the database to a User with the same properties
     * @param {Object} data 
     * @returns a User with the same properties of the object passed in
     */
    static createUserFromObject(data) {
        return new User(
            data.name.first,
            data.name.last,
            data.chatHistory,
            data.uid,
            data.email,
            data.avatar,
            data.proficiencyScore
        );
    }

    /**
     * toDataObject()
     * @returns an object with all of the fields of the User object
     */
    toDataObject() {
        return {
            name: this.name,
            chatHistory: this.chatHistory.toDataObject(),
            uid: this.uid,
            email: this.email,
            avatar: this.avatar,
            proficiencyScore: this.proficiencyScore
        }
    }
}