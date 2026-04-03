// DashboardScreen.js — Main home screen after login
import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { weatherAPI } from '../services/api';
import { weatherActions } from '../store';

export default function DashboardScreen({ navigation }) {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { user } = useSelector((s) => s.auth);
    const { current } = useSelector((s) => s.weather);
    const [loadingWeather, setLoadingWeather] = useState(false);

    // Load weather when screen opens
    useEffect(() => {
        fetchWeather();
    }, []);

    const fetchWeather = async () => {
        try {
            setLoadingWeather(true);
            // Ask for location permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // Use a default location if permission denied
                const res = await weatherAPI.getCurrent(18.52, 73.85);
                dispatch(weatherActions.setCurrent(res.data.weather));
                return;
            }
            const loc = await Location.getCurrentPositionAsync({});
            const res = await weatherAPI.getCurrent(loc.coords.latitude, loc.coords.longitude);
            dispatch(weatherActions.setCurrent(res.data.weather));
        } catch (e) {
            console.log('Weather fetch error:', e.message);
        } finally {
            setLoadingWeather(false);
        }
    };

    // Quick action cards on the dashboard
    const quickActions = [
        { icon: '🔍', title: 'Detect Disease', subtitle: 'Scan a leaf photo', screen: 'Disease', color: '#E8F5E9' },
        { icon: '💧', title: 'Irrigation Advice', subtitle: 'Get watering advice', screen: 'Irrigation', color: '#E3F2FD' },
        { icon: '☁️', title: 'Weather Details', subtitle: 'Full forecast', screen: 'Weather', color: '#FFF3E0' },
        { icon: '📋', title: 'My History', subtitle: 'Past scans & advice', screen: 'History', color: '#F3E5F5' },
    ];

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>🌾 {t('welcome')}</Text>
                <Text style={styles.name}>{user?.name || 'Farmer'}</Text>
            </View>

            {/* Weather Card */}
            <View style={styles.weatherCard}>
                <Text style={styles.weatherTitle}>☁️ Current Weather</Text>
                {loadingWeather ? (
                    <ActivityIndicator color="#2D6A4F" />
                ) : current ? (
                    <View>
                        <View style={styles.weatherRow}>
                            <Text style={styles.weatherTemp}>{current.temperature}°C</Text>
                            <View>
                                <Text style={styles.weatherCity}>{current.city}</Text>
                                <Text style={styles.weatherCondition}>{current.condition}</Text>
                            </View>
                        </View>
                        <View style={styles.weatherStats}>
                            <Text style={styles.weatherStat}>💧 {current.humidity}%</Text>
                            <Text style={styles.weatherStat}>💨 {current.windSpeed} m/s</Text>
                            <Text style={styles.weatherStat}>🌧️ {current.rainfall}mm</Text>
                        </View>
                        {/* Farming Alerts */}
                        {current.alerts?.map((alert, i) => (
                            <View key={i} style={styles.alertBadge}>
                                <Text style={styles.alertText}>{alert.message}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.noData}>Could not load weather data</Text>
                )}
            </View>

            {/* Quick Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
                {quickActions.map((action) => (
                    <TouchableOpacity
                        key={action.screen}
                        style={[styles.actionCard, { backgroundColor: action.color }]}
                        onPress={() => navigation.navigate(action.screen)}
                    >
                        <Text style={styles.actionIcon}>{action.icon}</Text>
                        <Text style={styles.actionTitle}>{action.title}</Text>
                        <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Tips Section */}
            <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 Today's Farming Tip</Text>
                <Text style={styles.tipsText}>
                    Check your crops early in the morning for signs of disease. Early detection can save up to 80% of your crop!
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7E6' },
    header: { backgroundColor: '#2D6A4F', padding: 24, paddingTop: 50 },
    greeting: { color: '#B7E4C7', fontSize: 14 },
    name: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
    weatherCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 3 },
    weatherTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    weatherRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    weatherTemp: { fontSize: 48, fontWeight: 'bold', color: '#2D6A4F' },
    weatherCity: { fontSize: 18, fontWeight: '600', color: '#333' },
    weatherCondition: { fontSize: 14, color: '#888', textTransform: 'capitalize' },
    weatherStats: { flexDirection: 'row', gap: 16, marginTop: 12 },
    weatherStat: { fontSize: 14, color: '#555' },
    alertBadge: { backgroundColor: '#FFF3CD', borderRadius: 8, padding: 8, marginTop: 8 },
    alertText: { fontSize: 13, color: '#856404' },
    noData: { color: '#888', textAlign: 'center' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2D6A4F', marginHorizontal: 16, marginTop: 8 },
    actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 8, paddingHorizontal: 12 },
    actionCard: { width: '47%', borderRadius: 16, padding: 16, elevation: 2 },
    actionIcon: { fontSize: 32 },
    actionTitle: { fontSize: 15, fontWeight: 'bold', color: '#333', marginTop: 8 },
    actionSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
    tipsCard: { margin: 16, backgroundColor: '#FFFDE7', borderRadius: 16, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F9A825' },
    tipsTitle: { fontSize: 15, fontWeight: 'bold', color: '#F57F17', marginBottom: 8 },
    tipsText: { fontSize: 14, color: '#555', lineHeight: 20 },
});