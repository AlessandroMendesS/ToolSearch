import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Platform,
  Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const tutorialSlides = [
  {
    id: 1,
    icon: 'search',
    title: 'Buscar Ferramentas',
    description: 'Encontre rapidamente as ferramentas que você precisa usando a busca ou navegando pelas categorias.',
    color: '#38A169',
    gradient: ['#48BB78', '#38A169']
  },
  {
    id: 2,
    icon: 'qr-code',
    title: 'QR Codes',
    description: 'Leia QR Codes para identificar ferramentas rapidamente ou gere seus próprios QR Codes para compartilhar.',
    color: '#4299E1',
    gradient: ['#63B3ED', '#4299E1']
  },
  {
    id: 3,
    icon: 'add-circle',
    title: 'Adicionar Ferramentas',
    description: 'Cadastre novas ferramentas no sistema com fotos, informações detalhadas e códigos de patrimônio.',
    color: '#ED8936',
    gradient: ['#F6AD55', '#ED8936']
  },
  {
    id: 4,
    icon: 'swap-horizontal',
    title: 'Empréstimos',
    description: 'Gerencie seus empréstimos de forma simples. Veja quais ferramentas você tem emprestadas e devolva quando necessário.',
    color: '#9333EA',
    gradient: ['#A78BFA', '#9333EA']
  },
  {
    id: 5,
    icon: 'analytics',
    title: 'Dashboard',
    description: 'Acompanhe estatísticas e insights sobre o uso das ferramentas no sistema.',
    color: '#E53E3E',
    gradient: ['#FC8181', '#E53E3E']
  },
  {
    id: 6,
    icon: 'person',
    title: 'Perfil',
    description: 'Gerencie suas informações pessoais, temas do aplicativo e acesse seus QR Codes salvos.',
    color: '#000000',
    gradient: ['#9F7AEA', '#805AD5']
  }
];

export default function Tutorial({ navigation }) {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      const nextSlide = currentSlide + 1;
      setCurrentSlide(nextSlide);
      scrollViewRef.current?.scrollTo({ x: nextSlide * screenWidth, animated: true });
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      const prevSlide = currentSlide - 1;
      setCurrentSlide(prevSlide);
      scrollViewRef.current?.scrollTo({ x: prevSlide * screenWidth, animated: true });
    }
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slideIndex = Math.round(offsetX / screenWidth);
    if (slideIndex !== currentSlide) {
      setCurrentSlide(slideIndex);
    }
  };

  const renderSlide = (slide, index) => {
    const isActive = index === currentSlide;
    
    return (
      <View key={slide.id} style={[styles.slide, { width: screenWidth }]}>
        <View style={[styles.slideContent, { backgroundColor: theme.background }]}>
          {/* Ícone animado */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                backgroundColor: slide.color + '20',
                transform: [{ scale: isActive ? 1 : 0.8 }]
              }
            ]}
          >
            <Ionicons name={slide.icon} size={80} color={slide.color} />
          </Animated.View>

          {/* Título */}
          <Text style={[styles.slideTitle, { color: theme.text }]}>
            {slide.title}
          </Text>

          {/* Descrição */}
          <Text style={[styles.slideDescription, { color: theme.text, opacity: 0.8 }]}>
            {slide.description}
          </Text>

          {/* Dicas adicionais baseadas no slide */}
          {slide.id === 1 && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color={slide.color} />
              <Text style={[styles.tipText, { color: theme.text }]}>
                Use filtros para encontrar ferramentas disponíveis
              </Text>
            </View>
          )}
          
          {slide.id === 2 && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color={slide.color} />
              <Text style={[styles.tipText, { color: theme.text }]}>
                Compartilhe QR Codes salvos na galeria
              </Text>
            </View>
          )}

          {slide.id === 3 && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color={slide.color} />
              <Text style={[styles.tipText, { color: theme.text }]}>
                Adicione fotos para facilitar a identificação
              </Text>
            </View>
          )}

          {slide.id === 4 && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color={slide.color} />
              <Text style={[styles.tipText, { color: theme.text }]}>
                Acompanhe o tempo de empréstimo de cada ferramenta
              </Text>
            </View>
          )}

          {slide.id === 5 && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color={slide.color} />
              <Text style={[styles.tipText, { color: theme.text }]}>
                Veja tendências e estatísticas em tempo real
              </Text>
            </View>
          )}

          {slide.id === 6 && (
            <View style={styles.tipContainer}>
              <Ionicons name="bulb" size={20} color={slide.color} />
              <Text style={[styles.tipText, { color: theme.text }]}>
                Personalize o tema do aplicativo
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={handleFinish} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Tutorial</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {tutorialSlides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Indicadores */}
      <View style={styles.indicatorsContainer}>
        {tutorialSlides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor: index === currentSlide ? tutorialSlides[currentSlide].color : theme.text + '40',
                width: index === currentSlide ? 24 : 8,
              }
            ]}
          />
        ))}
      </View>

      {/* Botões de navegação */}
      <View style={[styles.footer, { backgroundColor: theme.card }]}>
        {currentSlide > 0 && (
          <TouchableOpacity
            style={[styles.navButton, styles.prevButton, { borderColor: theme.primary }]}
            onPress={handlePrevious}
          >
            <Ionicons name="arrow-back" size={20} color={theme.primary} />
            <Text style={[styles.navButtonText, { color: theme.primary }]}>Anterior</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ flex: 1 }} />
        
        <TouchableOpacity
          style={[styles.navButton, styles.nextButton, { backgroundColor: tutorialSlides[currentSlide].color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === tutorialSlides.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
          {currentSlide < tutorialSlides.length - 1 && (
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'android' ? ((StatusBar.currentHeight || 0) + 8) : 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    width: screenWidth,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  slideDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    width: '100%',
  },
  tipText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    transition: 'all 0.3s',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  prevButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  nextButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

