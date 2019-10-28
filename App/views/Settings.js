import { StyleSheet, Text, View, Platform, Button } from "react-native";
import React, { Component } from "react";
import { SegmentedControls } from "react-native-radio-buttons";
import LogInFields from "../components/LogInFields";
import LButton from "../components/LButton";

const setSelectedOption = item => console.log(item);

class Settings extends Component {
	state = {
		selectedOption: "TEXT",
		params: {}
	};
	componentDidMount() {
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
				{!this.state.params.is_logged_in &&
				!this.state.show_login ? (
					<LButton
						title="SIGN IN"
						onPress={() =>
							this.setState({ show_login: true })
						}
					/>
				) : null}
				{this.state.show_login ? <LogInFields /> : null}
			</View>
		);
	}
}

export default Settings;
