import React, { Component } from "react";
import { TouchableOpacity, Text } from "react-native";

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
			>
				<Text
					style={{
						color: "#fff",
						fontSize: 20,
						textAlign: "center",
						padding: 10
					}}
				>
					{this.props.title}
				</Text>
			</TouchableOpacity>
		);
	}
}
