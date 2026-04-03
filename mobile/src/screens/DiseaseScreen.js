// DiseaseScreen.js — Farmer takes/uploads leaf photo here
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Image, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { diseaseAPI } from '../services/api';

export default function DiseaseScreen() {
    const { t } = useTranslation();
    const [image, setImage] = useState(null);
    const [cropType, setCropType] = useState('Tomato');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const crops = ['Tomato', 'Potato', 'Corn', 'Apple', 'Grape', 'Pepper', 'Rice', 'Wheat'];

    // Open phone camera
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Camera permission required'); return; }
        const res = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!res.canceled) { setImage(res.assets[0].uri); setResult(null); }
    };

    // Open phone gallery
    const pickFromGallery = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });
        if (!res.canceled) { setImage(res.assets[0].uri); setResult(null); }
    };

    // Send image to backend for AI detection
    const detectDisease = async () => {
        if (!image) { Alert.alert('No image', 'Please select or take a leaf photo first'); return; }
        try {
            setLoading(true);
            const response = await diseaseAPI.detect(image, cropType);
            setResult(response.data.result);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Detection failed. Is the server running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>🔍 {t('detect')}</Text>

            {/* Crop Type Selector */}
            <Text style={styles.label}>{t('cropType')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropScroll}>
                {crops.map((crop) => (
                    <TouchableOpacity
                        key={crop}
                        style={[styles.cropChip, cropType === crop && styles.cropChipActive]}
                        onPress={() => setCropType(crop)}
                    >
                        <Text style={[styles.cropChipText, cropType === crop && styles.cropChipTextActive]}>{crop}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Image Area */}
            <View style={styles.imageBox}>
                {image
                    ? <Image source={{ uri: image }} style={styles.leafImage} />
                    : <Text style={styles.imagePlaceholder}>📷 No image selected{'\n'}Take a clear photo of the leaf</Text>
                }
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={takePhoto}>
                    <Text style={styles.btnSecondaryText}>📷 {t('camera')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSecondary} onPress={pickFromGallery}>
                    <Text style={styles.btnSecondaryText}>🖼️ {t('gallery')}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.btnDetect} onPress={detectDisease} disabled={loading}>
                {loading
                    ? <><ActivityIndicator color="#fff" /><Text style={styles.btnDetectText}> Analyzing...</Text></>
                    : <Text style={styles.btnDetectText}>🔬 Analyze Leaf</Text>
                }
            </TouchableOpacity>

            {/* Result Card */}
            {result && (
                <View style={[styles.resultCard, { borderColor: result.isHealthy ? '#52B788' : '#E63946' }]}>
                    <Text style={styles.resultTitle}>{t('result')}</Text>

                    {result.isHealthy ? (
                        <Text style={styles.healthyText}>✅ {t('healthy')}</Text>
                    ) : (
                        <>
                            <Row label={t('disease')} value={result.disease} />
                            <Row label={t('confidence')} value={result.confidence} />
                            <Row label="Severity" value={result.severity?.toUpperCase()} />
                            <View style={styles.divider} />
                            <Text style={styles.sectionHead}>💊 {t('treatment')}</Text>
                            <Text style={styles.bodyText}>{result.treatment}</Text>
                            <Text style={styles.sectionHead}>🛡️ {t('prevention')}</Text>
                            <Text style={styles.bodyText}>{result.prevention}</Text>
                        </>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

// Small helper component for label-value rows
const Row = ({ label, value }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 }}>
        <Text style={{ color: '#666', fontSize: 14 }}>{label}</Text>
        <Text style={{ color: '#333', fontSize: 14, fontWeight: '600' }}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F7E6', padding: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#2D6A4F', marginBottom: 16 },
    label: { fontSize: 14, color: '#555', marginBottom: 8 },
    cropScroll: { marginBottom: 16 },
    cropChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', marginRight: 8, borderWidth: 1, borderColor: '#D0E8C0' },
    cropChipActive: { backgroundColor: '#2D6A4F' },
    cropChipText: { color: '#2D6A4F', fontWeight: '600' },
    cropChipTextActive: { color: '#fff' },
    imageBox: { height: 220, backgroundColor: '#fff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden', borderWidth: 2, borderColor: '#D0E8C0', borderStyle: 'dashed' },
    leafImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { color: '#999', textAlign: 'center', fontSize: 14, lineHeight: 22 },
    buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    btnSecondary: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D6A4F' },
    btnSecondaryText: { color: '#2D6A4F', fontWeight: '600', fontSize: 15 },
    btnDetect: { backgroundColor: '#2D6A4F', borderRadius: 12, padding: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
    btnDetectText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    resultCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, borderWidth: 2, marginBottom: 30 },
    resultTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    healthyText: { fontSize: 16, color: '#52B788', fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
    sectionHead: { fontSize: 15, fontWeight: 'bold', color: '#2D6A4F', marginBottom: 6 },
    bodyText: { fontSize: 14, color: '#444', lineHeight: 22 },
});