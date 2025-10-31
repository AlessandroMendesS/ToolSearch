import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import supabase from '../api/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function MeusQRCodes({ navigation }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [ferramentas, setFerramentas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFerramentas() {
            setLoading(true);
            const { data, error } = await supabase
                .from('ferramentas')
                .select('*')
                .order('data_criacao', { ascending: false });
            if (!error) setFerramentas(data || []);
            setLoading(false);
        }
        fetchFerramentas();
    }, [user]);

    useFocusEffect(
        React.useCallback(() => {
            let isActive = true;
            const reload = async () => {
                const { data, error } = await supabase
                    .from('ferramentas')
                    .select('*')
                    .order('data_criacao', { ascending: false });
                if (!error && isActive) setFerramentas(data || []);
            };
            reload();
            return () => { isActive = false; };
        }, [])
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.primary }]}>Meus QR Codes</Text>
            </View>
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={theme.primary} /></View>
            ) : ferramentas.length === 0 ? (
                <View style={styles.centered}><Text style={{ color: theme.text, fontSize: 16 }}>Nenhuma ferramenta cadastrada ainda.</Text></View>
            ) : (
                <ScrollView contentContainerStyle={styles.qrList} showsVerticalScrollIndicator={false}>
                    {ferramentas.map(ferramenta => (
                        <View style={[styles.qrItem, { backgroundColor: theme.card }]} key={ferramenta.id}>
                            <Text style={[styles.nome, { color: theme.text }]} numberOfLines={2}>{ferramenta.nome}</Text>
                            <QRCode
                                value={ferramenta.qrcode_url || 'none'}
                                size={130}
                                backgroundColor="transparent"
                            />
                            <Text style={[styles.qrValue, { color: theme.text, opacity: 0.32, fontSize: 10, marginTop: 8 }]} numberOfLines={1}>{ferramenta.qrcode_url}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 18 },
    backButton: { marginRight: 8, padding: 6 },
    title: { fontWeight: '700', fontSize: 23, marginLeft: 8 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 48 },
    qrList: { flexGrow: 1, alignItems: 'center', paddingBottom: 32 },
    qrItem: { alignItems: 'center', justifyContent: 'center', width: 200, marginBottom: 26, borderRadius: 18, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 2 },
    nome: { fontSize: 17, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    qrValue: { marginTop: 4, textAlign: 'center' }
});


