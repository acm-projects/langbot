const firebase = require("firebase");
require("firebase/firestore");
/**
 * `User`
 * Contains info for the database.
 * Each user holds its own record of conversations.
 */
export class User {

    /**
     * creates a new `User`
     * @param {String} firstName the user's first name
     * @param {String} lastName the user's last name
     * @param {String} uid a unique ID for the user
     * @param {String} email the user's email
     * @param {String} avatar a link to the user's avatar
     * @param {Number} proficiencyScore a number representing the user's skills with the language
     * @param {String} docID the ID of the corresponding document in firestore
     */
    constructor(firstName, lastName, uid, email, avatar, proficiencyScore) {              
        this.name = {
            first: firstName,
            last: lastName
        };
        this.uid = uid;
        this.email = email;
        this.avatar = avatar;
        this.proficiencyScore = proficiencyScore;
        this.docID = ""; // this gets set later
    }

    /**
     * createUserFromObject()
     * converts a plain object from the database to a User with the same properties
     * @param {Object} data 
     * @returns a `User` with the same properties of the object passed in
     */
    static createUserFromObject(data) {
        return new User(
            data.name.first,
            data.name.last,
            data.uid,
            data.email,
            data.avatar,
            data.proficiencyScore,
            data.id
        );
    }

    /**
     * toDataObject()
     * @returns an object with all of the fields of the User object
     */
    toDataObject() {
        return {
            name: this.name,
            uid: this.uid,
            email: this.email,
            avatar: this.avatar,
            proficiencyScore: this.proficiencyScore,
            docID: this.docID
        }
    }

    /**
     * toGiftedChatUser()
     * @returns a simplified user object for Gifted Chat to use
     */
    toGiftedChatUser() {
        return {
            _id: 1,
            name: this.name.first + " " + this.name.last,
            avatar: this.avatar
        }
    }

    /**
     * getConversationCollection()
     * @param {Firestore} db the reference to the database
     * @returns the collection of messages for the given database and bot id
     */
    getMessageCollection(db, botID) {
        let convoCollection = db.collection("users").doc(this.docID).collection("conversations");
        // there may not be any convos yet if we just created a new user
        if (convoCollection != undefined) {
            return convoCollection.doc(botID).collection("messages");
        } else {
            return undefined;
        }
    }
}