import React, { Component } from "react";
import { TextInput } from "react-native";

export default class TextIn extends Component {
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
