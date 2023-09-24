import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { Container, Input, Label } from './styles';
import { useTheme } from 'styled-components';

type Props = TextInputProps & {
  label: string
}

const TextAreaInput = forwardRef<TextInput, Props>(({ label, ...rest }, ref) => {
  const { COLORS } = useTheme()
  return (
    <Container>
      <Label>
        {label}
      </Label>

      <Input 
        ref={ref}
        placeholderTextColor={COLORS.GRAY_400}
        multiline
        autoCapitalize='sentences'
        {...rest}
      />
    </Container>
  );
})

export {TextAreaInput}