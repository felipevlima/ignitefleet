import React from 'react';
import { TouchableOpacityProps } from 'react-native'
import { Container, IconBox, Message, TextHighlight } from './styles';
import { Car, Key } from 'phosphor-react-native'

import { useTheme } from 'styled-components';

type Props = TouchableOpacityProps & {
  licensePlate?: string | null
}

export function CarStatus({ licensePlate, ...rest }: Props) {
  const theme = useTheme()
  const Icon = licensePlate ? Car : Key
  const message = licensePlate ? `Veículo ${licensePlate} em uso. ` : `Nenhum veiculo em uso. `
  const status = licensePlate ? 'chegada' : 'saida'

  return (
    <Container {...rest}>
      <IconBox>
        <Icon size={32} color={theme.COLORS.BRAND_LIGHT}/>
      </IconBox>
      <Message>
        {message}
        <TextHighlight>
          Clique aqui para registrar a {status}
        </TextHighlight>
      </Message>
    </Container>
  );
}