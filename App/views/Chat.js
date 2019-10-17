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
// // Firebase App (the core Firebase SDK) is always required and must be listed before other Firebase SDKs
// const firebase = require("firebase");
// // Add the Firebase products that you want to use
// require("firebase/firestore");
// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);
// //Initialize an instance of Cloud Firestore
// var db = firebase.firestore();

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
		messages: [
			{
				_id: 1,
				text: `Hello! I am the LangBot.\n\nSpeak to me in Spanish`,
				//The createdAt time will display the current time and date in the chat UI.
				createdAt: new Date(),
				user: BOT_USER
			}
		],
		isConnected: true
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

		let message = messages[0].text;
		/*
    The method Dialogflow_V2.requestQuery is used to send a text request to the agent. 
    It contains three parameters:the text itself as the first parameter; in our case message, the result and error callback functions
	  */

		Dialogflow_V2.requestQuery(
			message,
			result => this.handleGoogleResponse(result),
			error => console.log(error)
		);

		if (message.includes("datos")) {
			this.saveMessage(messages[0]);
			this.getMessage();
		} else {
			this.saveMessage(messages[0]);
		}
	}

	/*
    The sendBotResponse function then updates the state of the App component and displays 
    whatever response back to the user in the chat interface.
	*/
	sendBotResponse(text) {
		let msg = {
			_id: this.state.messages.length + 1,
			text,
			createdAt: new Date(),
			user: BOT_USER
		};
		this.setState(previousState => ({
			messages: GiftedChat.append(previousState.messages, [msg])
		}));
		this.saveMessage(msg);
	}

	/*
	Add data
	*/
	saveMessage(msg) {
		// db.collection("usersMessages")
		// 	.add({
		// 		messages: msg
		// 	})
		// 	.then(function(docRef) {
		// 		console.log("Document written with ID: ", docRef.id);
		// 	})
		// 	.catch(function(error) {
		// 		console.error("Error adding document: ", error);
		// 	});
	}

	/*
	Read data
	*/
	getMessage() {
		// db.collection("usersMessages")
		// 	.get()
		// 	.then(snapshot => {
		// 		snapshot.forEach(doc => {
		// 			this.parseData(doc.data());
		// 		});
		// 	})
		// 	.catch(err => {
		// 		console.log("Error getting documents", err);
		// 	});
	}

	parseData(message) {
		var messagesData = message.messages;
		var msg = messagesData.text;
		console.log(msg);
		this.sendBotResponse(msg);
	}

	render() {
		return (
			// The line <View style={{ flex: 1, backgroundColor: '#fff' }}> in the render function
			// shows that you can add your own custom styling along using Gifted Chat's components.
			<View style={{ flex: 1, backgroundColor: "#fff" }}>
				{this.state.isConnected ? (
					<GiftedChat
						messages={this.state.messages}
						onSend={messages => this.onSend(messages)}
						user={{
							_id: 1
						}}
					/>
				) : (
					<View
						style={{
							flex: 1,
							textAlign: "center",
							justifyContent: "center",
							alignItems: "center"
						}}
					>
						<Text>Not Connected to Internet</Text>
						<Image
							source={require("../assets/loading.gif")}
						/>
					</View>
				)}
				{Platform.OS === "android" ? <KeyboardSpacer /> : null}
			</View>
		);
	}
}
