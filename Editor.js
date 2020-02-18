import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { ScrollView, Image, Dimensions } from 'react-native'
import {
    Container, Header, Title, Content, Footer,
    FooterTab, Button, Left, Right, Body, Icon, Text,
    Accordion, Card, CardItem, Thumbnail, ListItem,
    CheckBox, DatePicker, DeckSwiper, Fab, View,
    Badge, Form, Item, Input, Label, Picker, Textarea,
    Switch, Radio, Spinner, Tab, Tabs, TabHeading,
    ScrollableTab, H1, H2, H3, Drawer,
} from 'native-base';
import {
    Ionicons, MaterialIcons, Foundation,
    MaterialCommunityIcons, Octicons
} from '@expo/vector-icons';

export default function Editor(props) {
    const [screenHeight, setscreenHeight] = useState(600)
    const [defaultPicture, setdefaultPicture] = useState(null)

    useEffect(() => {
        const screenHeight = Math.round(Dimensions.get('window').height);
        setscreenHeight(screenHeight)

        getLastPictureFromGallary()

        //if back key is pressed on the phone, close editor
        BackHandler.addEventListener('hardwareBackPress', () => {
            props.closeEditor()
        });

        //component will unmount
        return () => { BackHandler.removeEventListener('hardwareBackPress') }
    }, [])

    getLastPictureFromGallary = async () => {
        const fisrtPicture = await MediaLibrary.getAssetsAsync({
            first: 1,
            sortBy: MediaLibrary.SortBy.creationTime
        })
        console.log(fisrtPicture)
        await setdefaultPicture(fisrtPicture.assets[0].uri)
    }

    return (
        <Container>
            <Header style={{ marginTop: 25 }}>
                <Left>
                    <Button transparent onPress={() => props.closeEditor()}>
                        <Ionicons name='ios-arrow-round-back' size={40} color="white"></Ionicons>
                    </Button>
                </Left>
                <Body style={{ alignItems: 'center' }}>
                    <Title>Editor</Title>
                </Body>
                <Right>
                    <Button transparent iconRight>
                        <Text style={{ color: 'white' }}>Gallary{' '}</Text>
                        <Ionicons name='ios-arrow-round-forward' size={40} color="white"></Ionicons>
                    </Button>
                </Right>
            </Header>
            <Content>
                <Image source={{ uri: props.picture ? props.picture : defaultPicture }}
                    style={{ height: 0.6 * screenHeight, resizeMode: 'stretch' }}>
                </Image>

            </Content>
        </Container>
    )
}