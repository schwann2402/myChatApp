import * as SecureStore from 'expo-secure-store';

async function save(key, value) {
    try {
        if (typeof value !== 'string') {
            value = JSON.stringify(value);
        }
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error('Failed to save value:', error);
    }
}

async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  // if (result) {
  //   alert("🔐 Here's your value 🔐 \n" + result);
  // } else {
  //   alert('No values stored under that key.');
  // }
  return result
}

async function remove(key) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Failed to remove value:', error);
  }
}

export { save, getValueFor, remove };
