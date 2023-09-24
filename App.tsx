import 'react-native-get-random-values'
import './src/libs/dayjs'
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ThemeProvider } from 'styled-components/native'
import { WifiSlash } from 'phosphor-react-native'
import { REALM_APP_ID } from '@env'
import { useNetInfo } from '@react-native-community/netinfo'
import { AppProvider, UserProvider } from '@realm/react' 
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto'

import SingIn from './src/screens/SignIn';
import theme from './src/theme';
import { Loading } from './src/components/Loading';
import { Routes } from './src/routes';
import { RealmProvider, syncConfig } from './src/libs/realm';
import { TopMessage } from './src/components/TopMessage';

export default function App() {
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold })
  const netInfo = useNetInfo()

  if(!fontsLoaded) {
    return (
      <Loading />
    )
  }

  return (
    <AppProvider id={REALM_APP_ID}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: theme.COLORS.GRAY_800 }}>
          {!netInfo.isConnected && <TopMessage title='Você está off-line'icon={WifiSlash}/>}
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>
          <UserProvider fallback={SingIn}>
            <RealmProvider sync={syncConfig} fallback={Loading}>
              <Routes />
            </RealmProvider>
          </UserProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </AppProvider>
  );
}

