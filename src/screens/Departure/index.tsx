import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Car, Key } from 'phosphor-react-native'
import {  
  useForegroundPermissions, 
  watchPositionAsync, 
  LocationAccuracy,
  LocationSubscription,
  LocationObjectCoords,
  requestBackgroundPermissionsAsync
} from 'expo-location'
import { useUser } from '@realm/react'
import { useNavigation } from '@react-navigation/native'

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { LicensePlateInput } from '../../components/LicensePlateInput';
import { Loading } from '../../components/Loading';
import { LocationInfo } from '../../components/LocationInfo';
import { Map } from '../../components/Map';
import { TextAreaInput } from '../../components/TextAreaInput';

import { useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';

import { getAddressLocation } from '../../utils/getAddressLocation';
import { licensePlateValidate } from '../../utils/licensePlateValidate';

import { Container, Content, Message } from './styles';
import { startLocationTask } from '../../tasks/backgroundTaskLocation';

export function Departure() {
  const [isLoading, setIsLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [currentAddress, setCurrentAddress] = useState<string | null>(null)
  const [currentCoords, setCurrentCoords] = useState<LocationObjectCoords | null>(null)
  
  const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions()

  const descriptionRef = useRef<TextInput>(null)
  const licensePlateRef = useRef<TextInput>(null)

  const realm = useRealm()
  const { goBack } = useNavigation()
  const user = useUser()

  async function handleDepartureRegister() {
    try {
      if(!licensePlateValidate(licensePlate)) {
        licensePlateRef.current?.focus()
        return Alert.alert('Placa inválida', 'A placa é invalida. Por favor, informe a placa correta do veículo.')
      }
  
      if (description.trim().length === 0) {
        descriptionRef.current?.focus()
        return Alert.alert('Finalidade', 'Por favor, informe a finalidade da utilização do veículo.')
      }

      if (!currentCoords?.latitude && !currentCoords?.longitude) {
        return Alert.alert('Localização', 'Não foi possivel obter a localização atual.')
      }

      setIsLoading(true)
      const backgroundPermissions = await requestBackgroundPermissionsAsync()

      if(!backgroundPermissions.granted) {
        setIsLoading(false)

        return Alert.alert('Localização', 'É necessário permitir que o app tenha acesso a localização em segundo plano. Acesse as configurações do aparelho e ahabilite.');
      }

      startLocationTask()

      realm.write(() => {
        realm.create('Historic', Historic.generate({ 
          user_id: user!.id , 
          license_plate: licensePlate.toUpperCase(), 
          description,
          coords: [{
            latitude: currentCoords.latitude,
            longitude: currentCoords.longitude,
            timestamp: new Date().getTime()
          }]
        }))
      })
      Alert.alert('Saida', 'Saida registrada com sucesso!')
      goBack()
    } catch(error) {
      setIsLoading(false)
      console.trace(error)
      Alert.alert('Error', 'Não foi possivel registrar a saida do veículo.')
    }
  }

  useEffect(() => {
    requestLocationForegroundPermission()
  }, [])


  useEffect(() => {
   if(!locationForegroundPermission?.granted) {
    return;
   }

   let subscription: LocationSubscription;

   watchPositionAsync({
     accuracy: LocationAccuracy.High,
     timeInterval: 1000
   }, (location) => {
    setCurrentCoords(location.coords)
    getAddressLocation(location.coords).then((address) => {
   
      if (address) {
        const addressStringConstructor =  `${address.street}, ${address.streetNumber} - ${address.city}`
        setCurrentAddress(addressStringConstructor)
      }
    }).finally(() => setIsLoadingLocation(false))
   }).then((response) => subscription = response)

   return () => subscription.remove()
  }, [locationForegroundPermission?.granted])

  if (!locationForegroundPermission?.granted) {
    return (
      <Container>
        <Header title='Saida'/>
        <Message>
          Você precisa permitir que o aplicativo tenha acesso a localização para utilizar essa funcionalidade.
        Por favor, acesse as configurações do seu dispositivo para conceder essa permissão.
        </Message>
      </Container>
    )
  }

  if (isLoadingLocation) {
    return (
      <Loading />
    )
  }

  return (
    <Container>
      <Header title='Saida'/>
      <KeyboardAwareScrollView>
        <ScrollView>
          {currentCoords && 
            <Map 
              coordinates={[
                currentCoords
              ]}
            />
          }
          <Content>
            {currentAddress && <LocationInfo label='Localização atual' description={currentAddress} icon={Car}/> }
            <LicensePlateInput ref={licensePlateRef} onChangeText={setLicensePlate} label='Placa do veiculo' placeholder="BRA1234" onSubmitEditing={() => descriptionRef.current?.focus()} returnKeyType='next'/>
            <TextAreaInput 
              onChangeText={setDescription}
              ref={descriptionRef} 
              label="Finalidade" 
              placeholder='Vou utilizar o veículo para...'
              onSubmitEditing={handleDepartureRegister}
              returnKeyType='send'
              blurOnSubmit
            />
            <Button title='Registrar Saída' onPress={handleDepartureRegister} isLoading={isLoading}/>
          </Content>
        </ScrollView>
      </KeyboardAwareScrollView>
    </Container>
  );
}