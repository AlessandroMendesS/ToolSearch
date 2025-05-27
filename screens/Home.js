import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Platform, StatusBar, Dimensions, Alert, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { toolService } from "../api/apiService";

const { width: screenWidth } = Dimensions.get('window');

// Ícones de Categorias Rápidas conforme a imagem
const categoriasRapidasHome = [
  { id: '1', nomeExato: 'Furadeiras', nomeDisplay: "Elétricas", IconeComponent: MaterialCommunityIcons, iconeNome: "drill", iconeSize: 26, corIcone: "#4A5568" },
  { id: '2', nomeExato: 'Chaves', nomeDisplay: "Manuais", IconeComponent: FontAwesome5, iconeNome: "screwdriver", iconeSize: 23, corIcone: "#4A5568" },
  { id: '4', nomeExato: 'Medidores', nomeDisplay: "Medidos", IconeComponent: MaterialCommunityIcons, iconeNome: "tape-measure", iconeSize: 26, corIcone: "#4A5568" },
];

// Dados para o banner de destaque (simulando um item de carrossel)
const bannerDestaqueData = [
  { id: 'mais_utilizada', titulo: "Ferramenta Mais Utilizada", corFundo: "#68D391" },
  { id: 'menos_utilizada', titulo: "Ferramenta Menos Utilizada", corFundo: "#F6AD55" },
];

