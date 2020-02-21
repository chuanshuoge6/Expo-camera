import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import ExpoPixi, { PIXI } from 'expo-pixi';
import { Asset } from 'expo-asset';
import { ScrollView, Image, ImageBackground } from 'react-native'
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
    const [defaultPicture, setdefaultPicture] = useState(null)

    useEffect(() => {
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
        //console.log(fisrtPicture)
        const asset = fisrtPicture.assets[0]
        await setdefaultPicture(asset)

        console.log(Asset.fromModule(require('./assets/background.jpg')))
        console.log(asset)
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
            <View style={{ flex: 1 }}>
                <ImageBackground source={require('./assets/background.jpg')}
                    style={{ flex: 0.7, resizeMode: 'stretch' }}>
                    <ExpoPixi.FilterImage
                        source={Asset.fromModule(require('./assets/background.jpg'))}
                        resizeMode={'contain'}
                        style={{ flex: 0.7 }}
                        filters={[new PIXI.filters.NoiseFilter()]}
                    />
                </ImageBackground>

            </View>
        </Container>
    )
}