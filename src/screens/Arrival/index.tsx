import React, { useEffect, useState } from 'react';
import { Container, Content, Description, Footer, Label, LicensePlate, SyncText } from './styles';
import { useRoute } from '@react-navigation/native'
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { ButtonIcon } from '../../components/ButtonIcon';
import { X } from 'phosphor-react-native'
import { useObject, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { BSON } from 'realm'
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native'
import { getLastSyncTimestamp } from '../../libs/asyncStorage/syncStorage';
import { stopLocationTask } from '../../tasks/backgroundTaskLocation';
import { getStorageLocations } from '../../libs/asyncStorage/locationStorage';
import { LatLng } from 'react-native-maps'
import { Map } from '../../components/Map';
import { Locations } from '../../components/Locations';

type RouteParams = {
  id: string
}

export function Arrival() {
  const [pedingSync, setPendingSync] = useState(false)
  const [cordinates, setCordinates] = useState<LatLng[]>([])

  const { goBack } = useNavigation()
  const route = useRoute()
  const realm = useRealm()

  const { id } = route.params as RouteParams

  const historic = useObject(Historic, new BSON.UUID(id) as unknown as string)

  function handleRemoveVehicleUsage() {
    Alert.alert(
      'Cancelar',
      'Cancelar a utilização do veiculo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim',  onPress: () =>  removeVehicle()}
      ]
    )
  }

  async function removeVehicle() {
    realm.write(() => {
      realm.delete(historic)
    })

    await stopLocationTask()
    goBack()
  }

  async function handleVehicleRegister() {
    try {
      if(!historic) {
        return Alert.alert('Error', 'Não foi possivel obter os dados para registrar o veiculo.')
      }

      const locations = await getStorageLocations()


      realm.write(() => {
        historic.status = 'arrival',
        historic.updated_at = new Date()
        historic.coords.push(...locations)
      })
      
      await stopLocationTask()

      Alert.alert('Chegada', 'Chegada registrada com sucesso!')
      goBack()
    } catch(error) {
      Alert.alert('Error', 'Não foi possivel registrar a chegada do veiculo')
    }
  }

  const title = historic?.status === 'departure' ? 'Chegada' : 'Detalhes' 

  async function getLocationInfo() {
    if(!historic) {
      return;
    }
    const lastSync = await getLastSyncTimestamp()
    const updatedAt = historic!.updated_at.getTime()

    setPendingSync(updatedAt > lastSync)

    if (historic?.status === 'departure') {
      const locationsStorage = await getStorageLocations()
      setCordinates(locationsStorage)
    } else {
      setCordinates(historic?.coords ?? [])
    }

    
  }

  useEffect(() => {
    getLocationInfo()
  }, [historic])

  return (
    <Container>
      <Header title={title}/>

      {cordinates.length > 0 && <Map coordinates={cordinates}/>}
      <Content>
        <Locations 
          arrival={{ label: 'Saida', description: 'Saida teste' }}
          departure={{ label: 'Chegada', description: 'Chegada teste' }}
        />
        <Label>Placa do veículo</Label>
        <LicensePlate>{historic?.license_plate}</LicensePlate>

        <Label>Finalidade</Label>
        <Description>{historic?.description}</Description>
        {pedingSync && <SyncText>Sincronização pendente</SyncText>}
        {historic?.status === 'departure' &&  
          <Footer>
            <ButtonIcon icon={X} onPress={handleRemoveVehicleUsage}/>
            <Button title='Registrar Chegada' onPress={handleVehicleRegister}/>
          </Footer>
        }
      </Content>
    </Container>
  );
}