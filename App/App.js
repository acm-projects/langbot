import Settings from "./views/Settings";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import React, { Component } from "react";
import Chat from "./views/Chat";
import Languages from "./views/Languages";
import SignUp from "./views/SignUp";

const navigate = createStackNavigator(
	{
		Chat,
		Settings,
		Languages,
		SignUp
	},
	{
		initialRouteName: "Chat"
	}
);

const Contain = createAppContainer(navigate);
export default class App extends Component {
	render() {
		return <Contain />;
	}
}
