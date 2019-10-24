import { StyleSheet, Text, View, Platform, Button } from "react-native";
import React, { Component } from "react";
import { SegmentedControls } from "react-native-radio-buttons";

const setSelectedOption = item => console.log(item);

class Settings extends Component {
  state = {
    selectedOption: "TEXT"
  };
  render() {
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
