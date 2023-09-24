import React from 'react';
import { Container, Label, Info, Description } from './styles';
import { IconBox, IconBoxProps } from '../IconBox';

export type LocationInfoProps = {
  label: string;
  description: string
}

type Props = LocationInfoProps & {
  icon: IconBoxProps
}

export function LocationInfo({ label, description, icon }: Props) {
  return (
    <Container>
      <IconBox icon={icon}/>
      <Info>
        <Label numberOfLines={2}>
          {label}
        </Label>

        <Description numberOfLines={1}>
          {description}
        </Description>
      </Info>
    </Container>
  );
}