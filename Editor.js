import React, { useState, useEffect } from 'react';
import { BackHandler } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image, ImageBackground, Alert, Dimensions, ScrollView, Slider } from 'react-native'
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
import { CustomSlider } from './multiSlider/CustomSlider'

const picWidth = Math.round(Dimensions.get('window').width) / 2 - 20;

export default function Editor(props) {
    const [gallaryPic, setgalleryPic] = useState([])
    const [currentPic, setcurrentPic] = useState(0)
    const [openGridView, setopenGridView] = useState(false)
    const [selectedPic, setselectedPic] = useState([])
    const [activeFab, setactiveFab] = useState(false)
    const [showSlider, setshowSlider] = useState(false)

    useEffect(() => {
        setcurrentPic(0)
        getPictureFromGallary()

        //if back key is pressed on the phone, close editor
        BackHandler.addEventListener('hardwareBackPress', () => {
            props.closeEditor()
        });

        //component will unmount
        return () => { BackHandler.removeEventListener('hardwareBackPress') }
    }, [])

    getPictureFromGallary = async () => {
        const pics = await MediaLibrary.getAssetsAsync({
            sortBy: MediaLibrary.SortBy.modificationTime
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

    confirmDelete = async (image) => {
        //remove picture in android directory
        await MediaLibrary.deleteAssetsAsync(image)
            .then(async () => {
                //remove picture in memory
                await setgalleryPic(gallaryPic.filter(item => item.id !== image.id))
                await setselectedPic(selectedPic.filter(id => id !== image.id))
                //correct current pic index
                previousPic()
                nextPic()
            })
            .catch(error => {
                alert(error)
            });
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
        let i = 0
        selectedPic.forEach(async (id) => {
            const removePic = gallaryPic.find(item => item.id === id)
            //remove picture in android directory
            await MediaLibrary.deleteAssetsAsync(removePic)
            i++
            //all pics deleted from android storage
            if (i === selectedPic.length) {
                //remove picture in memory
                setgalleryPic(gallaryPic.filter(item => !selectedPic.includes(item.id)))

                setselectedPic([])
                setcurrentPic(0)
            }
        })
    }

    shareImage = async (image) => {
        //copy image from memory to app cache, app cache will be automatically cleaned when storage is low
        //sharing can't access 'file:///storage/emulated/0/DCIM/e3bda948-2407-47e1-b5cf-12e7705bf86e.jpg'
        //have to copy to 'file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540chuanshuoge%252Fexpo-medialibrary/e3bda948-2407-47e1-b5cf-12e7705bf86e.jpg'
        //console.log(FileSystem.cacheDirectory + image.filename)
        await FileSystem.copyAsync({
            from: image.uri,
            to: FileSystem.cacheDirectory + image.filename
        })

        await Sharing.shareAsync(FileSystem.cacheDirectory + image.filename)
    }

    rotatePic = async (image) => {
        //console.log(image)
        const newImage = await ImageManipulator.manipulateAsync(
            image.uri,
            [{ rotate: 90 }],
            {
                compress: 1,
                format: image.filename.includes('png') ? ImageManipulator.SaveFormat.PNG :
                    ImageManipulator.SaveFormat.JPEG
            }
        );
        //console.log(newImage)
        await MediaLibrary.saveToLibraryAsync(newImage.uri)
            .then(async () => {
                await getPictureFromGallary()
                await setcurrentPic(0)
            })
            .catch(error => {
                alert(error)
            });
        //console.log(gallaryPic)
    }

    mirrorPic = async (image) => {
        const newImage = await ImageManipulator.manipulateAsync(
            image.uri,
            [{ flip: ImageManipulator.FlipType.Horizontal }],
            {
                compress: 1,
                format: image.filename.includes('png') ? ImageManipulator.SaveFormat.PNG :
                    ImageManipulator.SaveFormat.JPEG
            }
        );

        await MediaLibrary.saveToLibraryAsync(newImage.uri)
            .then(async () => {
                await getPictureFromGallary()
                await setcurrentPic(0)
            })
            .catch(error => {
                alert(error)
            });
    }

    multiSliderValueCallback = (values) => {
        console.log(values)
    }

    return (
        <Container>
            {showSlider ? null :
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
                </Header>}
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

                {openGridView ? null :
                    <Fab
                        active={activeFab}
                        direction="up"
                        containerStyle={{}}
                        style={{ backgroundColor: '#5067FF' }}
                        position="bottomRight"
                        onPress={() => activeFab ? setactiveFab(false) : setactiveFab(true)}>
                        <Foundation name='social-yelp'></Foundation>

                        <Button style={{ backgroundColor: '#34A34F' }}
                            onPress={() => shareImage(gallaryPic[currentPic])}>
                            <Foundation name='share' size={30} color="white"></Foundation>
                        </Button>
                        <Button style={{ backgroundColor: 'yellow' }}
                            onPress={() => rotatePic(gallaryPic[currentPic])}>
                            <MaterialCommunityIcons name='axis-x-rotate-clockwise' size={30} />
                        </Button>
                        <Button style={{ backgroundColor: 'pink' }}
                            onPress={() => mirrorPic(gallaryPic[currentPic])}>
                            <Octicons name='mirror' size={30} />
                        </Button>
                        <Button style={{ backgroundColor: 'cyan' }}
                            onPress={() => { setshowSlider(true); setactiveFab(false) }}>
                            <Foundation name='crop' size={30} />
                        </Button>
                        <Button style={{ backgroundColor: 'purple' }}
                            onPress={() => alert('double tap on image to zoom')}>
                            <Foundation name='zoom-in' size={30} color="white"></Foundation>
                        </Button>
                        <Button style={{ backgroundColor: '#DD5144' }}
                            onPress={() =>
                                Alert.alert(
                                    'Delete current picture?',
                                    '',
                                    [{
                                        text: 'Cancel',
                                        onPress: () => { },
                                        style: 'cancel',
                                    },
                                    { text: 'OK', onPress: () => confirmDelete(gallaryPic[currentPic]) },
                                    ],
                                    { cancelable: true },
                                )
                            }>
                            <MaterialIcons name='delete' size={30} color="white" />
                        </Button>
                    </Fab>
                }
            </View>

            {openGridView || showSlider ? null :
                <Footer>
                    <FooterTab>
                        <Button active onPress={() => previousPic()}>
                            <Text>Previous</Text>
                        </Button>
                        <Button active onPress={() => nextPic()}>
                            <Text>Next</Text>
                        </Button>
                    </FooterTab>
                </Footer>
            }

            {showSlider ?
                <Footer style={{ zIndex: 7 }}>
                    <FooterTab>
                        <Button active onPress={() => previousPic()}>
                            <Text>confirm</Text>
                        </Button>
                        <Button active onPress={() => { setshowSlider(false); setactiveFab(true) }}>
                            <Text>Cancel</Text>
                        </Button>
                    </FooterTab>
                </Footer>
                : null}

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
                                <Button transparent onPress={() =>
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
                                    {
                                        gallaryPic.length % 2 === 1 ?
                                            <Row style={{ justifyContent: 'center', marginVertical: 5 }}>
                                                <Button transparent
                                                    style={{
                                                        height: picWidth, width: picWidth
                                                    }}>
                                                </Button>
                                            </Row>
                                            : null
                                    }
                                </Col>
                            </Grid>
                            : null}
                    </ScrollView>
                </View> : null}

            {showSlider ?
                <View style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    left: 0,
                    top: 0,
                    backgroundColor: 'transparent',
                    zIndex: 6,
                }}>
                    <View style={{ marginTop: 25 }}>
                        <CustomSlider
                            min={1}
                            max={7}
                            LRpadding={40}
                            callback={this.multiSliderValueCallback}
                            single={false}
                        />
                    </View>
                </View>
                : null

            }
        </Container>
    )
}