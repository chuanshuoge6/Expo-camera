import React, { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import { Animated, ScrollView } from 'react-native'
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
import InfiniteScroll from 'react-native-infinite-looping-scroll';
import * as Font from 'expo-font'

export default function App() {
  const [loadfont, setloadfont] = useState(true)
  const [cameraPermission, setcameraPermission] = useState('denied');
  const [storagePermission, setstoragePermission] = useState('denied')
  const [cameraDirection, setcameraDirection] = useState(Camera.Constants.Type.back);
  const [autoFocus, setautoFocus] = useState('on')
  const [whiteBalance, setwhiteBalance] = useState(0)
  const [zoomScale, setzoomScale] = useState(0)

  const wbOrder = [
    'sunny',
    'cloudy',
    'shadow',
    'fluorescent',
    'incandescent',
    'auto',
  ]

  const wbIcons = [
    'wb-auto',
    'wb-sunny',
    'wb-cloudy',
    'beach-access',
    'wb-iridescent',
    'wb-incandescent',
  ]

  useEffect(async () => {

    const grantCamera = await Camera.requestPermissionsAsync();
    setcameraPermission(grantCamera.status)

    const grantStorage = await MediaLibrary.requestPermissionsAsync()
    setstoragePermission(grantStorage.status)

    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    })
    setloadfont(false)

  }, [])

  //bug in software, need to toggle auto focus for some camera to work
  timeout = (sec) => { return new Promise(resolve => setTimeout(resolve, sec)) }

  takePicture = async () => {

    if (this.camera) {
      toggleautoFocus()
      await timeout(100)
      toggleautoFocus()
      await timeout(100)
      toggleautoFocus()
      await timeout(100)
      toggleautoFocus()
      await timeout(1000)

      const { uri } = await this.camera.takePictureAsync();

      await MediaLibrary.saveToLibraryAsync(uri)
        .then(() => {
          alert('image saved!')
        })
        .catch(error => {
          alert('An Error Occurred!')
        });
    }
  }

  togglewhiteBalance = () => {
    whiteBalance < 5 ? setwhiteBalance(whiteBalance + 1) : setwhiteBalance(0)
  }

  toggleautoFocus = () => {
    autoFocus === 'on' ? setautoFocus('off') : setautoFocus('on')
  }

  toggleCamera = () => {
    cameraDirection === Camera.Constants.Type.back ?
      setcameraDirection(Camera.Constants.Type.front) :
      setcameraDirection(Camera.Constants.Type.back)
  }

  onZoomEvent = Animated.event(
    [
      {
        nativeEvent: { scale: new Animated.Value(1) }
      }
    ],
    {
      useNativeDriver: true
    }
  )

  onZoomStateChange = event => {
    const e = event.nativeEvent

    if (e.oldState === 4) {
      //camera zoom: 0 = no zoom, 1 = max zoom
      if (e.scale < 1) {
        setzoomScale(zoomScale + e.scale - 1 < 0 ? 0 : zoomScale + e.scale - 1)
      }
      else {
        setzoomScale(zoomScale + e.scale / 5.0 > 1 ? 1 : zoomScale + e.scale / 5.0)
      }

    }
  }

  if (cameraPermission !== 'granted' || storagePermission !== 'granted') {
    return <Text style={{ marginTop: 25 }}>App uses camera and storage</Text>;
  }

  if (loadfont) {
    return <Container style={{ backgroundColor: 'black' }}><Spinner /></Container>
  }

  return (
    <PinchGestureHandler
      onGestureEvent={() => onZoomEvent}
      onHandlerStateChange={(e) => onZoomStateChange(e)}>
      <View style={{ flex: 1, backgroundColor: 'transparent' }}>

        <Camera style={{ flex: 1 }}
          type={cameraDirection}
          autoFocus={autoFocus}
          whiteBalance={wbOrder[whiteBalance]}
          focusDepth={1}
          zoom={zoomScale}
          ref={ref => { this.camera = ref }}>

          <View style={{
            flex: 1,
            justifyContent: 'space-between',
          }}>
            <View style={{ flex: 0.12, backgroundColor: 'transparent' }}>
              <ScrollView horizontal={true}
                style={{
                  marginTop: 25,
                  backgroundColor: 'transparent',
                }} >
                <Button rounded transparent style={{ height: 50, marginLeft: 40, marginRight: 20 }}
                  onPress={() => togglewhiteBalance()}>
                  <MaterialIcons name={wbIcons[whiteBalance]} size={40} color="white" />
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => alert('double finger gesture\nstretch => zoom in\nsqueeze => zoom out')}>
                  <Text style={{ color: 'white', fontSize: 25 }}>x{(1 + 4 * zoomScale).toFixed(1)}</Text>
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => toggleCamera()}>
                  <Ionicons name="ios-reverse-camera" size={40} color="white" />
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => toggleautoFocus()}>
                  <Text style={{ color: autoFocus === 'on' ? "white" : "#6b6b6b", fontSize: 25 }}>AF</Text>
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => toggleautoFocus()}>
                  <Text style={{ color: autoFocus === 'on' ? "white" : "#6b6b6b", fontSize: 25 }}>AF</Text>
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => toggleautoFocus()}>
                  <Text style={{ color: autoFocus === 'on' ? "white" : "#6b6b6b", fontSize: 25 }}>AF</Text>
                </Button>
              </ScrollView>
            </View>
            <View style={{
              flex: 0.12,
              backgroundColor: 'transparent',
              justifyContent: 'center',
              flexDirection: 'row',
              marginBottom: 25,
            }}>
              <Button rounded transparent style={{ height: 80 }}
                onPress={() => { takePicture() }}>
                <Icon name='camera' style={{ fontSize: 60, color: 'white' }} ></Icon>
              </Button>
            </View>
          </View>

        </Camera>

      </View>
    </PinchGestureHandler>
  );
}