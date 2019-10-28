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
				{this.state.show_login ? (
					<View>
						<LogInFields />
						<LButton
							title="Don't have an account?"
							style={{
								backgroundColor: "#0000",
								padding: 5
							}}
							textStyle={{
								color: "#999"
							}}
							onPress={() =>
								this.props.navigation.navigate("SignUp")
							}
						/>
					</View>
				) : null}
			</View>
		);
	}
}

export default Settings;
