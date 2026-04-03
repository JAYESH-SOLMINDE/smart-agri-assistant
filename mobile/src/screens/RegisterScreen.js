// RegisterScreen.js — New farmer signs up here
import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { authAPI } from '../services/api';
import { authActions } from '../store';

export default function RegisterScreen({ navigation }) {
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        name: '', phone: '', email: '', password: '', language: 'en',
    });
    const [loading, setLoading] = useState(false);

    const update = (key, val) => setForm({ ...form, [key]: val });

    const handleRegister = async () => {
        if (!form.name || !form.phone || !form.password) {
            Alert.alert('Error', 'Name, phone and password are required');
            return;
        }
        try {
            setLoading(true);
            const response = await authAPI.register(form);
            const { token, user } = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));
            dispatch(authActions.setUser({ user, token }));
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी (Hindi)' },
        { code: 'mr', label: 'मराठी (Marathi)' },
        { code: 'ta', label: 'தமிழ் (Tamil)' },
        { code: 'te', label: 'తెలుగు (Telugu)' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>🌱 Create Account</Text>
            <Text style={styles.subtitle}>Join thousands of smart farmers</Text>

            {[
                { key: 'name', label: 'Full Name', placeholder: 'Your full name', type: 'default' },
                { key: 'phone', label: 'Phone Number', placeholder: '10-digit phone', type: 'phone-pad' },
                { key: 'email', label: 'Email (Optional)', placeholder: 'your@email.com', type: 'email-address' },
                { key: 'password', label: 'Password', placeholder: 'Min 6 characters', type: 'default', secure: true },
            ].map(({ key, label, placeholder, type, secure }) => (
                <View key={key}>
                    <Text style={styles.label}>{label}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder={placeholder}
                        value={form[key]}
                        onChangeText={(val) => update(key, val)}
                        keyboardType={type}
                        secureTextEntry={secure}
                        autoCapitalize="none"
                    />
                </View>
            ))}

            {/* Language Selector */}
            <Text style={styles.label}>Preferred Language</Text>
            <View style={styles.langRow}>
                {languages.map((l) => (
                    <TouchableOpacity
                        key={l.code}
                        style={[styles.langBtn, form.language === l.code && styles.langBtnActive]}
                        onPress={() => update('language', l.code)}
                    >
                        <Text style={[styles.langText, form.language === l.code && styles.langTextActive]}>
                            {l.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>Create Account</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7E6' },
    content: { padding: 24, paddingBottom: 40 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#2D6A4F', textAlign: 'center', marginTop: 20 },
    subtitle: { fontSize: 14, color: '#52B788', textAlign: 'center', marginBottom: 24 },
    label: { fontSize: 14, color: '#555', marginBottom: 6, marginTop: 14 },
    input: {
        borderWidth: 1, borderColor: '#D0E8C0', borderRadius: 10,
        padding: 12, fontSize: 16, backgroundColor: '#fff',
    },
    langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#52B788' },
    langBtnActive: { backgroundColor: '#2D6A4F' },
    langText: { fontSize: 12, color: '#2D6A4F' },
    langTextActive: { color: '#fff' },
    button: { backgroundColor: '#2D6A4F', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    link: { textAlign: 'center', marginTop: 16, color: '#666', fontSize: 14 },
    linkBold: { color: '#2D6A4F', fontWeight: 'bold' },
});