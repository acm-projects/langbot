import React, { Component } from "react";
import { TouchableOpacity, Text } from "react-native";

const style = {
	color: "#fff",
	fontSize: 20,
	textAlign: "center",
	padding: 10
};

export default class LButton extends Component {
	render() {
		return (
			<TouchableOpacity
				onPress={this.props.onPress}
				style={{
					backgroundColor: "#007AFF",
					margin: 20,
					justifyContent: "center",
					borderRadius: 5
				}}
				{...this.props}
			>
				<Text style={{ ...style, ...this.props.textStyle }}>
					{this.props.title}
				</Text>
			</TouchableOpacity>
		);
	}
}
