// IrrigationScreen.js — Farmer fills crop & soil info to get watering advice
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { irrigationAPI } from '../services/api';

export default function IrrigationScreen() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [form, setForm] = useState({
        cropType: 'Tomato',
        soilType: 'loamy',
        growthStage: 'vegetative',
        fieldArea: 1,
        currentSoilMoisture: 50,
    });

    const update = (key, val) => setForm({ ...form, [key]: val });

    const crops = ['Tomato', 'Potato', 'Corn', 'Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Soybean'];
    const soils = ['sandy', 'loamy', 'clay', 'silty', 'peaty'];
    const growthStages = ['seedling', 'vegetative', 'flowering', 'fruiting', 'harvest'];

    const getAdvice = async () => {
        try {
            setLoading(true);
            let lat = 18.52, lon = 73.85;
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    lat = loc.coords.latitude;
                    lon = loc.coords.longitude;
                }
            } catch { }

            const response = await irrigationAPI.getRecommendation({ ...form, lat, lon });
            setResult(response.data.recommendation);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Could not get recommendation');
        } finally {
            setLoading(false);
        }
    };

    const Selector = ({ label, options, selected, onSelect }) => (
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {options.map((opt) => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.chip, selected === opt && styles.chipActive]}
                        onPress={() => onSelect(opt)}
                    >
                        <Text style={[styles.chipText, selected === opt && styles.chipTextActive]}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>💧 {t('irrigate')}</Text>

            <Selector label={t('cropType')} options={crops} selected={form.cropType} onSelect={(v) => update('cropType', v)} />
            <Selector label={t('soilType')} options={soils} selected={form.soilType} onSelect={(v) => update('soilType', v)} />
            <Selector label={t('growthStage')} options={growthStages} selected={form.growthStage} onSelect={(v) => update('growthStage', v)} />

            <TouchableOpacity style={styles.btn} onPress={getAdvice} disabled={loading}>
                {loading
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.btnText}>💧 {t('getAdvice')}</Text>
                }
            </TouchableOpacity>

            {/* Result */}
            {result && (
                <View style={[styles.resultCard, { borderColor: result.shouldIrrigate ? '#2196F3' : '#4CAF50' }]}>
                    <Text style={styles.resultTitle}>
                        {result.shouldIrrigate ? '💧 Irrigate Today' : '✅ No Irrigation Needed'}
                    </Text>

                    {result.shouldIrrigate && (
                        <>
                            <InfoRow icon="💦" label={t('waterAmount')} value={`${result.waterAmount} ${t('litersPerAcre')}`} />
                            <InfoRow icon="⏰" label={t('bestTime')} value={result.bestTime} />
                            <InfoRow icon="📅" label="Next Irrigation" value={new Date(result.nextIrrigationDate).toDateString()} />
                        </>
                    )}

                    <View style={styles.divider} />
                    <Text style={styles.reason}>{result.reason}</Text>

                    {result.tips?.length > 0 && (
                        <>
                            <Text style={styles.tipsTitle}>💡 Tips</Text>
                            {result.tips.map((tip, i) => (
                                <Text key={i} style={styles.tip}>• {tip}</Text>
                            ))}
                        </>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const InfoRow = ({ icon, label, value }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 }}>
        <Text style={{ color: '#666' }}>{icon} {label}</Text>
        <Text style={{ color: '#333', fontWeight: '600' }}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7E6', padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#2D6A4F', marginBottom: 16 },
    label: { fontSize: 14, color: '#555', marginBottom: 8 },
    chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#D0E8C0' },
    chipActive: { backgroundColor: '#2D6A4F' },
    chipText: { color: '#2D6A4F', fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    btn: { backgroundColor: '#1565C0', borderRadius: 12, padding: 18, alignItems: 'center', marginVertical: 16 },
    btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 2, marginBottom: 30 },
    resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
    reason: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
    tipsTitle: { fontSize: 15, fontWeight: 'bold', color: '#2D6A4F', marginBottom: 8 },
    tip: { fontSize: 13, color: '#444', lineHeight: 22 },
});