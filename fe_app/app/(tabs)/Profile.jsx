import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useGlobal from '@/global';
import { Avatar } from 'react-native-paper';
import utils from '@/utils';
import { Button } from 'react-native-paper';
import { useRouter } from 'expo-router';



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

const Profile = () => {
  const user = useGlobal(state => state.user);
  if (!user || !user.user) {
    return null;
  }
  const { name = null, username = null, avatar = null } = user.user
  utils.log('Profile user:', user);
  utils.log('Profile avatar:', avatar);

  if (!name || !username || !avatar) {
    return null;
  }
  
  return (
    <View style={{
        flex: 1,
        alignItems: 'center',
        paddingTop: 100
    }}>
      <Avatar.Icon 
        size={100} 
        style={styles.avatar} 
        icon={avatar.icon}
        color="white"
        backgroundColor={avatar.color}
      />
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>{name}</Text>
      <Text style={{ fontSize: 16, marginTop: 5 }}>@{username}</Text>
      <ProfileLogout />
    </View>
  )
}

export default Profile

const styles = StyleSheet.create({})