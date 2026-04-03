// LoginScreen.js — Farmer logs in here
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';
import { authActions } from '../store';

export default function LoginScreen({ navigation }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Please enter phone and password');
            return;
        }
        try {
            setLoading(true);
            const response = await authAPI.login({ phone, password });
            const { token, user } = response.data;

            // Save token so we stay logged in
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            // Update Redux store
            dispatch(authActions.setUser({ user, token }));
        } catch (error) {
            Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Logo / Header */}
            <View style={styles.header}>
                <Text style={styles.logo}>🌾</Text>
                <Text style={styles.title}>Smart Agri Assistant</Text>
                <Text style={styles.subtitle}>{t('welcome')}</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
                <Text style={styles.label}>{t('phone')}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>{t('password')}</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* Login Button */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.buttonText}>{t('login')}</Text>
                    }
                </TouchableOpacity>

                {/* Go to Register */}
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.link}>
                        Don't have an account? <Text style={styles.linkBold}>Register here</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7E6', justifyContent: 'center', padding: 24 },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 64 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2D6A4F', marginTop: 8 },
    subtitle: { fontSize: 16, color: '#52B788', marginTop: 4 },
    form: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 4 },
    label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 12 },
    input: {
        borderWidth: 1, borderColor: '#D0E8C0', borderRadius: 10,
        padding: 12, fontSize: 16, backgroundColor: '#F9FFF5',
    },
    button: {
        backgroundColor: '#2D6A4F', borderRadius: 10,
        padding: 16, alignItems: 'center', marginTop: 24,
    },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { textAlign: 'center', marginTop: 16, color: '#666', fontSize: 14 },
    linkBold: { color: '#2D6A4F', fontWeight: 'bold' },
});