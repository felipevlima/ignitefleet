import React from 'react';
import { Container, Greeting, Message, Name, Picture } from './styles';
import { TouchableOpacity } from 'react-native';
import { Power } from 'phosphor-react-native'
import { useUser, useApp } from '@realm/react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import theme from '../../theme';

export function HomeHeader() {
  const user = useUser()
  const app = useApp()
  const insets = useSafeAreaInsets()

  const paddingTop = insets.top + 32

  function handleLogout() {
    app.currentUser?.logOut();
  }

  return (
    <Container style={{ paddingTop }}>
      <Picture source={{ uri: user.profile.pictureUrl }} placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"/>
      <Greeting>
        <Message>
          Olá
        </Message>
        <Name>
          {user.profile.name}
        </Name>
      </Greeting>
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={handleLogout} 
        style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
      >
        <Power size={24} color={theme.COLORS.GRAY_400}/>
      </TouchableOpacity>
    </Container>
  );
}