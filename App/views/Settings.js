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

const setSelectedOption = item => {
  console.log(item);
  AsyncStorageManager.setValue("chatMode", item);
};

class Settings extends Component {
  state = {
    selectedOption: "TEXT"
  };

  componentDidMount() {
    this.updateViewFromSettings();
  }

  async updateViewFromSettings() {
    // get our setting from storage
    let chatMode = await AsyncStorageManager.getValue("chatMode");
    // update the view to match it
    console.log("setting screen to match chatMode = " + chatMode);
    this.setState({
      selectedOption: chatMode
    });
  }

  render() {
    // read settings from storage & update the view to match
    return (
      <View>
        {/* <Button title="Text/Speech" /> */}
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
      </View>
    );
  }
}

export default Settings;
