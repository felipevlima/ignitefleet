import { TouchableOpacityProps, View } from 'react-native';
import { GoogleLogo } from 'phosphor-react-native'

import { Container, Load, Title } from './styles';
import theme from '../../theme';

type Props = TouchableOpacityProps & {
  title: string
  isLoading?: boolean
  hasIcon?: boolean
}

export function Button({ title, isLoading = false, hasIcon = false, ...rest }: Props) {
  return (
    <Container activeOpacity={0.7} disabled={isLoading} {...rest}>
      
      {isLoading ? (
        <Load />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: "center", justifyContent: 'center', width: '100%', gap: 24, paddingHorizontal: 16 }} >
          {hasIcon  && <GoogleLogo size={32} weight="fill" color={theme.COLORS.WHITE} />}
          <Title>
            {title}
          </Title>
        </View>
      )}
    </Container>
  );
}