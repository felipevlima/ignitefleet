import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_ASYNC_KEY = '@ignitefleet:last_sync'

export async function saveLastSyncTimestamp() {
  const timestap = new Date().getTime()
  await AsyncStorage.setItem(STORAGE_ASYNC_KEY, timestap.toString())

  return timestap
}

export async function getLastSyncTimestamp() {
  const response = await AsyncStorage.getItem(STORAGE_ASYNC_KEY)
  return Number(response)
}