import React from "react";
import { View, Text, FlatList } from "react-native";
import ImageButton from "../components/ImageButton";

const DATA = [
	{
		img: require("../assets/flags/spain.png"),
		id: "ES"
	},
	{
		img: require("../assets/flags/france.png"),
		id: "FR"
	},
	{
		img: require("../assets/flags/english.png"),
		id: "EN"
	},
	{
		img: require("../assets/flags/german.png"),
		id: "DE"
	}
];

export default class Languages extends React.Component {
	render() {
		return (
			<View>
				<FlatList
					// horizontal={true}
					data={DATA}
					numColumns={3}
					renderItem={({ item }) => {
						return (
							<ImageButton
								style={{
									width: 80,
									height: 80,
									margin: 20,
									resizeMode: "contain"
								}}
								source={item.img}
							/>
						);
					}}
				/>
			</View>
		);
	}
}
