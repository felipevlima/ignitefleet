import React, { useEffect, useState } from 'react';
import { Container, Content, Label, Title } from './styles';
import { Alert, FlatList, Text } from 'react-native';
import { HomeHeader } from '../../components/HomeHeader';
import { CarStatus } from '../../components/CarStatus';
import { useNavigation } from '@react-navigation/native'
import { useQuery, useRealm } from '../../libs/realm';
import { Historic } from '../../libs/realm/schemas/Historic';
import { HistoricCard, HistoricCardProps } from '../../components/HistoricCard';
import dayjs from 'dayjs'
import { useUser } from '@realm/react'
import { getLastSyncTimestamp, saveLastSyncTimestamp } from '../../libs/asyncStorage/syncStorage';
import Toast from 'react-native-toast-message'
import { TopMessage } from '../../components/TopMessage';
import { CloudArrowUp } from 'phosphor-react-native'

export function Home() {
  const [vehicleHistoric, setVehicleHistoric] = useState<HistoricCardProps[]>([])
  const [vehicleInUser, setVehicleInUser] = useState<Historic | null>(null)
  const [percentage, setPercentage] = useState<string | null>(null)
  const navitation = useNavigation()
  const historic = useQuery(Historic)
  const realm = useRealm()
  const user = useUser()

  function handleRegisterMoviment() {
    if(vehicleInUser?._id) {
      return navitation.navigate('arrival', { id: vehicleInUser._id.toString() })
    } else {
      navitation.navigate('departure')
    }
  }

  function fetchVehicleInUse() {
    try {
      const vehicle = historic.filtered("status = 'departure'")[0]
      setVehicleInUser(vehicle)
    } catch(err) {
      Alert.alert('Veiculo em uso', 'Não foi possivel carregar o veiculo em uso.')
    }
  }

  async function handleHistoric() {
    try {
      const response = historic.filtered("status = 'arrival' SORT(created_at DESC)");

      const lastSync = await getLastSyncTimestamp()

      const formattedHistoric = response.map((item) => {
        return ({
          id: item._id!.toString(),
          licensePlate: item.license_plate,
          created: dayjs(item.created_at).format('[Saida em] DD/MM/YYYY [às] HH:mm'),
          isSync: lastSync > item.updated_at!.getTime(),
        })
      })
      setVehicleHistoric(formattedHistoric)
    } catch(error) {
      Alert.alert('Error', 'Não foi possivel buscar veiculos.')
    }
  }

  function handleHistoricDetails(itemId: string) {
    navitation.navigate('arrival', { id: itemId })
  }

  async function progressNotification(transferred: number, transferable: number) {
    const percentage = (transferred/transferable) * 100
    
    if (percentage === 100) {
      await saveLastSyncTimestamp()
      await handleHistoric()
      setPercentage(null)
      Toast.show({
        type: 'info',
        text1: 'Todos os dados estão sincronizados.'
      })
    }

    if (percentage < 100) {
      setPercentage(`${percentage.toFixed(0)}% sincronizados. `)
    }
  }
  
  useEffect(() => {
    fetchVehicleInUse()
  }, [])
  
  useEffect(() => {
    realm.addListener('change', () => fetchVehicleInUse())
    
    return () => realm.removeListener('change', fetchVehicleInUse)
  }, [])

  useEffect(() => {
    handleHistoric()
  }, [historic])

  useEffect(() => {
    realm.subscriptions.update((mutableSubs, realm) => {
      const historicByUserQuery = realm.objects('Historic').filtered(`user_id = '${user!.id}'`)
      mutableSubs.add(historicByUserQuery, { name: 'historic_by_user' })
    })
  }, [realm])

  useEffect(() => {
    const syncSession = realm.syncSession

    if (!syncSession) {
      return
    }

    syncSession.addProgressNotification(
      Realm.ProgressDirection.Upload,
      Realm.ProgressMode.ReportIndefinitely,
      progressNotification
    )
    return () => syncSession.removeProgressNotification(progressNotification)
  }, [])

  return (
    <Container>
      {percentage && <TopMessage title={percentage} icon={CloudArrowUp} />}
      <HomeHeader />

      <Content>
        <CarStatus licensePlate={vehicleInUser?.license_plate} onPress={handleRegisterMoviment}/>
        <Title>Histórico</Title>
        <FlatList 
          data={vehicleHistoric}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoricCard data={item} onPress={() => handleHistoricDetails(item.id)}/>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={(
            <Label>
              Nenhum veiculo utilizado.
            </Label>
          )}
        />
      </Content>
    </Container>
  );
}