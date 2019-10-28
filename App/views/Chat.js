/*
Source for integrating Gifted Chat and DialogFlow : https://blog.jscrambler.com/build-a-chatbot-with-dialogflow-and-react-native/
Source for integrating firestore: https://firebase.google.com/docs/firestore/quickstart
Source for disabling   YellowBox warnings: https://stackoverflow.com/questions/44603362/setting-a-timer-for-a-long-period-of-time-i-e-multiple-minutes
*/

//React Dependencies
import { StyleSheet, Text, View, Button, Platform, Image } from "react-native";
import React, { Component } from "react";
//Gifted Chat Dependency
import { GiftedChat } from "react-native-gifted-chat";
//Dialog Flow Dependencies
import { Dialogflow_V2 } from "react-native-dialogflow";
import { NativeAppEventEmitter } from "react-native";
import { User } from "../User.js";
import { ChatMessage } from "../ChatMessage.js";
//Configurations
import { dialogflowConfig, firebaseConfig } from "../env";
//Front-End Dependencies
import KeyboardSpacer from "react-native-keyboard-spacer";
import ImageButton from "../components/ImageButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
//Yellow Box Dialog Message Dependencies
import { YellowBox, NetInfo } from "react-native";
import _ from "lodash";
// text to speech
import * as Speech from "expo-speech";
// speech to text
import * as Permissions from "expo-permissions";
import { Audio } from "expo-av";

/*
Handled timer console message and dialog box
*/
YellowBox.ignoreWarnings(["Setting a timer"]);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf("Setting a timer") <= -1) {
    _console.warn(message);
  }
};

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
  name: "LangBot",
  avatar: "https://imgur.com/jB2SYzV"
};

const DEFAULT_MESSAGE = {
  _id: 1,
  text: `Hi! I am the LangBot.\n\nSpeak to me in Spanish`,
  //The createdAt time will display the current time and date in the chat UI.
  createdAt: new Date(),
  user: BOT_USER
};

export default class Chat extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerRight: (
        <ImageButton
          style={{ width: 40, marginRight: 5 }}
          source={require("../assets/settings.png")}
          onPress={() => {
            navigation.navigate("Settings");
          }}
        />
      ),
      headerLeft: (
        <ImageButton
          style={{
            width: 40,
            marginLeft: 5,
            resizeMode: "contain"
          }}
          source={require("../assets/flags/spain.png")}
          onPress={() => {
            navigation.navigate("Languages");
          }}
        />
      )
    };
  };

  state = {
    messages: []
  };

  //A lifecycle method to apply Dialogflow's configuration.
  componentDidMount() {
    NetInfo.isConnected
      .fetch()
      .done(isConnected => this.setState({ isConnected }));
    NetInfo.isConnected.addEventListener("connectionChange", isConnected =>
      this.setState({ isConnected })
    );

    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_SPANISH,
      dialogflowConfig.project_id
    );

    // if there isn't a user already, create one
    // (this will later be replaced by actual user auth)
    this.loadInMessages();

    // TODO: move this to somewhere after a button press
    this.startRecording();
  }

  async loadInMessages() {
    let user = await this.createUser();
    // now that we have the user, load in the messages
    let introMessages = user.getMessageCollection(db, "01_intro");
    // TODO!! the second part still runs even if there's no convo yet
    if (!introMessages) {
      // send the first message
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, [DEFAULT_MESSAGE])
      }));
    } else {
      // load in previous messages from the database
      let dbMessages = await this.getMessagesFromDatabase(introMessages);
      this.setState(previousState => ({
        messages: GiftedChat.append(previousState.messages, dbMessages)
      }));
    }
  }

  /**
   * getMessagesFromDatabase()
   * @param {firebase.firestore.CollectionReference} messageCollection the collection of messages
   * @returns an array of message objects for Gifted Chat
   */
  async getMessagesFromDatabase(messageCollection) {
    let messages = [];

    let snapshot = await messageCollection.orderBy("createdAt", "desc").get();
    snapshot.forEach(msgDoc => {
      // create a ChatMessage with data from the message in the db
      let msgObj = ChatMessage.createChatMessageFromFirestore(msgDoc.data());
      // save a data obj for Gifted Chat to display
      messages.push(msgObj.toDataObject());
    });

    return messages;
  }

  /*
  The function handleGoogleResponse(result) was created to handle the response 
  coming back and then call the sendBotResponse() function.
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
    The sendBotResponse function then updates the state of the App component and displays 
    whatever response back to the user in the chat interface.
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

    // speak it!
    Speech.speak(text, {
      language: "es-ES"
    });
  }

  /*
	Add data
	*/
  saveMessage(msg) {
    // eventually this will change but for now it's just a constant
    let currentBotID = "01_intro";
    let msgData = msg.toDataObject();

    db.collection("users")
      .doc(user.docID) // user
      .collection("conversations")
      .doc(currentBotID) // conversation with intro bot
      .collection("messages")
      .add(msgData) // the message collection with that bot
      .then(function(docRef) {
        console.log("Message document written with ID: ", docRef.id);
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });
  }

  /*
	Read data
	*/
  getMessage() {
    db.collection("users")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.sendBotResponse(doc.id);
        });
      })
      .catch(err => {
        console.log("Error getting documents", err);
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
    user = new User(
      "First",
      "Last",
      "TEST_UID",
      "email@email.email",
      "avatar-link",
      0
    );

    // save it to the database if only it's a new user
    let userAlreadyExists = false;

    // go through the users collection & look for one with the same uid
    let snapshot = await db.collection("users").get();
    snapshot.forEach(doc => {
      let data = doc.data();
      // if the user has a uid that's the same as the temp one we just made
      if (data.uid == user.uid) {
        userAlreadyExists = true;
        // now we need to get the user from the db and save it for later use
        user = User.createUserFromObject(data);
        user.docID = data.docID;
      }
    });

    // save the user if it doesn't already exist
    if (!userAlreadyExists) {
      // add a new user to the db
      let docRef = await db.collection("users").add({});
      // set the right id (for the db & locally)
      docRef.set({
        docID: docRef.id
      });
      user.docID = docRef.id;
      // save the user data to firestore
      docRef.set(user.toDataObject());
    }

    return user;
  }

  async startRecording() {
    // ask user for recording permission
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    console.log("audio recording permission: " + status);
    // stop if we don't have permission
    if (status !== "granted") return;

    // use this later to update UI
    this.setState({ isRecording: true });

    // set audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: true,
      staysActiveInBackground: true
    });

    const recordingOptions = {
      android: {
        extension: ".m4a",
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000
      },
      ios: {
        extension: ".wav",
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false
      }
    };

    // make a new recording
    const recording = new Audio.Recording();
    // prepare recording
    await recording.prepareToRecordAsync(recordingOptions);

    // check status
    let recordingStatus = await recording.getStatusAsync();
    console.log("status: ", recordingStatus);

    console.log("prepared, about to start async");
    await recording.startAsync();
    console.log("started async");
    console.log("URI: " + recording.getURI());
  }

  render() {
    return (
      // The line <View style={{ flex: 1, backgroundColor: '#fff' }}> in the render function
      // shows that you can add your own custom styling along using Gifted Chat's components.
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <GiftedChat
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: 1
          }}
        />
        {Platform.OS === "android" ? <KeyboardSpacer /> : null}
      </View>
    );
  }
}
