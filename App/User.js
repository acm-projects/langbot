class User {

    /**
     * creates a new User
     */
    constructor(firstName, lastName, chatHistory, uid, email, pwdHash, avatar, proficiencyScore) {      
        this.name = {
            first: firstName,
            last: lastName
        };
        this.chatHistory = chatHistory;
        this.uid = uid;
        this.email = email;
        this.pwdHash = pwdHash;
        this.avatar = avatar;
        this.proficiencyScore = proficiencyScore;
    }

    /**
     * sends the User object to Firebase or updates it if it already exists
     */ 
    saveToFirebase() {
        // TODO
    }
}