import React, { Component } from "react";
import LogInFields from "../components/LogInFields";
import TextIn from "../components/TextIn";
import { View } from "react-native";
import { salt_rounds } from "../env";
import bcrypt from "../modified_modules/bcryptjs";
import isaac from "isaac";

export default class SignUp extends Component {
	state = {
		email: null,
		rpwd: null,
		error: null
	};
	render() {
		return (
			<View>
				<LogInFields
					onSubmit={(user, pwd) => {
						console.log("Validating user data...");
						console.log("User: " + user);
						console.log("Password: " + pwd);
						console.log("RPassword: " + this.state.rpwd);
						console.log("email: " + this.state.email);
						if (!user) {
							this.setState({
								error: "No Username Provided"
							});
							return;
						}
						if (!pwd) {
							this.setState({
								error: "No Password Provided"
							});
							return;
						}
						if (!this.state.rpwd) {
							this.setState({
								error: "Must Re-enter Password"
							});
							return;
						}
						if (!this.state.email) {
							this.setState({
								error: "No Email Provided"
							});
							return;
						}
						if (this.state.rpwd != pwd) {
							this.setState({
								error: "Passwords Do Not Match"
							});
							return;
						}
						bcrypt.setRandomFallback(len =>
							new Uint8Array(len).map(() =>
								Math.floor(isaac.random() * 256)
							)
						);
						bcrypt
							.genSalt(salt_rounds)
							.then(salt => bcrypt.hash(pwd, salt))
							.then(hash => {
								console.log(hash);
							})
							.catch(err => console.log(err));
					}}
					error={this.state.error}
				>
					<TextIn
						placeholder="Re-enter Password"
						secureTextEntry={true}
						onChangeText={text =>
							this.setState({ rpwd: text })
						}
					/>
					<TextIn
						placeholder="Email"
						onChangeText={text =>
							this.setState({ email: text })
						}
					/>
				</LogInFields>
			</View>
		);
	}
}
