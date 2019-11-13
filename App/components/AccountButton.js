import React, { Component } from "react";
import { Container, Header, Content, Card, CardItem, Text, Body } from "native-base";
import { ScrollView } from "react-native-gesture-handler";

export default class CardItemButton extends Component {
  cards = [
    {
      name: "Esteban",
      text: "¡Buenos días! Yo soy Esteban. ¿Como estas?"
    },
    {
      name: "Maria",
      text: "¡Hola! ¿Cuál es tu comida favorita?"
    },
    {
      name: "Sergio",
      text: "¡Me gusta viajar todo el mundo! ¡Mi lugar favorito es España!"
    },
    {
      name: "Angelina",
      text: "Yo amo a los animales, por eso trabajo en el zoológico."
    },
    {
      name: "Juan",
      text: "Soy un jugador de fútbol profesional y juevo por Argentina."
    },
  ]
  render() {
    let list = [];
    for(let i = 0; i < this.cards.length; i++) {
      list.push(<Card style={this.props.style}>
        <CardItem header button onPress={() => alert("This is Card Header")}>
          <Text style={{fontSize: 26, color: 'blue'}}>{this.cards[i].name}</Text>
        </CardItem>
        <CardItem button onPress={() => alert("This is Card Body")}>
          <Body>
            <Text>
            {this.cards[i].text}
            </Text> 
          </Body>
        </CardItem>  
        <CardItem footer button onPress={() => alert("This is Card Footer")}>
          {/* <Text>GeekyAnts</Text> */}
        </CardItem>
      </Card>)
    }
    return (
      <ScrollView>
        {list} 
      </ScrollView>
    );
  }
}