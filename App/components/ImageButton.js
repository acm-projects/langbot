import React from "react";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Image, View } from "react-native";

export default class ImageButton extends React.Component {
	render() {
		console.log(this.props.style);
		return (
			<TouchableOpacity onPress={this.props.onPress}>
				<Image
					style={this.props.style}
					source={this.props.source}
				/>
			</TouchableOpacity>
		);
	}
}
