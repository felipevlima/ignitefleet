import React from 'react';
import { Container, Title } from './styles';
import { IconBoxProps } from '../ButtonIcon';
import { useTheme } from 'styled-components';
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Props= {
  icon?: IconBoxProps
  title: string 
  variant?: string
}

export function TopMessage({ title, icon: Icon, variant }: Props) {
  const { COLORS } = useTheme()
  const insets = useSafeAreaInsets()
  const paddingTop = insets.top + 5

  return (
    <Container style={{ paddingTop }} variant={variant}>
      {Icon && <Icon size={18} color={COLORS.GRAY_100}/>}
      <Title>{title}</Title>
    </Container>
  );
}