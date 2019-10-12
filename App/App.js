//Source for integrating Gifted Chat and DialogFlow : https://blog.jscrambler.com/build-a-chatbot-with-dialogflow-and-react-native/
//Source for integrating firestore: https://firebase.google.com/docs/firestore/quickstart

import React, { Component } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import { Dialogflow_V2 } from 'react-native-dialogflow';
import { NativeAppEventEmitter } from 'react-native';
import { dialogflowConfig ,  firebaseConfig  } from './env';
import { User } from "./User.js";
import { ChatHistory } from "./ChatHistory.js";

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

var user;

class App extends Component {
  state = {
    messages: [
      {
        _id: 1,
        text: `Hi! I am the LangBot.\n\nSpeak to me in Spanish`,
        //The createdAt time will display the current time and date in the chat UI.
        createdAt: new Date(),
        user: BOT_USER
      }
    ]
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
      this.createUser();
    }

    console.log(user);
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

    let message = messages[0].text;
    this.saveMessage(messages);
    /*
    The method Dialogflow_V2.requestQuery is used to send a text request to the agent. 
    It contains three parameters:the text itself as the first parameter; in our case message, the result and error callback functions
	  */
    Dialogflow_V2.requestQuery(
      message,
      result => this.handleGoogleResponse(result),
      error => console.log(error)
    );
  }

  /*
  The sendBotResponse function then updates the state of the App component and displays whatever response back to the user in the chat interface. 
  */
  sendBotResponse(text) {
    let msg = {
      _id: this.state.messages.length + 1,
      text,
      createdAt: new Date(),
      user: BOT_USER
    };
    this.saveMessage(msg);
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, [msg])
    }));
    if (text.includes("datos")){
      this.getMessage();
    }
  }

  /*
  Add data
  */
  saveMessage(msg){
    db.collection("users").add({
      messages: msg
    })
    .then(function(docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
      console.error("Error adding document: ", error);
    });
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
   * 
   */
  createUser() {
    // use default values
    user = new User("", "", new ChatHistory(), "TEST_UID", "", "", 0);
  
    // save it to the database if only it's a new user
    let userAlreadyExists = false;
  
    // go through the users collection & look for one with the same uid
    db.collection("users").get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        let data = doc.data();
        // if the user has a uid that's the same as the temp one we just made
        if (data.uid != undefined && data.uid == user.uid) {
          userAlreadyExists = true;
          console.log("user already exists: " + user.uid);
          // now we need to get the user from the db
          user = User.createUserFromObject(data);
        }
      });
      
      // save the user if it doesn't already exist
      if (!userAlreadyExists) {
        db.collection("users").add(user.toDataObject())
        .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
          console.error("Error adding document: ", error);
        });
      } else {
        console.log("Didn't save new user to db because one with the same ID already exists");
      }
    });
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