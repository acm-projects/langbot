//Source for integrating Gifted Chat and DialogFlow : https://blog.jscrambler.com/build-a-chatbot-with-dialogflow-and-react-native/
//Source for integrating firestore: https://firebase.google.com/docs/firestore/quickstart

import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GiftedChat, Message } from 'react-native-gifted-chat';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { NativeAppEventEmitter } from 'react-native';
import { dialogflowConfig ,  firebaseConfig  } from './env';
import { User } from "./User.js";
import { ChatMessage } from "./ChatMessage.js"
/*
Initializing firebase
*/
// Firebase App (the core Firebase SDK) is always required and must be listed before other Firebase SDKs
const firebase = require("firebase");
// Add the Firebase products that you want to use
require("firebase/firestore");
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
//Initialize an instance of Cloud Firestore
var db = firebase.firestore();

/*
The user object is the user sending messages — in our case, the bot. 
It is defined with properties like username, its unique ID, and an avatar. 
The react-native-gifted-chat automatically adds a circle avatar in the UI.
*/
const BOT_USER = {
  _id: 2,
  name: 'LangBot',
  avatar: 'https://imgur.com/jB2SYzV'
};

const DEFAULT_MESSAGE = {
  _id: 1,
  text: `Hi! I am the LangBot.\n\nSpeak to me in Spanish`,
  //The createdAt time will display the current time and date in the chat UI.
  createdAt: new Date(),
  user: BOT_USER
}

var user;

class App extends Component {
  state = {
    messages: []
  };

  //A lifecycle method to apply Dialogflow's configuration.
  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_SPANISH,
      dialogflowConfig.project_id
    );

    // if there isn't a user already, create one
    // (this will later be replaced by actual user auth)
    if (user == undefined) {
      this.loadInMessages();
    }

  }

  async loadInMessages() {
    let user = await this.createUser();
    // now that we have the user, load in the messages
    let introMessages = user.getMessageCollection(db, "01_intro");
    
    // see if the first message from the bot has been sent
    introMessages.where("_id", "==", 0).get().then(snapshot => {
      // if the user doesn't have a conversation with the first bot
      if (snapshot.empty) {
        console.log("there's no convo yet");
        // send the first message
        this.setState(previousState => {
          messages: GiftedChat.append(previousState.messages, [DEFAULT_MESSAGE])
        });
      } else {
        console.log("loading in the conversation...");
        // load in previous messages from the database
        this.setState(previousState => {
          messages: GiftedChat.append(previousState.messages, this.getMessagesFromDatabase(introMessages))
        });
      }
    });
  }

  /**
   * getMessagesFromDatabase()
   * @param {firebase.firestore.CollectionReference} messageCollection the collection of messages
   * @returns an array of message objects for Gifted Chat
   */
  getMessagesFromDatabase(messageCollection) {
    let messages = [];

    messageCollection.get().then(snapshot => {
      snapshot.forEach(msgDoc => {
        // create a ChatMessage with data from the message in the db
        let msgObj = ChatMessage.createChatMessageFromData(msgDoc.data());
        // save a data obj for Gifted Chat to display
        messages.append(msgObj.toDataObject());
      })
    });

    console.log("messages in db are " + messages);

    return messages;
  }

  /*
  The function handleGoogleResponse(result) was created to handle the response coming back and then call the sendBotResponse() function.
  */
  handleGoogleResponse(result) {
    let text = result.queryResult.fulfillmentMessages[0].text.text[0];
    this.sendBotResponse(text);
  }

  /*
  The GiftedChat component can take props like messages from our component's initial state, 
  an onSend prop that is a callback function used when sending the message, and the user ID of the message.
  */
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages)
    }));

    let messageText = messages[0].text;
    console.log(messages[0]);
    let messageObj = ChatMessage.createChatMessageFromData(messages[0]);
    this.saveMessage(messageObj);
    /*
    The method Dialogflow_V2.requestQuery is used to send a text request to the agent. 
    It contains three parameters:the text itself as the first parameter; in our case message, the result and error callback functions
	  */
    Dialogflow_V2.requestQuery(
      messageText,
      result => this.handleGoogleResponse(result),
      error => console.log(error)
    );
  }

  /*
  The sendBotResponse function then updates the state of the App component and displays whatever response back to the user in the chat interface. 
  */
  sendBotResponse(text) {
    // create a new message
    let msg = new ChatMessage(
      this.state.messages.length + 1,
      text,
      new Date(),
      BOT_USER
    );
    
    // update the db
    this.saveMessage(msg);

    // update the UI
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg.toDataObject()])
    }));

    if (text.includes("datos")){
      this.getMessage();
    }
  }

  /**
   * saveMessage()
   * saves a message object to the database for the current user
   * @param {ChatMessage} msg the message object
   */
  saveMessage(msg) {
    // eventually this will change but for now it's just a constant
    let currentBotID = "01_intro";
    let msgData = msg.toDataObject();
    console.log(msgData);

    db.collection("users").doc(user.docID) // user
      .collection("conversations").doc(currentBotID) // conversation with intro bot
      .collection("messages").add(msgData) // the message collection with that bot
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
    console.log("saved msg to db");
  }

  /*
  Read data
  */
  getMessage(){
    db.collection('users').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
        this.sendBotResponse(doc.id);
      });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
  }

  /**
   * createUser()
   * Initializes a new user or gets data from the one in the database if it already exists
   */
  async createUser() {
    // use default values
    // later, we'll generate an actual uid
    // this is for testing purposes to prevent a ton of test users from being created
    user = new User("First", "Last", "TEST_UID", "email@email.email", "avatar-link", 0);

    let userPromise = new Promise((resolve, reject) => {
      // save it to the database if only it's a new user
      let userAlreadyExists = false;

      // save the user if it doesn't already exist
      if (!userAlreadyExists) {
        db.collection("users").add({})
        .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
          // set the right id
          docRef.set({
            docID: docRef.id
          });
          user.docID = docRef.id;

          docRef.set(user.toDataObject());

          resolve(user);
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
      }
    });
  
    return userPromise;
    // go through the users collection & look for one with the same uid
    /*db.collection("users").get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        let data = doc.data();
        // if the user has a uid that's the same as the temp one we just made
        if (data.id == user.docID) {
          userAlreadyExists = true;
          console.log("user already exists: " + user.id);
          // now we need to get the user from the db and save it for later use
          user = User.createUserFromObject(data);
          user.docID = data.id;
        }
      });
      
      

      } else {
        console.log("Didn't save new user to db because one with the same ID already exists");
      }
    });*/
  }

  render() {
    return (
    	//The line <View style={{ flex: 1, backgroundColor: '#fff' }}> in the render function shows that you can add your own custom styling along using Gifted Chat's components.
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
        />
      </View>
    );
  }
}

export default App;