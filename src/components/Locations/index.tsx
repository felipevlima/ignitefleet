import { Car, FlagCheckered } from 'phosphor-react-native'
import { LocationInfo, LocationInfoProps } from '../LocationInfo'
import { Container, Arrival, Line } from './styles';

type Props = {
  departure: LocationInfoProps;
  arrival: LocationInfoProps;
}

export function Locations({ departure, arrival }: Props) {
  return (
    <Container>
      <LocationInfo
        icon={Car}
        label={departure.label}
        description={departure.description}
      />

      <Line />

      <LocationInfo 
        icon={FlagCheckered}
        label={arrival.label}
        description={arrival.description}
      />
    </Container>
  );
}