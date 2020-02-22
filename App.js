import React, { useState, useEffect } from 'react';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as WebBrowser from 'expo-web-browser';
import { Animated, ScrollView, Image } from 'react-native'
import Editor from './Editor'
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
import * as Font from 'expo-font'

export default function App() {
  const [loadfont, setloadfont] = useState(true)
  const [cameraPermission, setcameraPermission] = useState('denied');
  const [storagePermission, setstoragePermission] = useState('denied')
  const [cameraDirection, setcameraDirection] = useState(Camera.Constants.Type.back);
  const [autoFocus, setautoFocus] = useState('on')
  const [whiteBalance, setwhiteBalance] = useState(0)
  const [zoomScale, setzoomScale] = useState(0)
  const [flash, setflash] = useState(1)
  const [ratios, setratios] = useState([])
  const [selectedRatio, setselectRatio] = useState('16:9')
  const [showOption, setshowOption] = useState(false)
  const [pictureSizes, setpictureSizes] = useState([])
  const [selectedSize, setselectedSize] = useState(0)
  const [scanCode, setscanCode] = useState(false)
  const [detectFace, setdetectFace] = useState(false)
  const [faces, setfaces] = useState([])
  const [lastPicture, setlastPicture] = useState(null)
  const [openEditor, setopenEditor] = useState(false)

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

  const flashModeOrder = [
    'on',
    'auto',
    'torch',
    'off',
  ]

  const flashIcons = [
    'flash-on',
    'flash-auto',
    'highlight',
    'flash-off',
  ]

  useEffect(() => {
    initializeApp()
  }, [])

  initializeApp = async () => {
    const grantCamera = await Camera.requestPermissionsAsync();
    setcameraPermission(grantCamera.status)

    const grantStorage = await MediaLibrary.requestPermissionsAsync()
    setstoragePermission(grantStorage.status)

    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    })
    setloadfont(false)
  }

  //bug in software, need to toggle auto focus for some camera to work
  timeout = (sec) => { return new Promise(resolve => setTimeout(resolve, sec)) }

  takePicture = async () => {

    if (this.camera) {
      /*toggleautoFocus()
      await timeout(100)
      toggleautoFocus()
      await timeout(100)
      toggleautoFocus()
      await timeout(100)
      toggleautoFocus()
      await timeout(1000)*/

      const { uri } = await this.camera.takePictureAsync({ skipProcessing: true });

      await MediaLibrary.saveToLibraryAsync(uri)
        .then(() => {
          setlastPicture(uri)
        })
        .catch(error => {
          alert(error)
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

  toggleFlash = () => {
    flash < 3 ? setflash(flash + 1) : setflash(0)
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

  ratio_size = async () => {
    const ratios = await this.camera.getSupportedRatiosAsync()
    setratios(ratios)

    availablePicSize()
  }

  availablePicSize = async () => {
    let sizes
    try {
      sizes = await this.camera.getAvailablePictureSizesAsync(selectedRatio);
    }
    catch (err) {
      //delete ratio that has no supported picture size
      setratios(ratios.filter(item => { return item !== selectedRatio }))
      setselectRatio('16:9')

      sizes = await this.camera.getAvailablePictureSizesAsync('16:9');
    }

    setpictureSizes(sizes)
    setselectedSize(sizes.length - 1)
  }

  toggleShowOption = () => {
    showOption ? setshowOption(false) : setshowOption(true)
  }

  nextRatio = async () => {
    const length = ratios.length
    if (length === 0) { return }

    const index = ratios.findIndex(item => { return item === selectedRatio })
    index < length - 1 ? await setselectRatio(ratios[index + 1]) : await setselectRatio(ratios[0])

    availablePicSize()
  }

  previousRatio = async () => {
    const length = ratios.length
    if (length === 0) { return }

    const index = ratios.findIndex(item => { return item === selectedRatio })
    index > 0 ? await setselectRatio(ratios[index - 1]) : await setselectRatio(ratios[length - 1])

    availablePicSize()
  }

  nextSize = () => {
    const length = pictureSizes.length
    if (length === 0) { return }

    selectedSize < length - 1 ? setselectedSize(selectedSize + 1) : setselectedSize(0)
  }

  previousSize = () => {
    const length = pictureSizes.length
    if (length === 0) { return }

    selectedSize > 0 ? setselectedSize(selectedSize - 1) : setselectedSize(length - 1)
  }

  toggleScanCode = () => {
    scanCode ? setscanCode(false) : setscanCode(true)
  }

  toggleDetectFace = () => {
    detectFace ? setdetectFace(false) : setdetectFace(true)
  }

  processCodeScan = async (code) => {
    toggleScanCode()
    console.log(code)
    try {
      let result = await WebBrowser.openBrowserAsync(code.data);
      console.log(result)
    }
    catch (err) {
      alert(err)
    }
  }

  processFaces = async (f) => {
    f.faces.length > 0 ? await setfaces(f.faces) : null
    //console.log(f.faces.length, faces)
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

        <Camera style={{ flex: 1, zIndex: 3 }}
          type={cameraDirection}
          onCameraReady={() => ratio_size()}
          pictureSize={pictureSizes[selectedSize]}
          autoFocus={autoFocus}
          whiteBalance={wbOrder[whiteBalance]}
          focusDepth={1}
          zoom={zoomScale}
          flashMode={flashModeOrder[flash]}
          barCodeScannerSettings={{
            barCodeTypes: [
              BarCodeScanner.Constants.BarCodeType.qr,
              BarCodeScanner.Constants.BarCodeType.pdf417,
            ],
          }}
          onBarCodeScanned={scanCode ? (c) => processCodeScan(c) : undefined}
          onFacesDetected={detectFace ? (f) => processFaces(f) : undefined}
          onFaceDetectionError={err => console.log(err)}
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
                  onPress={() => toggleCamera()}>
                  <Ionicons name="ios-reverse-camera" size={40} color="white" />
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 40 }}
                  onPress={() => toggleFlash()}>
                  <MaterialIcons name={flashIcons[flash]} size={40} color="white" />
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => togglewhiteBalance()}>
                  <MaterialIcons name={wbIcons[whiteBalance]} size={40} color="white" />
                </Button>
                <Button rounded transparent style={{ height: 50, marginHorizontal: 20 }}
                  onPress={() => alert('double finger gesture\nstretch => zoom in\nsqueeze => zoom out')}>
                  <Text style={{ color: 'white', fontSize: 25 }}>x{(1 + 4 * zoomScale).toFixed(1)}</Text>
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
              justifyContent: 'space-around',
              flexDirection: 'row',
              marginBottom: 25,
            }}>
              <Button rounded transparent style={{ height: 50, marginTop: 15 }}
                onPress={() => { toggleShowOption() }}>
                <Octicons name="kebab-horizontal" size={40} color="white" />
              </Button>
              <Button rounded transparent style={{ height: 80 }}
                onPress={() => { takePicture() }}>
                <Icon name='camera' style={{ fontSize: 60, color: 'white' }} ></Icon>
              </Button>

              <Button rounded transparent style={{ height: 80 }}
                onPress={() => setopenEditor(true)}>
                <Image source={{ uri: lastPicture }}
                  style={{
                    resizeMode: 'cover',
                    height: 50,
                    width: 50,
                    borderRadius: 25,
                    borderWidth: 1,
                    borderColor: 'white',
                  }}>
                </Image>
              </Button>

            </View>

            {showOption ?
              <View style={{
                position: 'absolute',
                bottom: 100,
                left: 30,
                width: 200,
                height: 200,
                backgroundColor: '#000000BA',
                borderRadius: 4,
                padding: 10,
              }}>
                <View style={{
                  flex: 1,
                  justifyContent: 'space-around',
                }}>
                  <View>
                    <Text style={{ fontSize: 15, alignSelf: 'center', color: 'white' }}>
                      Ratio</Text>
                    <View style={{
                      justifyContent: 'space-around',
                      flexDirection: 'row'
                    }}>
                      <Button small iconLeft style={{ backgroundColor: '#000000BA' }}
                        onPress={() => previousRatio()} >
                        <Ionicons name="md-arrow-dropleft" size={20} color="white" />
                        <Text> </Text>
                      </Button>

                      <Text style={{ color: 'white', fontSize: 15, marginTop: 5 }}>{selectedRatio}</Text>

                      <Button small iconRight style={{ backgroundColor: '#000000BA' }}
                        onPress={() => nextRatio()} >
                        <Text> </Text>
                        <Ionicons name="md-arrow-dropright" size={20} color="white" />
                      </Button>
                    </View>
                  </View>

                  <View style={{
                    flex: 1,
                    justifyContent: 'space-around',
                  }}>
                    <View>
                      <Text style={{ fontSize: 15, alignSelf: 'center', color: 'white' }}>
                        Size</Text>
                      <View style={{
                        justifyContent: 'space-around',
                        flexDirection: 'row'
                      }}>
                        <Button small iconLeft style={{ backgroundColor: '#000000BA' }}
                          onPress={() => previousSize()} >
                          <Ionicons name="md-arrow-dropleft" size={20} color="white" />
                          <Text> </Text>
                        </Button>

                        <Text style={{ color: 'white', fontSize: 15, marginTop: 5 }}>
                          {pictureSizes.length > 0 ? pictureSizes[selectedSize] : ' '}</Text>

                        <Button small iconRight style={{ backgroundColor: '#000000BA' }}
                          onPress={() => nextSize()} >
                          <Text> </Text>
                          <Ionicons name="md-arrow-dropright" size={20} color="white" />
                        </Button>
                      </View>
                    </View>
                  </View>

                  <View style={{
                    flex: 1,
                    justifyContent: 'center',
                  }}>
                    <View style={{
                      justifyContent: 'space-around',
                      flexDirection: 'row'
                    }}>
                      <Button small iconLeft style={{ backgroundColor: '#000000BA' }}
                        onPress={() => toggleDetectFace()} >
                        <MaterialIcons name="tag-faces" size={32} color={detectFace ? "white" : "#858585"} />
                      </Button>

                      <Button small iconRight style={{ backgroundColor: '#000000BA' }}
                        onPress={() => toggleScanCode()} >
                        <MaterialCommunityIcons name="barcode-scan" size={32} color={scanCode ? "white" : "#858585"} />
                      </Button>
                    </View>
                  </View>

                </View>
              </View> :
              null}

          </View>

          {detectFace ?
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              left: 0,
              top: 0,
              backgroundColor: 'transparent',
              zIndex: 2,
            }}
              pointerEvents="none">

              {faces.length > 0 ? faces.map((face, index) => {
                const { bounds, rollAngle, yawAngle } = face
                //console.log(face)
                const { origin, size } = bounds
                //console.log(size.height, size.width, rollAngle, yawAngle)
                return <View style={{
                  borderWidth: 2,
                  borderRadius: 2,
                  position: 'absolute',
                  borderColor: '#FFD700',
                  backgroundColor: 'transparent',
                  height: size.height,
                  width: size.width,
                  left: origin.x,
                  top: origin.y,
                }}
                  transform={[
                    { perspective: 600 },
                    { rotateZ: rollAngle.toFixed(0).toString() + 'deg' },
                    { rotateY: yawAngle.toFixed(0).toString() + 'deg' },
                  ]}
                  key={index}>

                </View>
              })
                : null}
            </View>
            : null
          }

        </Camera>

        {openEditor ?
          <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            backgroundColor: 'white',
            zIndex: 4,
          }}>
            <Editor closeEditor={() => setopenEditor(false)}></Editor>
          </View> : null}
      </View>
    </PinchGestureHandler>
  );
}