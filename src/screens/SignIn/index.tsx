import { Container, Title, Slogan } from './styles'
import * as WebBrowser  from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { ANDROID_CLIENT_ID, IOS_CLIENT_ID } from '@env'

import backgroundIMG from '../../assets/background.png'
import { Button } from '../../components/Button';
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { Realm, useApp } from '@realm/react'
WebBrowser.maybeCompleteAuthSession()

export default function SingIn() {
  const [isLoading, setIsLoading] = useState(false)
  const app = useApp()
  const [_, response, googleSignIn] = Google.useAuthRequest({ 
    androidClientId: ANDROID_CLIENT_ID, 
    iosClientId: IOS_CLIENT_ID, 
    scopes: ['profile', 'email'] 
  })

  function handleGoogleSignIn() {
    setIsLoading(true)
    googleSignIn().then((response) => {
      if(response.type !== "success") {
        setIsLoading(false)
      }
    })
  }

  useEffect(() => {
    if(response?.type === 'success') {
      setIsLoading(false)
      if(response.authentication?.idToken) {
        const credentials = Realm.Credentials.jwt(response.authentication.idToken)
        app.logIn(credentials).catch(err => {
          Alert.alert('Entrar', 'Não foi possivel salvar no Realm.')
          setIsLoading(false)
        })
      }  else {
        Alert.alert('Entrar', 'Não foi possivel conectar com sua conta Google.')
        setIsLoading(false)
      }
    }
  }, [response])

  return (
    <Container source={backgroundIMG}>
      <Title>Ignite Fleet</Title>
      <Slogan>
        Gestão de uso de veículos
      </Slogan>
      <Button title='Entrar com o Google' isLoading={isLoading} onPress={handleGoogleSignIn}/>
    </Container>
  );
}

