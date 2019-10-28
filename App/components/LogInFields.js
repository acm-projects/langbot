import { View, TextInput, Button } from "react-native";
import React, { Component } from "react";
import LButton from "./LButton";

export default class LogInFields extends Component {
	render() {
		return (
			<View>
				<TextIn placeholder="Username" />
				<TextIn placeholder="Password" />
				<LButton title="SUBMIT" onPress={this.props.onSubmit} />
			</View>
		);
	}
}

class TextIn extends Component {
	render() {
		return (
			<TextInput
				{...this.props}
				style={{
					borderBottomWidth: 1,
					borderColor: "#9f9f9f",
					borderBottomLeftRadius: 10,
					borderBottomRightRadius: 10,
					margin: 10
				}}
			/>
		);
	}
}
