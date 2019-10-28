import { View, TextInput, Button } from "react-native";
import React, { Component } from "react";
import LButton from "./LButton";
import TextIn from "./TextIn";

export default class LogInFields extends Component {
	state = {
		user: null,
		pwd: null
	};
	render() {
		return (
			<View>
				<TextIn
					placeholder="Username"
					onChangeText={text => this.setState({ user: text })}
				/>
				<TextIn
					placeholder="Password"
					secureTextEntry={true}
					onChangeText={text => this.setState({ pwd: text })}
				/>
				{this.props.children}
				<LButton
					title="SUBMIT"
					onPress={() => {
						this.props.onSubmit();
					}}
				/>
			</View>
		);
	}
}
