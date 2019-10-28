import React, { Component } from "react";
import LogInFields from "../components/LogInFields";
import TextIn from "../components/TextIn";
import { View } from "react-native";

export default class SignUp extends Component {
	render() {
		return (
			<View>
				<LogInFields>
					<TextIn
						placeholder="Re-enter Password"
						secureTextEntry={true}
					/>
					<TextIn placeholder="Email" />
				</LogInFields>
			</View>
		);
	}
}