const CARD_WIDTH = screenWidth * 0.9;
const SPACING = (screenWidth - CARD_WIDTH) / 2; // Para centralizar o card ativo

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [imagemPerfil, setImagemPerfil] = useState(null);
  const [indiceBannerAtivo, setIndiceBannerAtivo] = useState(0);
  const scrollViewRef = useRef(null); // Ref para a ScrollView do carrossel
  const [mostUsedTools, setMostUsedTools] = useState([]);
  const [loadingMostUsed, setLoadingMostUsed] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Função para buscar todos os dados da Home (incluindo ferramentas mais utilizadas)
  const fetchData = async () => {
    setLoadingMostUsed(true); // Reutilizar o loading das mais usadas ou criar um geral
    try {
      const response = await toolService.getMostUsedTools();
      if (response.success && response.tools) {
        setMostUsedTools(response.tools);
      }
      // Aqui você pode adicionar chamadas para buscar outros dados da Home se necessário
    } catch (error) {
      console.error("Erro ao buscar dados da Home:", error);
    } finally {
      setLoadingMostUsed(false);
    }
  };

  useEffect(() => {
    if (user && user.imagemPerfil) {
      setImagemPerfil(user.imagemPerfil);
    } else {
      setImagemPerfil(null);
    }
    fetchData(); // Chamar fetchData na montagem inicial e quando user mudar
  }, [user]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const hora = new Date().getHours();
  let saudacao = "";
  if (hora < 12) saudacao = "Bom Dia!";
  else if (hora < 18) saudacao = "Boa Tarde!";
  else saudacao = "Boa Noite!";

  const handleNavegarParaPesquisa = (grupo) => {
    navigation.navigate('Buscar', {
      screen: 'TelaPesquisarFerramentas',
      params: { grupoPreSelecionado: grupo }
    });
  };

  const onScrollBanner = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(scrollPosition / CARD_WIDTH);
    setIndiceBannerAtivo(newIndex);
  };

  const proximoBanner = () => {
    if (indiceBannerAtivo < bannerDestaqueData.length - 1) {
      scrollViewRef.current?.scrollTo({ x: CARD_WIDTH * (indiceBannerAtivo + 1), animated: true });
    }
  };

  const bannerAnterior = () => {
    if (indiceBannerAtivo > 0) {
      scrollViewRef.current?.scrollTo({ x: CARD_WIDTH * (indiceBannerAtivo - 1), animated: true });
    }
  };

  const renderMostUsedTool = ({ item }) => (
    <TouchableOpacity
      style={estilos.cardFerramentaMaisUsada}
      onPress={() => navigation.navigate('DetalheFerramenta', { ferramenta: item })}
    >
      <Image
        source={{ uri: item.imagem_url || 'https://via.placeholder.com/100' }}
        style={[estilos.imagemFerramentaMaisUsada, !item.disponivel && estilos.imagemEmUso]}
      />
      {!item.disponivel && (
        <View style={estilos.emUsoBadge}>
          <Text style={estilos.emUsoTexto}>Em uso</Text>
        </View>
      )}
      <Text style={estilos.nomeFerramentaMaisUsada} numberOfLines={1}>{item.nome}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={estilos.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View style={estilos.topo}>
        <View style={estilos.row}>
          <Image
            source={imagemPerfil ? { uri: imagemPerfil } : require("../assets/img/perfil.png")}
            style={estilos.fotoPerfil}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={estilos.saudacao}>{saudacao} 👋</Text>
            <Text style={estilos.nomeUsuario} numberOfLines={1}>{user?.nome || "Usuário"}</Text>
          </View>
          <TouchableOpacity style={estilos.qrButton} onPress={() => Alert.alert("QR Code", "Funcionalidade do QR Code a ser implementada.")}>
            <Ionicons name="qr-code-outline" size={28} color="#38a169" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={estilos.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#38a169"]} tintColor={"#38a169"} />
        }
      >
        {/* Carrossel de Banner de Destaque */}
        <View style={estilos.carrosselWrapper}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={estilos.carrosselContainer}
            onScroll={onScrollBanner}
            scrollEventThrottle={16} // Para onScroll funcionar bem no Android
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH} // Importante para o efeito de snap correto
            snapToAlignment="start"
          >
            {bannerDestaqueData.map((banner, index) => (
              <View key={banner.id} style={[estilos.bannerCard, { backgroundColor: banner.corFundo, width: CARD_WIDTH }]}>
                <Text style={estilos.bannerTexto}>{banner.titulo}</Text>
              </View>
            ))}
          </ScrollView>
          {/* Setas de navegação do Carrossel */}
          {indiceBannerAtivo > 0 && (
            <TouchableOpacity style={[estilos.bannerSeta, estilos.bannerSetaEsquerda]} onPress={bannerAnterior}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          {indiceBannerAtivo < bannerDestaqueData.length - 1 && (
            <TouchableOpacity style={[estilos.bannerSeta, estilos.bannerSetaDireita]} onPress={proximoBanner}>
              <Ionicons name="chevron-forward" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          <View style={estilos.bannerIndicadoresContainer}>
            {bannerDestaqueData.map((_, i) => (
              <View key={i} style={[estilos.bannerIndicador, i === indiceBannerAtivo && estilos.bannerIndicadorAtivo]} />
            ))}
          </View>
        </View>

        {/* Categorias Rápidas */}
        <View style={estilos.categoriasRapidasContainer}>
          {categoriasRapidasHome.map((cat) => {
            const Icon = cat.IconeComponent;
            return (
              <TouchableOpacity
                key={cat.id}
                style={estilos.categoriaRapidaItem}
                onPress={() => handleNavegarParaPesquisa({ id: cat.id, nome: cat.nomeExato })}
              >
                <View style={estilos.categoriaIconeContainer}>
                  <Icon name={cat.iconeNome} size={cat.iconeSize} color={cat.corIcone} />
                </View>
                <Text style={estilos.categoriaRapidaNome} numberOfLines={1}>{cat.nomeDisplay}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seção Ferramentas mais Emprestadas */}
        <View style={estilos.secaoFerramentasEmprestadasContainer}>
          <View style={estilos.secaoTituloContainer}>
            <Text style={estilos.secaoTitulo}>Ferramentas mais Emprestadas</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Buscar', { screen: 'TelaPesquisarFerramentas' })} style={estilos.verTodasButton}>
              <Text style={estilos.verTodasTexto}>Ver Todas</Text>
            </TouchableOpacity>
          </View>

          {loadingMostUsed ? (
            <ActivityIndicator size="large" color="#38a169" style={{ marginTop: 20 }} />
          ) : mostUsedTools.length > 0 ? (
            <FlatList
              data={mostUsedTools}
              renderItem={renderMostUsedTool}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
          ) : (
            <Text style={estilos.nenhumaFerramentaTexto}>Nenhuma ferramenta para mostrar.</Text>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF", // Fundo branco como na imagem
  },
  topo: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 12, // Reduzido um pouco
    backgroundColor: "#FFF",
    // borderBottomWidth: 1, // Removida borda para layout mais limpo como na imagem
    // borderBottomColor: '#e9ecef',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  fotoPerfil: {
    width: 48, // Mantido
    height: 48, // Mantido
    borderRadius: 24,
    // borderWidth: 2, // Removida borda da foto de perfil para ficar como na imagem
    // borderColor: "#38a169",
  },
  saudacao: {
    fontSize: 15, // Ajustado
    color: "#4A5568",
    fontWeight: "500",
  },
  nomeUsuario: {
    fontSize: 17, // Ajustado
    fontWeight: "bold",
    color: "#1A202C", // Preto mais forte
    marginTop: 1,
  },
  qrButton: {
    backgroundColor: "#E6F4EA", // Fundo verde claro para o botão QR
    borderRadius: 12,      // Menos arredondado
    padding: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 0,
    paddingTop: 15, // Espaço antes do banner
    paddingBottom: 20, // Reduzido, já que a tabbar tem seu próprio espaço
  },
  // Estilos para o Banner de Destaque
  carrosselWrapper: {
    width: screenWidth, // Ocupa a largura toda para centralizar os cards com padding
    height: 160 + 40, // Altura do card + espaço para indicadores
    marginBottom: 15, // Reduzido espaço após o carrossel, pois o espaçamento já está no container de categorias
    alignItems: 'center', // Centraliza a ScrollView se ela for menor que o wrapper
  },
  carrosselContainer: {
    // paddingHorizontal: SPACING, // Espaçamento para centralizar o card ativo
    // O paddingHorizontal será aplicado no card para visualização de partes dos cards vizinhos se desejado
    // Se quiser que apenas um card apareça por vez (sem partes de outros), não usar padding aqui.
  },
  bannerCard: {
    height: 160,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 25,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginHorizontal: SPACING, // Adiciona espaço entre os cards, e nas pontas para centralização
  },
  bannerTexto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    maxWidth: '60%', // Aumentado um pouco
    textAlign: 'right',
  },
  bannerSeta: {
    position: 'absolute',
    top: 160 / 2 - 18, // Centralizado na altura do bannerCard
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Garantir que as setas fiquem sobre os cards
  },
  bannerSetaEsquerda: {
    left: screenWidth * 0.05 - 10, // 5% da tela - 10 para sair um pouco
  },
  bannerSetaDireita: {
    right: screenWidth * 0.05 - 10, // 5% da tela - 10 para sair um pouco
  },
  bannerIndicadoresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10, // Ajustado para ficar mais próximo do banner
    alignSelf: 'center',
  },
  bannerIndicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 5,
  },
  bannerIndicadorAtivo: {
    backgroundColor: '#4B5563',
    width: 10, height: 10, borderRadius: 5,
  },
  // Categorias Rápidas
  categoriasRapidasContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 15,
    marginTop: 10, // Adicionado marginTop para separar do carrossel
    marginBottom: 30,
  },
  categoriaRapidaItem: {
    alignItems: "center",
    width: screenWidth / 3.8, // Levemente ajustado
  },
  categoriaIconeContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriaRapidaNome: {
    fontSize: 12,
    color: "#4A5568",
    fontWeight: "500",
    textAlign: 'center',
  },
  // Seção Ferramentas mais Emprestadas
  secaoFerramentasEmprestadasContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  secaoTituloContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  secaoTitulo: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1A202C',
    flexShrink: 1,
    marginRight: 8,
  },
  verTodasButton: {},
  verTodasTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38a169',
  },
  cardFerramentaMaisUsada: {
    width: (screenWidth - (20 * 2) - 15) / 2,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imagemFerramentaMaisUsada: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  imagemEmUso: {
    opacity: 0.5,
  },
  emUsoBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },
  emUsoTexto: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  nomeFerramentaMaisUsada: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2D3748',
    textAlign: 'center',
  },
  nenhumaFerramentaTexto: {
    textAlign: 'center',
    marginTop: 20,
    color: '#718096',
    fontSize: 14,
  },
});
