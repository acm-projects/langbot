import {
  StyleSheet,
  Text,
  View,
  Platform,
  Button,
  AsyncStorage
} from "react-native";
import React, { Component } from "react";
import { SegmentedControls } from "react-native-radio-buttons";
import AsyncStorageManager from "../AsyncStorageManager.js";
import LogInFields from "../components/LogInFields";
import LButton from "../components/LButton";
import Chat from "./Chat";
import { salt_rounds } from "../env";
import bcrypt from "../modified_modules/bcryptjs";

const setSelectedOption = item => {
  console.log(item);
  AsyncStorageManager.setValue("chatMode", item);
};

class Settings extends Component {
  state = {
    selectedOption: "TEXT",
    params: {}
  };
  async updateViewFromSettings() {
    // get our setting from storage
    let chatMode = await AsyncStorageManager.getValue("chatMode");
    // update the view to match it
    this.setState({
      selectedOption: chatMode
    });
  }
  componentDidMount() {
    this.updateViewFromSettings();
    this.setState({
      params: this.props.navigation.state.params
        ? this.props.navigation.state.params
        : {}
    });
  }
  render() {
    return (
      <View>
        <SegmentedControls
          optionContainerStyle={{
            paddingTop: 10,
            paddingBottom: 10
          }}
          containerStyle={{
            marginTop: 7,
            marginHorizontal: 5
          }}
          options={["TEXT", "SPEECH"]}
          onSelection={setSelectedOption.bind(this)}
          selectedOption={this.state.selectedOption}
        />
        {!this.state.params.is_logged_in && !this.state.show_login ? (
          <LButton
            title="SIGN IN"
            onPress={() => this.setState({ show_login: true })}
          />
        ) : null}
        {this.state.show_login ? (
          <View>
            <LogInFields
              onSubmit={(user, pwd) => {
                console.log(this.state.error);
                console.log("signing in...");
                let doct;
                Chat.findUser(user)
                  .then(doc => {
                    doct = doc;
                    console.log("found user");
                    console.log(doc);
                    if (!doc)
                      return this.setState({
                        error: "Username not found"
                      });
                    return bcrypt.compare(pwd, doc.pwd);
                  })
                  .then(result => {
                    if (!result)
                      return this.setState({
                        error: "Invalid Password"
                      });
                    console.log(this.props.navigation.state.params);
                    this.props.navigation.getParam("sign_in")(doct);
                    console.log("DONE");
                    this.props.navigation.goBack();
                  })
                  .catch(err => console.error(err));
              }}
              error={this.state.error}
            />
            <LButton
              title="Don't have an account?"
              style={{
                backgroundColor: "#0000",
                padding: 5
              }}
              textStyle={{
                color: "#999"
              }}
              onPress={() => this.props.navigation.navigate("SignUp")}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

export default Settings;
