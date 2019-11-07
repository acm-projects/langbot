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
//Yellow Box Dialog Message Dependencies
import { YellowBox, NetInfo } from "react-native";
import _ from "lodash";

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

const CATCH = err => {
	throw err;
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
						navigation.navigate("Settings", {
							sign_in: navigation.getParam("sign_in")
						});
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
		messages: [],
		login: null
	};

	//A lifecycle method to apply Dialogflow's configuration.
	componentDidMount() {
		NetInfo.isConnected
			.fetch()
			.done(isConnected => this.setState({ isConnected }));
		NetInfo.isConnected.addEventListener(
			"connectionChange",
			isConnected => this.setState({ isConnected })
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
		this.props.navigation.setParams({
			sign_in: user => {
				this.setState({ login: user });
				console.log("SIGNED IN");
			}
		});
	}

	async loadInMessages() {
		let user = await Chat.createUser().catch(CATCH);
		// now that we have the user, load in the messages
		let introMessages = user.getMessageCollection(db, "01_intro");
		// TODO!! the second part still runs even if there's no convo yet
		if (!introMessages) {
			console.log("there's no convo yet");
			// send the first message
			this.setState(previousState => ({
				messages: GiftedChat.append(previousState.messages, [
					DEFAULT_MESSAGE
				])
			}));
		} else {
			console.log("loading in the conversation...");
			// load in previous messages from the database
			let dbMessages = await this.getMessagesFromDatabase(
				introMessages
			);
			console.log("done loading in the conversation...");
			this.setState(previousState => ({
				messages: GiftedChat.append(
					previousState.messages,
					dbMessages
				)
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

		let snapshot = await messageCollection
			.orderBy("createdAt", "desc")
			.get();
		snapshot.forEach(msgDoc => {
			// create a ChatMessage with data from the message in the db
			let msgObj = ChatMessage.createChatMessageFromFirestore(
				msgDoc.data()
			);
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
			messages: GiftedChat.append(previousState.messages, [
				msg.toDataObject()
			])
		}));
	}

	/*
	Add data
	*/
	saveMessage(msg) {
		// eventually this will change but for now it's just a constant
		let currentBotID = "01_intro";
		let msgData = msg.toDataObject();
		console.log("message data being saved: ", msgData);

		db.collection("users")
			.doc(user.docID) // user
			.collection("conversations")
			.doc(currentBotID) // conversation with intro bot
			.collection("messages")
			.add(msgData) // the message collection with that bot
			.then(function(docRef) {
				console.log("Document written with ID: ", docRef.id);
			})
			.catch(function(error) {
				console.error("Error adding document: ", error);
			});
		console.log("saved msg to db");
	}

	static existsUser(user) {
		return new Promise(async function(resolve, reject) {
			let k = await db
				.collection("users")
				.where("uid", "==", user)
				.get();
			resolve(k.docs.length > 0);
		});
	}

	static findUser(user) {
		return new Promise(async function(resolve, reject) {
			let k = await db
				.collection("users")
				.where("uid", "==", user)
				.get();
			resolve(k.docs[0].data());
		});
	}

	/**
	 * createUser()
	 * Initializes a new user or gets data from the one in the database if it already exists
	 * Accepts Object with first name, last name, email, and avatar_link keys
	 * Has default values for testing
	 */
	static createUser({
		first = "First",
		last = "Last",
		id = "TEST_UID",
		email = "email@email.email",
		avatar_link = "avatar-link",
		pwd = null
	} = {}) {
		return new Promise(async function(resolve, reject) {
			user = new User(first, last, id, email, avatar_link, 0);

			let snapshot = await db
				.collection("users")
				.where("uid", "==", id)
				.get()
				.catch(CATCH);
			if (snapshot.docs.length > 1)
				return reject("Duplicate Users in the Database");
			else if (snapshot.docs.length == 1) {
				doc = snapshot.docs[0];
				let data = doc.data();
				if (pwd && data.pwd != pwd)
					return reject("Passwords do not match");
				user = User.createUserFromObject(data);
				console.log("user already exists: " + user.uid);
				// now we need to get the user from the db and save it for later use
				return resolve(user);
			}

			console.log("the user does not already exist");
			// add a new user to the db
			let docRef = await db
				.collection("users")
				.add({})
				.catch(CATCH);

			user.docID = docRef.id;

			// save the user data to firestore
			await docRef.set(user.toDataObject()).catch(CATCH);
			await docRef.update({ pwd }).catch(CATCH);
			console.log("Document written with ID: ", docRef.id);

			return resolve(user);
		});
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
