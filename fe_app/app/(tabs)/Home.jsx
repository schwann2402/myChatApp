import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import useGlobal from '@/global'

const Home = () => {
    const socketConnet = useGlobal(state => state.socketConnect)
    const socketClose = useGlobal(state => state.socketClose)

    useEffect(() => {
        console.log("here")
        socketConnet()
        return () => {
            socketClose()
        }
    }, [])

  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})