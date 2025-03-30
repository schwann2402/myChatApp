import * as SecureStore from 'expo-secure-store';

async function save(key, value) {
    try {
        await SecureStore.setItemAsync(key, value);
    } catch (error) {
        console.error('Failed to save value:', error);
    }
}

async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
    alert("🔐 Here's your value 🔐 \n" + result);
  } else {
    alert('No values stored under that key.');
  }
}

export { save, getValueFor };
