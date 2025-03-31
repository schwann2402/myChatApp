import { StyleSheet, Text, View, Image, Button as RNButton, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import useGlobal from '@/global';
import utils from '@/utils';
import { Avatar, Button, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';



const ProfileLogout = () => {
  const router = useRouter();
  const logout = useGlobal(state => state.logout);
  return (
    <Button
      mode="contained"
      onPress={() => {
        logout()
        router.replace('/SignIn')
      }}
      style={{ marginTop: 20 }}
    >
      Logout
    </Button>
  );
};

const ProfileImage = () => {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      utils.log(result)
    }
  }

  return (
    <View style={styles.avatarContainer}>
      <Avatar.Image 
        size={120} 
        source={image ? { uri: image } : require('@/assets/images/profile.png')} 
        style={styles.avatar}
      />
      <TouchableOpacity onPress={pickImage} style={styles.editIconContainer}>
        <Icon source="pencil" size={20} color="white" />
      </TouchableOpacity>
    </View>
  )
}

const Profile = () => {
  const user = useGlobal(state => state.user);
  if (!user || !user.user) {
    return null;
  }
  const { name = null, username = null } = user.user
  utils.log('Profile user:', user);

  if (!name || !username) {
    return null;
  }
  
  return (
    <View style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 100
    }}>
      <ProfileImage />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>{name}</Text>
      <Text style={{ fontSize: 16, marginTop: 5 }}>@{username}</Text>
      <ProfileLogout />
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50
  },
  image: {
    width: 200,
    height: 200,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20
  },
  avatar: {
    backgroundColor: '#ccc'
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }
})