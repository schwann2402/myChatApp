import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const AppHeader = ({ 
  title, 
  leftIcon = "menu", 
  rightIcon = "notifications",
  onLeftPress,
  onRightPress,
  showLeftIcon = true,
  showRightIcon = true,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  // Default handlers
  const handleLeftPress = onLeftPress || (() => {
    // Default behavior for left icon (e.g., open drawer or go back)
    console.log('Left icon pressed');
  });

  const handleRightPress = onRightPress || (() => {
    // Default behavior for right icon
    console.log('Right icon pressed');
  });

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight + 10,
        backgroundColor: Colors[colorScheme ?? 'light'].background,
      }
    ]}>
      <View style={styles.content}>
        {showLeftIcon ? (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={handleLeftPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name={leftIcon} size={24} color={tintColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          {title}
        </Text>

        {showRightIcon ? (
          <TouchableOpacity 
            style={styles.iconContainer} 
            onPress={handleRightPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name={rightIcon} size={24} color={tintColor} />
          </TouchableOpacity>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPlaceholder: {
    width: 40,
  },
});

export default AppHeader;
