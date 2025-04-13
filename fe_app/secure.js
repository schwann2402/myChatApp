import * as SecureStore from 'expo-secure-store';

async function save(key, value) {
    try {
        // Validate key
        if (!key) {
            console.error('Cannot save to SecureStore: Key is required');
            return;
        }
        
        // Handle null or undefined values
        if (value === null || value === undefined) {
            console.error('Cannot save null or undefined to SecureStore');
            return;
        }
        
        // Convert to string if not already a string
        if (typeof value !== 'string') {
            try {
                value = JSON.stringify(value);
            } catch (jsonError) {
                console.error('Failed to stringify value for SecureStore:', jsonError);
                return;
            }
        }
        
        // Save to secure store
        await SecureStore.setItemAsync(key, value);
        console.log(`Successfully saved data for key: ${key}`);
    } catch (error) {
        console.error('Failed to save value to SecureStore:', error);
    }
}

async function getValueFor(key) {
  try {
    // Validate key
    if (!key) {
      console.error('Cannot get value from SecureStore: Key is required');
      return null;
    }
    
    // Get value from secure store
    const result = await SecureStore.getItemAsync(key);
    
    if (result) {
      console.log(`Successfully retrieved data for key: ${key}`);
    } else {
      console.log(`No data found for key: ${key}`);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to get value from SecureStore:', error);
    return null;
  }
}

async function remove(key) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error('Failed to remove value:', error);
  }
}

export { save, getValueFor, remove };
