import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Image, ImageBackground, Alert, Dimensions, ScrollView } from 'react-native'
import {
    Container, Header, Title, Content, Footer,
    FooterTab, Button, Left, Right, Body, Icon, Text,
    Accordion, Card, CardItem, Thumbnail, ListItem,
    CheckBox, DatePicker, DeckSwiper, Fab, View,
    Badge, Form, Item, Input, Label, Picker, Textarea,
    Switch, Radio, Spinner, Tab, Tabs, TabHeading,
    ScrollableTab, H1, H2, H3, Drawer, Toast
} from 'native-base';
import {
    Ionicons, MaterialIcons, Foundation,
    MaterialCommunityIcons, Octicons
} from '@expo/vector-icons';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { Col, Row, Grid } from "react-native-easy-grid";

const picWidth = Math.round(Dimensions.get('window').width) / 2 - 20;

export default function Editor(props) {
    const [gallaryPic, setgalleryPic] = useState([])
    const [currentPic, setcurrentPic] = useState(0)
    const [openGridView, setopenGridView] = useState(false)
    const [selectedPic, setselectedPic] = useState([])

    useEffect(() => {
        setcurrentPic(0)
        getLastPictureFromGallary()

        //if back key is pressed on the phone, close editor
        BackHandler.addEventListener('hardwareBackPress', () => {
            props.closeEditor()
        });

        //component will unmount
        return () => { BackHandler.removeEventListener('hardwareBackPress') }
    }, [])

    getLastPictureFromGallary = async () => {
        const pics = await MediaLibrary.getAssetsAsync({
            sortBy: MediaLibrary.SortBy.creationTime
        })

        //await setdefaultPicture(pics.assets[0].uri)
        await setgalleryPic(pics.assets)

    }

    previousPic = () => {
        const length = gallaryPic.length
        if (length === 0) { return }

        currentPic > 0 ? setcurrentPic(currentPic - 1) : setcurrentPic(length - 1)
    }

    nextPic = () => {
        const length = gallaryPic.length
        if (length === 0) { return }

        currentPic < length - 1 ? setcurrentPic(currentPic + 1) : setcurrentPic(0)
    }

    confirmDelete = async () => {
        //remove picture in android directory
        await MediaLibrary.deleteAssetsAsync(gallaryPic[currentPic])
        //remove picture in memory
        setgalleryPic(gallaryPic.filter(item => { return item !== gallaryPic[currentPic] }))
        //correct current pic index
        previousPic()
        nextPic()
    }

    togglePicHighlight = (id) => {
        selectedPic.includes(id) ?
            setselectedPic(selectedPic.filter(_id => { return _id !== id })) :
            setselectedPic(selectedPic.concat(id))
    }

    picLongPress = (index) => {
        setcurrentPic(index)
        setopenGridView(false)
    }

    deletePics = () => {
        selectedPic.forEach(async (id) => {
            removePic = gallaryPic.find(item => item.id === id)
            //remove picture in android directory
            await MediaLibrary.deleteAssetsAsync(removePic)
        })

        //remove picture in memory
        setgalleryPic(gallaryPic.filter(item => !selectedPic.includes(item.id)))

        setselectedPic([])
        setcurrentPic(0)
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
                    <Button transparent iconRight onPress={() => setopenGridView(true)}>
                        <Text style={{ color: 'white' }}>Gallary{' '}</Text>
                        <Ionicons name='ios-arrow-round-forward' size={40} color="white"></Ionicons>
                    </Button>
                </Right>
            </Header>
            <View style={{ flex: 1 }}>
                {gallaryPic.length > 0 ?
                    <ImageBackground source={require('./assets/background.jpg')}
                        style={{ flex: 1, resizeMode: 'stretch' }}>
                        <ReactNativeZoomableView
                            maxZoom={1.5}
                            minZoom={0.5}
                            zoomStep={0.5}
                            initialZoom={1}
                            bindToBorders={true}>

                            <Image style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                                source={{ uri: gallaryPic[currentPic].uri }} />

                        </ReactNativeZoomableView>
                    </ImageBackground>
                    : null}


            </View>
            {openGridView ? null :
                <Footer>
                    <FooterTab>
                        <Button active onPress={() => previousPic()}>
                            <Text>Previous</Text>
                        </Button>
                        <Button active onPress={() => alert('Double tap on image to zoom')}>
                            <Text>Zoom</Text>
                        </Button>
                        <Button active onPress={() =>
                            Alert.alert(
                                'Delete current picture?',
                                '',
                                [{
                                    text: 'Cancel',
                                    onPress: () => { },
                                    style: 'cancel',
                                },
                                { text: 'OK', onPress: () => confirmDelete() },
                                ],
                                { cancelable: true },
                            )
                        }>
                            <Text>Delete</Text>
                        </Button>
                        <Button active onPress={() => nextPic()}>
                            <Text>Next</Text>
                        </Button>
                    </FooterTab>
                </Footer>
            }

            {openGridView ?
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    left: 0,
                    top: 0,
                    backgroundColor: 'white',
                    zIndex: 5,
                }}>
                    <Header style={{ marginTop: 25 }}>
                        <Left>
                            <Button transparent onPress={() => setopenGridView(false)}>
                                <Ionicons name='ios-arrow-round-back' size={40} color="white"></Ionicons>
                            </Button>
                        </Left>
                        <Body style={{ alignItems: 'center' }}>
                            <Title>Gallary</Title>
                        </Body>
                        <Right>
                            {selectedPic.length > 0 ?
                                <Button transparent iconRight onPress={() =>
                                    Alert.alert(
                                        'Delete selected pictures?',
                                        '',
                                        [{
                                            text: 'Cancel',
                                            onPress: () => { },
                                            style: 'cancel',
                                        },
                                        { text: 'OK', onPress: () => deletePics() },
                                        ],
                                        { cancelable: true },
                                    )}>
                                    <MaterialIcons name='delete' size={40} color="white" />
                                </Button>
                                : null}
                        </Right>
                    </Header>
                    <ScrollView>
                        {gallaryPic.length > 0 ?
                            <Grid>
                                <Col>
                                    {gallaryPic.map((item, index) => {
                                        const { id, uri } = item
                                        return (
                                            index % 2 === 0 ?
                                                <Row key={id} style={{ justifyContent: 'center', marginVertical: 5 }}>
                                                    <Button transparent
                                                        style={{
                                                            height: picWidth, width: picWidth, borderColor: 'green',
                                                            borderWidth: selectedPic.includes(id) ? 2 : 0
                                                        }}
                                                        onPress={() => togglePicHighlight(id)}
                                                        onLongPress={() => picLongPress(index)}>
                                                        <Image style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
                                                            source={{ uri: uri }} />
                                                    </Button>
                                                </Row>
                                                : null)
                                    })}
                                </Col>
                                <Col>
                                    {gallaryPic.map((item, index) => {
                                        const { id, uri } = item
                                        return (
                                            index % 2 === 1 ?
                                                <Row key={id} style={{ justifyContent: 'center', marginVertical: 5 }}>
                                                    <Button transparent
                                                        style={{
                                                            height: picWidth, width: picWidth, borderColor: 'green',
                                                            borderWidth: selectedPic.includes(id) ? 2 : 0
                                                        }}
                                                        onPress={() => togglePicHighlight(id)}
                                                        onLongPress={() => picLongPress(index)}>
                                                        <Image style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
                                                            source={{ uri: uri }} />
                                                    </Button>
                                                </Row>
                                                : null)
                                    })}
                                </Col>
                            </Grid>
                            : null}
                    </ScrollView>
                </View> : null}
        </Container>
    )
}