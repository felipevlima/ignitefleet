import { reverseGeocodeAsync, LocationObjectCoords } from 'expo-location'

export async function getAddressLocation({ latitude, longitude }: LocationObjectCoords) {
  try {
    const adressResponse = await reverseGeocodeAsync({ latitude, longitude })
    return { street: adressResponse[0].street, city: adressResponse[0].city, streetNumber: adressResponse[0].streetNumber }
  } catch(err) {
    console.log(err)
  }
}