import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, ActivityIndicator, Image, Platform, Alert, Linking, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import supabase from '../api/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { agruparFerramentas, formatarPatrimonio } from '../utils/toolGrouping';

export default function MeusQRCodes({ navigation }) {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [ferramentas, setFerramentas] = useState([]);
    const [ferramentasAgrupadas, setFerramentasAgrupadas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedQrUrl, setSelectedQrUrl] = useState('');
    const [gruposExpandidos, setGruposExpandidos] = useState([]);

    useEffect(() => {
        async function fetchFerramentas() {
            setLoading(true);
            const { data, error } = await supabase
                .from('ferramentas')
                .select('*')
                .order('data_criacao', { ascending: false });
            if (!error) {
                setFerramentas(data || []);
                // Agrupar ferramentas por nome e categoria
                const agrupadas = agruparFerramentas(data || []);
                setFerramentasAgrupadas(agrupadas);
            }
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
                if (!error && isActive) {
                    setFerramentas(data || []);
                    // Agrupar ferramentas por nome e categoria
                    const agrupadas = agruparFerramentas(data || []);
                    setFerramentasAgrupadas(agrupadas);
                }
            };
            reload();
            return () => { isActive = false; };
        }, [])
    );

    const toggleGrupo = (grupoId) => {
        setGruposExpandidos(prev => {
            if (prev.includes(grupoId)) {
                return prev.filter(id => id !== grupoId);
            } else {
                return [...prev, grupoId];
            }
        });
    };

    const openOptions = (ferramenta) => {
        const qrValue = ferramenta.qrcode_url && ferramenta.qrcode_url !== 'none' 
            ? ferramenta.qrcode_url 
            : `tool-${ferramenta.id}`;
        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(qrValue)}`;
        setSelectedItem({ ...ferramenta, qrValue });
        setSelectedQrUrl(qrImageUrl);
        setOptionsVisible(true);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.background} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.primary }]}>Meus QR Codes</Text>
                <TouchableOpacity 
                    onPress={() => {
                        Alert.alert(
                            'Compartilhar QR Codes',
                            'Toque em um QR Code individual para compartilhá-lo usando o menu nativo do sistema.',
                            [{ text: 'OK' }]
                        );
                    }}
                    style={styles.helpButton}
                >
                    <Ionicons name="information-circle-outline" size={22} color={theme.primary} />
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={theme.primary} /></View>
            ) : ferramentasAgrupadas.length === 0 ? (
                <View style={styles.centered}><Text style={{ color: theme.text, fontSize: 16 }}>Nenhuma ferramenta cadastrada ainda.</Text></View>
            ) : (
                <ScrollView 
                    contentContainerStyle={[styles.qrList, { paddingBottom: 100 }]} 
                    showsVerticalScrollIndicator={false}
                >
                    {ferramentasAgrupadas.map(grupo => {
                        const grupoId = grupo.id || grupo.nome;
                        const estaExpandido = gruposExpandidos.includes(grupoId);
                        const temMultiplas = grupo.total > 1;
                        
                        return (
                            <View key={grupoId} style={[styles.grupoContainer, { backgroundColor: theme.card }]}>
                                {/* Cabeçalho do Grupo */}
                                <TouchableOpacity 
                                    style={styles.grupoHeader}
                                    onPress={() => temMultiplas && toggleGrupo(grupoId)}
                                    activeOpacity={temMultiplas ? 0.7 : 1}
                                >
                                    <View style={styles.leftInfo}>
                                        <Image
                                            source={grupo.imagem_url ? { uri: grupo.imagem_url } : require('../assets/img/inicio.png')}
                                            style={styles.toolImage}
                                        />
                                        <View style={styles.nomeContainer}>
                                            <Text style={[styles.nomeInline, { color: theme.text }]} numberOfLines={2}>
                                                {grupo.nome}
                                            </Text>
                                            {temMultiplas && (
                                                <View style={[styles.badgeContainer, { backgroundColor: theme.primary + '15' }]}>
                                                    <Ionicons name="cube-outline" size={12} color={theme.primary} />
                                                    <Text style={[styles.badgeText, { color: theme.primary }]}>
                                                        {grupo.total} unidades
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    {temMultiplas && (
                                        <Ionicons 
                                            name={estaExpandido ? "chevron-up" : "chevron-down"} 
                                            size={24} 
                                            color={theme.primary} 
                                        />
                                    )}
                                </TouchableOpacity>

                                {/* QR Codes do Grupo */}
                                {temMultiplas && estaExpandido ? (
                                    <View style={styles.qrCodesGrid}>
                                        {grupo.ferramentas.map((ferramenta, index) => {
                                            const qrValue = ferramenta.qrcode_url && ferramenta.qrcode_url !== 'none' 
                                                ? ferramenta.qrcode_url 
                                                : `tool-${ferramenta.id}`;
                                            
                                            return (
                                                <View key={ferramenta.id} style={[styles.qrCodeItem, { backgroundColor: theme.background }]}>
                                                    <QRCode
                                                        value={qrValue}
                                                        size={90}
                                                        backgroundColor="transparent"
                                                    />
                                                    <Text style={[styles.patrimonioText, { color: theme.text }]} numberOfLines={1}>
                                                        {formatarPatrimonio(ferramenta.patrimonio)}
                                                    </Text>
                                                    <TouchableOpacity 
                                                        onPress={() => openOptions(ferramenta)}
                                                        style={[styles.shareButtonSmall, { backgroundColor: theme.primary + '15' }]}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Ionicons name="share-outline" size={14} color={theme.primary} />
                                                        <Text style={[styles.shareHintTextSmall, { color: theme.primary }]}>Compartilhar</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : !temMultiplas ? (
                                    // Ferramenta única - mostrar QR Code diretamente
                                    <View style={styles.qrCodeUnico}>
                                        {(() => {
                                            const ferramenta = grupo.ferramentas && grupo.ferramentas.length > 0 
                                                ? grupo.ferramentas[0] 
                                                : grupo;
                                            const qrValue = ferramenta.qrcode_url && ferramenta.qrcode_url !== 'none' 
                                                ? ferramenta.qrcode_url 
                                                : `tool-${ferramenta.id}`;
                                            
                                            return (
                                                <>
                                                    <QRCode
                                                        value={qrValue}
                                                        size={110}
                                                        backgroundColor="transparent"
                                                    />
                                                    <TouchableOpacity 
                                                        onPress={() => openOptions(ferramenta)}
                                                        style={styles.shareButton}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Ionicons name="share-outline" size={16} color={theme.primary} />
                                                        <Text style={[styles.shareHintText, { color: theme.primary }]}>Compartilhar</Text>
                                                    </TouchableOpacity>
                                                </>
                                            );
                                        })()}
                                    </View>
                                ) : null}
                            </View>
                        );
                    })}
                </ScrollView>
            )}

            {/* Bottom Sheet de opções minimalista */}
            <Modal
                transparent
                visible={optionsVisible}
                animationType="fade"
                onRequestClose={() => setOptionsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.sheet, { backgroundColor: theme.card }]}> 
                        <View style={styles.grabber} />
                        <Text style={[styles.sheetTitle, { color: theme.text }]} numberOfLines={1}>
                            {selectedItem?.nome || 'QR Code'}
                        </Text>
                        {selectedItem?.patrimonio && (
                            <Text style={[styles.patrimonioModalText, { color: theme.text }]}>
                                Patrimônio: {formatarPatrimonio(selectedItem.patrimonio)}
                            </Text>
                        )}
                        {selectedItem?.qrValue ? (
                            <View style={[styles.codeBox, { borderColor: theme.border }]}> 
                                <Text style={[styles.codeText, { color: theme.text }]} numberOfLines={2}>
                                    {selectedItem.qrValue}
                                </Text>
                            </View>
                        ) : null}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: theme.primary }]}
                                activeOpacity={0.85}
                                onPress={() => {
                                    if (selectedQrUrl) {
                                        Linking.openURL(selectedQrUrl).catch(() => {
                                            Alert.alert('Erro', 'Não foi possível abrir o QR Code.');
                                        });
                                    }
                                }}
                            >
                                <Ionicons name="image-outline" size={18} color="#fff" />
                                <Text style={styles.actionText}>Abrir imagem</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setOptionsVisible(false)}
                        >
                            <Text style={styles.cancelText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 18, justifyContent: 'space-between', paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 8) : 8 },
    backButton: { marginRight: 8, padding: 6 },
    title: { fontWeight: '700', fontSize: 23 },
    helpButton: { padding: 6 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 48 },
    qrList: { flexGrow: 1, paddingHorizontal: 16 },
    grupoContainer: { marginBottom: 16, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 2 },
    grupoHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    leftInfo: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, flex: 1 },
    toolImage: { width: 54, height: 54, borderRadius: 10, marginRight: 12, backgroundColor: '#f3f4f6' },
    nomeContainer: { flex: 1, flexShrink: 1 },
    nomeInline: { fontSize: 16, fontWeight: '600', flexShrink: 1, marginBottom: 4 },
    badgeContainer: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
    badgeText: { fontSize: 12, fontWeight: '700' },
    qrCodeUnico: { alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    qrCodesGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', gap: 12 },
    qrCodeItem: { width: '30%', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 8 },
    patrimonioText: { fontSize: 11, fontWeight: '500', marginTop: 6, textAlign: 'center' },
    shareButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'transparent' },
    shareHintText: { fontSize: 12, fontWeight: '500', marginLeft: 6 },
    shareButtonSmall: { flexDirection: 'row', alignItems: 'center', marginTop: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, gap: 4 },
    shareHintTextSmall: { fontSize: 10, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16 },
    grabber: { alignSelf: 'center', width: 36, height: 4, borderRadius: 999, backgroundColor: 'rgba(120,120,120,0.35)', marginBottom: 10 },
    sheetTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    patrimonioModalText: { fontSize: 13, textAlign: 'center', marginBottom: 10, opacity: 0.7 },
    codeBox: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 12 },
    codeText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, textAlign: 'center' },
    actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    actionButton: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    actionText: { color: '#fff', fontWeight: '700', marginLeft: 8 },
    actionButtonGhost: { flex: 1, flexDirection: 'row', height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, backgroundColor: 'transparent' },
    actionTextGhost: { fontWeight: '700', marginLeft: 8 },
    cancelButton: { marginTop: 12, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 16 },
    cancelText: { fontSize: 14, fontWeight: '600', color: '#6B7280' }
});


