import { StyleSheet, Text, View, Button, Platform, Image } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { Dialogflow_V2 } from "react-native-dialogflow";
import { NativeAppEventEmitter } from "react-native";
import KeyboardSpacer from "react-native-keyboard-spacer";
import { dialogflowConfig } from "../env";
import React, { Component } from "react";
import ImageButton from "../components/ImageButton";
import { TouchableOpacity } from "react-native-gesture-handler";
import { HeaderButtons, Item } from "react-navigation-header-buttons";

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
         It contains three parameters:the text itself as the first parameter; in our case 
         message, the result and error callback functions
		*/
    Dialogflow_V2.requestQuery(
      message,
      result => this.handleGoogleResponse(result),
      error => console.log(error)
    );
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
