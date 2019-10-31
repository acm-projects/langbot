import { View, Text } from "react-native";
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
						this.props.onSubmit(
							this.state.user,
							this.state.pwd
						);
					}}
				/>
				{this.props.error ? (
					<Text
						style={{
							color: "#f00"
						}}
					>
						{this.props.error}
					</Text>
				) : null}
			</View>
		);
	}
}
