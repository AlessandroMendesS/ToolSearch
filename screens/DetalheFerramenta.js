import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { emprestimoService, toolService } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../context/ThemeContext';
import supabase from '../api/supabaseClient';
import { agruparFerramentas, obterFerramentasDisponiveis, obterFerramentasEmprestadas, formatarPatrimonio } from '../utils/toolGrouping';

export default function DetalheFerramenta({ route, navigation }) {
  const { ferramenta: ferramentaInicial, grupo } = route.params || {};
  const { user } = useAuth();
  const { theme } = useTheme();

  const [ferramenta, setFerramenta] = useState(ferramentaInicial);
  const [grupoFerramentas, setGrupoFerramentas] = useState(grupo);
  const [emprestada, setEmprestada] = useState(!ferramentaInicial?.disponivel);
  const [emprestimoId, setEmprestimoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [podeDevolver, setPodeDevolver] = useState(false);
  const [emprestimoInfo, setEmprestimoInfo] = useState(null);
  const [emprestimosGrupo, setEmprestimosGrupo] = useState({}); // Mapa de ferramenta_id -> emprestimo
  const [erroDevolver, setErroDevolver] = useState('');
  const [mostrarListaFerramentas, setMostrarListaFerramentas] = useState(false);
  const [selectionModeDetalhes, setSelectionModeDetalhes] = useState(false);
  const [selectedGroupTools, setSelectedGroupTools] = useState([]);

  // Buscar empréstimo aberto ou último empréstimo para histórico
  const fetchEmprestimoAberto = async () => {
    if (!ferramentaInicial?.id) return;
    
    try {
      const res = await emprestimoService.buscarEmprestimoAberto(ferramentaInicial.id);
      if (res && res.success) {
        if (res.emprestimo) {
          setEmprestada(res.emprestimo.status === 'emprestado');
          setEmprestimoId(res.emprestimo.id);
          setPodeDevolver(res.emprestimo.usuario_id === user.id && res.emprestimo.status === 'emprestado');
          setEmprestimoInfo(res.emprestimo);
        } else {
          setEmprestada(false);
          setEmprestimoId(null);
          setPodeDevolver(false);
          setEmprestimoInfo(null);
        }
      } else {
        setEmprestada(false);
        setEmprestimoId(null);
        setPodeDevolver(false);
        setEmprestimoInfo(null);
      }
    } catch (err) {
      setEmprestada(false);
      setEmprestimoId(null);
      setPodeDevolver(false);
      setEmprestimoInfo(null);
    }
  };

  // Buscar empréstimos de todas as ferramentas do grupo
  const fetchEmprestimosGrupo = async () => {
    if (!grupoFerramentas || !grupoFerramentas.ferramentas) return;
    
    try {
      const emprestimosMap = {};
      
      // Buscar empréstimos abertos de todas as ferramentas do grupo
      for (const ferramentaItem of grupoFerramentas.ferramentas) {
        try {
          const res = await emprestimoService.buscarEmprestimoAberto(ferramentaItem.id);
          if (res && res.success && res.emprestimo && res.emprestimo.status === 'emprestado') {
            emprestimosMap[ferramentaItem.id] = res.emprestimo;
          }
        } catch (err) {
          console.error(`Erro ao buscar empréstimo da ferramenta ${ferramentaItem.id}:`, err);
        }
      }
      
      setEmprestimosGrupo(emprestimosMap);
    } catch (err) {
      console.error('Erro ao buscar empréstimos do grupo:', err);
    }
  };

  // Atualizar grupo quando necessário ou buscar se não foi fornecido
  useEffect(() => {
    if (grupo) {
      setGrupoFerramentas(grupo);
    } else if (ferramentaInicial && !grupoFerramentas) {
      // Se não há grupo fornecido, buscar se existe grupo para esta ferramenta
      const buscarGrupo = async () => {
        try {
          const { data, error } = await supabase
            .from('ferramentas')
            .select('*')
            .eq('nome', ferramentaInicial.nome)
            .eq('categoria_id', ferramentaInicial.categoria_id);
          
          if (!error && data && data.length > 0) {
            const grupos = agruparFerramentas(data);
            const grupoEncontrado = grupos.find(g => 
              g.nome === ferramentaInicial.nome && g.categoria_id === ferramentaInicial.categoria_id
            );
            if (grupoEncontrado) {
              setGrupoFerramentas(grupoEncontrado);
            }
          }
        } catch (err) {
          console.error('Erro ao buscar grupo:', err);
        }
      };
      buscarGrupo();
    }
  }, [grupo, ferramentaInicial]);

  useEffect(() => {
    if (ferramentaInicial) {
      setFerramenta(ferramentaInicial);
      fetchEmprestimoAberto();
    }
  }, [ferramentaInicial, user.id]);

  // Buscar empréstimos do grupo quando o grupo mudar
  useEffect(() => {
    if (grupoFerramentas) {
      fetchEmprestimosGrupo();
    }
  }, [grupoFerramentas]);

  const handleEmprestar = async (ferramentaParaEmprestar = null) => {
    const ferramentaId = ferramentaParaEmprestar?.id || ferramenta?.id;
    if (!ferramentaId) {
      alert('Erro: Ferramenta não encontrada.');
      return;
    }

    setLoading(true);
    setErroDevolver('');
    try {
      const ferramentaAtual = ferramentaParaEmprestar || ferramenta;
      await emprestimoService.registrarEmprestimo({
        ferramenta_id: ferramentaId,
        usuario_id: user.id,
        local_emprestimo: ferramentaAtual.local || ''
      });
      alert('Ferramenta emprestada com sucesso!');
      
      // Se for um grupo, atualizar a lista de ferramentas disponíveis
      if (grupoFerramentas) {
        // Recarregar dados do grupo
        const { data, error } = await supabase
          .from('ferramentas')
          .select('*')
          .eq('nome', grupoFerramentas.nome)
          .eq('categoria_id', grupoFerramentas.categoria_id);
        
        if (!error && data) {
          const gruposAtualizados = agruparFerramentas(data);
          const grupoAtualizado = gruposAtualizados.find(g => 
            g.nome === grupoFerramentas.nome && g.categoria_id === grupoFerramentas.categoria_id
          );
          if (grupoAtualizado) {
            setGrupoFerramentas(grupoAtualizado);
            // Atualizar ferramenta atual se necessário
            const ferramentaAtualizada = data.find(f => f.id === ferramentaId);
            if (ferramentaAtualizada) {
              setFerramenta(ferramentaAtualizada);
            }
          }
        }
      } else {
        await fetchEmprestimoAberto();
      }
    } catch (err) {
      alert('Erro ao emprestar ferramenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevolver = async (ferramentaParaDevolver = null, emprestimoIdParaDevolver = null) => {
    const ferramentaId = ferramentaParaDevolver?.id || ferramenta?.id;
    const emprestimoIdAtual = emprestimoIdParaDevolver || emprestimoId;
    
    if (!emprestimoIdAtual) {
      alert('Erro: Empréstimo não encontrado.');
      return;
    }

    setLoading(true);
    setErroDevolver('');
    try {
      const ferramentaAtual = ferramentaParaDevolver || ferramenta;
      await emprestimoService.registrarDevolucao(emprestimoIdAtual, { 
        local_devolucao: ferramentaAtual?.local || grupoFerramentas?.local || '' 
      });
      alert('Ferramenta devolvida com sucesso!');
      
      // Se for um grupo, atualizar a lista de ferramentas disponíveis
      if (grupoFerramentas) {
        // Recarregar dados do grupo
        const { data, error } = await supabase
          .from('ferramentas')
          .select('*')
          .eq('nome', grupoFerramentas.nome)
          .eq('categoria_id', grupoFerramentas.categoria_id);
        
        if (!error && data) {
          const gruposAtualizados = agruparFerramentas(data);
          const grupoAtualizado = gruposAtualizados.find(g => 
            g.nome === grupoFerramentas.nome && g.categoria_id === grupoFerramentas.categoria_id
          );
          if (grupoAtualizado) {
            setGrupoFerramentas(grupoAtualizado);
            // Atualizar ferramenta atual se necessário
            const ferramentaAtualizada = data.find(f => f.id === ferramentaId);
            if (ferramentaAtualizada) {
              setFerramenta(ferramentaAtualizada);
            }
            // Recarregar empréstimos do grupo
            await fetchEmprestimosGrupo();
          }
        }
      } else {
        await fetchEmprestimoAberto();
      }
    } catch (err) {
      let msg = 'Erro ao devolver ferramenta.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setErroDevolver(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // Devolver todas as ferramentas do grupo que foram emprestadas pelo usuário atual
  const handleDevolverTodas = async () => {
    if (!grupoFerramentas || !grupoFerramentas.ferramentas) {
      alert('Erro: Grupo não encontrado.');
      return;
    }

    // Filtrar ferramentas que podem ser devolvidas pelo usuário atual
    const ferramentasParaDevolver = grupoFerramentas.ferramentas.filter(item => {
      const emprestimoItem = emprestimosGrupo[item.id];
      return emprestimoItem && 
             emprestimoItem.usuario_id === user.id && 
             emprestimoItem.status === 'emprestado';
    });

    if (ferramentasParaDevolver.length === 0) {
      alert('Não há ferramentas para devolver.');
      return;
    }

    // Confirmar ação
    Alert.alert(
      'Devolver Todas',
      `Tem certeza que deseja devolver ${ferramentasParaDevolver.length} ferramenta(s)?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Devolver Todas',
          style: 'default',
          onPress: async () => {
            setLoading(true);
            setErroDevolver('');
            
            try {
              let sucessos = 0;
              let erros = 0;
              
              // Devolver todas as ferramentas
              for (const ferramentaItem of ferramentasParaDevolver) {
                const emprestimoItem = emprestimosGrupo[ferramentaItem.id];
                if (emprestimoItem) {
                  try {
                    await emprestimoService.registrarDevolucao(emprestimoItem.id, {
                      local_devolucao: ferramentaItem?.local || grupoFerramentas?.local || ''
                    });
                    sucessos++;
                  } catch (err) {
                    console.error(`Erro ao devolver ferramenta ${ferramentaItem.id}:`, err);
                    erros++;
                  }
                }
              }

              // Recarregar dados do grupo
              const { data, error } = await supabase
                .from('ferramentas')
                .select('*')
                .eq('nome', grupoFerramentas.nome)
                .eq('categoria_id', grupoFerramentas.categoria_id);
              
              if (!error && data) {
                const gruposAtualizados = agruparFerramentas(data);
                const grupoAtualizado = gruposAtualizados.find(g => 
                  g.nome === grupoFerramentas.nome && g.categoria_id === grupoFerramentas.categoria_id
                );
                if (grupoAtualizado) {
                  setGrupoFerramentas(grupoAtualizado);
                  // Atualizar ferramenta atual se necessário
                  const ferramentaAtualizada = data.find(f => f.id === ferramenta?.id);
                  if (ferramentaAtualizada) {
                    setFerramenta(ferramentaAtualizada);
                  }
                  // Recarregar empréstimos do grupo
                  await fetchEmprestimosGrupo();
                }
              }

              if (erros === 0) {
                alert(`${sucessos} ferramenta(s) devolvida(s) com sucesso!`);
              } else {
                alert(`${sucessos} devolvida(s) com sucesso. ${erros} erro(s) ao devolver.`);
              }
            } catch (err) {
              let msg = 'Erro ao devolver ferramentas.';
              if (err.response && err.response.data && err.response.data.message) {
                msg = err.response.data.message;
              }
              setErroDevolver(msg);
              alert(msg);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEditar = () => {
    navigation.navigate('EditarFerramenta', { ferramenta });
  };

  const handleDeletar = () => {
    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir a ferramenta "${ferramenta.nome}"? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Primeiro, verificar se há empréstimos ativos
              const { data: emprestimos, error: erroEmprestimos } = await supabase
                .from('emprestimos')
                .select('id')
                .eq('ferramenta_id', ferramenta.id)
                .eq('status', 'emprestado');

              if (erroEmprestimos) {
                console.error('Erro ao verificar empréstimos:', erroEmprestimos);
              }

              if (emprestimos && emprestimos.length > 0) {
                Alert.alert(
                  'Não é possível excluir',
                  'Esta ferramenta possui empréstimos ativos. Devolva todos os empréstimos antes de excluir.',
                  [{ text: 'OK' }]
                );
                setLoading(false);
                return;
              }

              // Deletar empréstimos relacionados primeiro (se houver)
              const { error: erroDeleteEmprestimos } = await supabase
                .from('emprestimos')
                .delete()
                .eq('ferramenta_id', ferramenta.id);

              if (erroDeleteEmprestimos) {
                console.warn('Aviso ao deletar empréstimos:', erroDeleteEmprestimos);
                // Continuar mesmo com erro, pode não haver empréstimos
              }

              // Tentar deletar via Supabase primeiro
              let deletadoComSucesso = false;
              
              try {
                const { data, error } = await supabase
                  .from('ferramentas')
                  .delete()
                  .eq('id', ferramenta.id)
                  .select();

                if (error) {
                  console.log('Erro ao deletar via Supabase direto, tentando via API...', error);
                  // Se falhar, tentar via backend API
                  throw new Error('Supabase direto falhou, tentando API');
                }

                if (data && data.length > 0) {
                  deletadoComSucesso = true;
                } else {
                  Alert.alert('Aviso', 'Ferramenta não encontrada ou já foi excluída.');
                  setLoading(false);
                  navigation.goBack();
                  return;
                }
              } catch (supabaseError) {
                // Se falhar no Supabase direto, tentar via backend API
                console.log('Tentando deletar via backend API...');
                try {
                  const response = await toolService.deleteTool(ferramenta.id);
                  if (response && response.success) {
                    deletadoComSucesso = true;
                  } else {
                    throw new Error(response?.message || 'Erro ao deletar via API');
                  }
                } catch (apiError) {
                  console.error('Erro ao deletar via API:', apiError);
                  let mensagemErro = 'Não foi possível excluir a ferramenta.';
                  
                  if (apiError.response?.data?.message) {
                    mensagemErro = apiError.response.data.message;
                  } else if (apiError.message) {
                    mensagemErro = apiError.message;
                  }
                  
                  Alert.alert('Erro', mensagemErro);
                  setLoading(false);
                  return;
                }
              }

              if (!deletadoComSucesso) {
                Alert.alert('Erro', 'Não foi possível excluir a ferramenta.');
                setLoading(false);
                return;
              }

              Alert.alert('Sucesso', 'Ferramenta excluída com sucesso!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                  }
                }
              ]);
            } catch (error) {
              console.error('Erro ao excluir ferramenta:', error);
              Alert.alert(
                'Erro', 
                `Não foi possível excluir a ferramenta: ${error.message || 'Erro desconhecido'}`
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDeleteSelectedGroupTools = async () => {
    if (!grupoFerramentas || !grupoFerramentas.ferramentas) {
      alert('Erro: Grupo não encontrado.');
      return;
    }

    const ferramentasParaExcluir = grupoFerramentas.ferramentas.filter(item => 
      selectedGroupTools.includes(item.id)
    );

    if (ferramentasParaExcluir.length === 0) {
      alert('Nenhum item selecionado para exclusão.');
      return;
    }

    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir ${ferramentasParaExcluir.length} ferramenta(s) do grupo? Esta ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              let sucessos = 0;
              let erros = 0;

              for (const ferramentaItem of ferramentasParaExcluir) {
                try {
                  // Primeiro, verificar se há empréstimos ativos
                  const { data: emprestimos, error: erroEmprestimos } = await supabase
                    .from('emprestimos')
                    .select('id')
                    .eq('ferramenta_id', ferramentaItem.id)
                    .eq('status', 'emprestado');

                  if (erroEmprestimos) {
                    console.error(`Erro ao verificar empréstimos da ferramenta ${ferramentaItem.id}:`, erroEmprestimos);
                    erros++;
                    continue;
                  }

                  if (emprestimos && emprestimos.length > 0) {
                    Alert.alert(
                      'Não é possível excluir',
                      'Esta ferramenta possui empréstimos ativos. Devolva todos os empréstimos antes de excluir.',
                      [{ text: 'OK' }]
                    );
                    erros++;
                    continue;
                  }

                  // Deletar empréstimos relacionados primeiro (se houver)
                  const { error: erroDeleteEmprestimos } = await supabase
                    .from('emprestimos')
                    .delete()
                    .eq('ferramenta_id', ferramentaItem.id);

                  if (erroDeleteEmprestimos) {
                    console.warn(`Aviso ao deletar empréstimos da ferramenta ${ferramentaItem.id}:`, erroDeleteEmprestimos);
                    // Continuar mesmo com erro, pode não haver empréstimos
                  }

                  // Tentar deletar via Supabase primeiro
                  let deletadoComSucesso = false;
                  
                  try {
                    const { data, error } = await supabase
                      .from('ferramentas')
                      .delete()
                      .eq('id', ferramentaItem.id)
                      .select();

                    if (error) {
                      console.log(`Erro ao deletar ferramenta ${ferramentaItem.id} via Supabase direto, tentando via API...`, error);
                      // Se falhar, tentar via backend API
                      throw new Error('Supabase direto falhou, tentando API');
                    }

                    if (data && data.length > 0) {
                      deletadoComSucesso = true;
                    } else {
                      Alert.alert('Aviso', 'Ferramenta não encontrada ou já foi excluída.');
                      setLoading(false);
                      return;
                    }
                  } catch (supabaseError) {
                    // Se falhar no Supabase direto, tentar via backend API
                    console.log(`Tentando deletar ferramenta ${ferramentaItem.id} via backend API...`);
                    try {
                      const response = await toolService.deleteTool(ferramentaItem.id);
                      if (response && response.success) {
                        deletadoComSucesso = true;
                      } else {
                        throw new Error(response?.message || 'Erro ao deletar via API');
                      }
                    } catch (apiError) {
                      console.error(`Erro ao deletar ferramenta ${ferramentaItem.id} via API:`, apiError);
                      let mensagemErro = 'Não foi possível excluir a ferramenta.';
                      
                      if (apiError.response?.data?.message) {
                        mensagemErro = apiError.response.data.message;
                      } else if (apiError.message) {
                        mensagemErro = apiError.message;
                      }
                      
                      Alert.alert('Erro', mensagemErro);
                      setLoading(false);
                      return;
                    }
                  }

                  if (!deletadoComSucesso) {
                    Alert.alert('Erro', `Não foi possível excluir a ferramenta ${ferramentaItem.nome}.`);
                    setLoading(false);
                    return;
                  }
                  sucessos++;
                } catch (err) {
                  console.error(`Erro ao excluir ferramenta ${ferramentaItem.id}:`, err);
                  erros++;
                }
              }

              // Recarregar dados do grupo
              const { data: updatedData, error: updateError } = await supabase
                .from('ferramentas')
                .select('*')
                .eq('nome', grupoFerramentas.nome)
                .eq('categoria_id', grupoFerramentas.categoria_id);
              
              if (updateError) {
                console.error('Erro ao recarregar dados do grupo após exclusão:', updateError);
              } else if (updatedData) {
                const gruposAtualizados = agruparFerramentas(updatedData);
                const grupoAtualizado = gruposAtualizados.find(g => 
                  g.nome === grupoFerramentas.nome && g.categoria_id === grupoFerramentas.categoria_id
                );
                if (grupoAtualizado) {
                  setGrupoFerramentas(grupoAtualizado);
                  // Atualizar ferramenta atual se necessário
                  const ferramentaAtualizada = updatedData.find(f => f.id === ferramenta?.id);
                  if (ferramentaAtualizada) {
                    setFerramenta(ferramentaAtualizada);
                  }
                  // Recarregar empréstimos do grupo
                  await fetchEmprestimosGrupo();
                }
              }

              if (erros === 0) {
                alert(`${sucessos} ferramenta(s) excluída(s) com sucesso!`);
              } else {
                alert(`${sucessos} excluída(s) com sucesso. ${erros} erro(s) ao excluir.`);
              }
            } catch (err) {
              let msg = 'Erro ao excluir ferramentas do grupo.';
              if (err.response && err.response.data && err.response.data.message) {
                msg = err.response.data.message;
              }
              setErroDevolver(msg);
              alert(msg);
            } finally {
              setLoading(false);
              setSelectionModeDetalhes(false);
              setSelectedGroupTools([]);
            }
          }
        }
      ]
    );
  };

  const handleCancelGroupSelection = () => {
    setSelectionModeDetalhes(false);
    setSelectedGroupTools([]);
  };

  // Renderização
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {/* Botão de selecionar: apenas para grupos com 2 ou mais ferramentas e quando a lista está expandida */}
          {grupoFerramentas && grupoFerramentas.total >= 2 && mostrarListaFerramentas && (
            <TouchableOpacity 
              onPress={() => setSelectionModeDetalhes(!selectionModeDetalhes)} 
              style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
            >
              <Ionicons name="checkmark-done-circle-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          )}
          {!selectionModeDetalhes && (
            <>
              <TouchableOpacity 
                onPress={handleEditar} 
                style={[styles.headerButton, { backgroundColor: theme.primary + '20' }]}
              >
                <Ionicons name="create-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
              {/* Botão de excluir: para ferramentas únicas (sem grupo ou grupo com apenas 1 ferramenta) */}
              {(!grupoFerramentas || (grupoFerramentas.total === 1)) && (
                <TouchableOpacity 
                  onPress={handleDeletar} 
                  style={[styles.headerButton, { backgroundColor: '#f56565' + '20' }]}
                >
                  <Ionicons name="trash-outline" size={24} color="#f56565" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
      {selectionModeDetalhes && (
        <View style={[styles.selectionActionsContainerDetalhes, { backgroundColor: theme.card, borderBottomWidth: 1, borderBottomColor: theme.background + '40' }]}>
          <Text style={[styles.selectionCountDetalhes, { color: theme.text }]}>
            {selectedGroupTools.length} selecionado(s)
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              style={[styles.actionButtonDetalhes, { backgroundColor: selectedGroupTools.length === 0 ? '#cbd5e0' : '#f56565' }]} 
              onPress={handleDeleteSelectedGroupTools}
              disabled={selectedGroupTools.length === 0 || loading}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonTextDetalhes}>Excluir</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButtonDetalhes, { backgroundColor: '#718096' }]} 
              onPress={handleCancelGroupSelection}
              activeOpacity={0.8}
            >
              <Ionicons name="close-circle-outline" size={20} color="#FFF" />
              <Text style={styles.actionButtonTextDetalhes}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <View style={styles.imageContainer}>
          {ferramenta.imagem_url ? (
            <Image
              source={{ uri: ferramenta.imagem_url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.card }]}>
              <Ionicons name="construct-outline" size={80} color={theme.primary} />
            </View>
          )}
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{ferramenta?.nome || grupoFerramentas?.nome}</Text>
        
        {/* Informações do grupo se houver */}
        {grupoFerramentas && grupoFerramentas.total !== undefined && (() => {
          // Calcular quantas ferramentas o usuário atual pode devolver
          const ferramentasParaDevolver = grupoFerramentas.ferramentas.filter(item => {
            const emprestimoItem = emprestimosGrupo[item.id];
            return emprestimoItem && 
                   emprestimoItem.usuario_id === user.id && 
                   emprestimoItem.status === 'emprestado';
          });
          const podeDevolverTodas = ferramentasParaDevolver.length > 0;

          return (
            <View style={[styles.grupoInfoContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Informações do Grupo</Text>
              <View style={styles.grupoStatsRow}>
                <View style={styles.statItem}>
                  <Ionicons name="cube-outline" size={20} color={theme.primary} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{grupoFerramentas.total}</Text>
                  <Text style={[styles.statLabel, { color: theme.text }]}>Total</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#48bb78" />
                  <Text style={[styles.statValue, { color: '#48bb78' }]}>{grupoFerramentas.disponivel}</Text>
                  <Text style={[styles.statLabel, { color: theme.text }]}>Disponíveis</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="close-circle-outline" size={20} color="#f56565" />
                  <Text style={[styles.statValue, { color: '#f56565' }]}>{grupoFerramentas.total - grupoFerramentas.disponivel}</Text>
                  <Text style={[styles.statLabel, { color: theme.text }]}>Em uso</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.verFerramentasButton, { backgroundColor: theme.primary + '20' }]}
                onPress={() => setMostrarListaFerramentas(!mostrarListaFerramentas)}
              >
                <Text style={[styles.verFerramentasTexto, { color: theme.primary }]} numberOfLines={1}>
                  {mostrarListaFerramentas ? 'Ocultar' : 'Ver'} todas as ferramentas ({grupoFerramentas.ferramentas.length})
                </Text>
                <Ionicons 
                  name={mostrarListaFerramentas ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.primary} 
                />
              </TouchableOpacity>
              {podeDevolverTodas && (
                <TouchableOpacity
                  style={[styles.devolverTodasButton, { backgroundColor: '#38A169' }]}
                  onPress={handleDevolverTodas}
                  disabled={loading}
                >
                  <Ionicons name="return-down-back-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.devolverTodasTexto}>
                    {loading ? 'Devolvendo...' : `Devolver Todas (${ferramentasParaDevolver.length})`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })()}

        {/* Lista de ferramentas do grupo */}
        {mostrarListaFerramentas && grupoFerramentas && grupoFerramentas.ferramentas && (
          <View style={[styles.listaFerramentasContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 10 }]}>Ferramentas do Grupo</Text>
            <FlatList
              data={grupoFerramentas.ferramentas}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedGroupTools.includes(item.id);
                const emprestimoItem = emprestimosGrupo[item.id];
                const estaEmprestada = !item.disponivel || (emprestimoItem && emprestimoItem.status === 'emprestado');
                const podeDevolverItem = emprestimoItem && emprestimoItem.usuario_id === user.id && emprestimoItem.status === 'emprestado';

                const handlePress = () => {
                  if (selectionModeDetalhes) {
                    setSelectedGroupTools((prevSelected) => {
                      if (prevSelected.includes(item.id)) {
                        return prevSelected.filter((id) => id !== item.id);
                      } else {
                        return [...prevSelected, item.id];
                      }
                    });
                  } else {
                    // Comportamento normal: navegar para detalhes da ferramenta
                    navigation.navigate('DetalheFerramenta', { ferramenta: item });
                  }
                };

                const handleLongPress = () => {
                  if (!selectionModeDetalhes) {
                    setSelectionModeDetalhes(true);
                    setSelectedGroupTools([item.id]);
                  }
                };
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.ferramentaItemLista,
                      { backgroundColor: theme.background },
                      isSelected && { borderColor: theme.primary, borderWidth: 2 }
                    ]}
                    onPress={handlePress}
                    onLongPress={handleLongPress}
                    activeOpacity={0.7}
                  >
                    {selectionModeDetalhes && (
                      <View style={styles.checkboxContainerLista}>
                        <Ionicons
                          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                          size={22}
                          color={isSelected ? theme.primary : theme.text + '80'}
                        />
                      </View>
                    )}
                    <View style={styles.ferramentaItemInfo}>
                      <Text style={[styles.ferramentaItemNome, { color: theme.text }]}>
                        Patrimônio: {formatarPatrimonio(item.patrimonio)}
                      </Text>
                      <View style={styles.ferramentaItemStatus}>
                        <View style={[
                          styles.statusIndicator,
                          { backgroundColor: item.disponivel ? '#48bb78' : '#f56565' }
                        ]} />
                        <Text style={[styles.ferramentaItemStatusTexto, { color: theme.text }]}>
                          {item.disponivel ? 'Disponível' : 'Em uso'}
                        </Text>
                      </View>
                      {emprestimoItem && (
                        <View style={styles.emprestimoInfoItem}>
                          <Text style={[styles.emprestimoInfoTexto, { color: theme.text }]}>
                            Emprestado por: {emprestimoItem.usuarios?.nome || 'Usuário #' + emprestimoItem.usuario_id}
                          </Text>
                          {emprestimoItem.data_emprestimo && (
                            <Text style={[styles.emprestimoInfoData, { color: theme.text }]}>
                              Data: {new Date(emprestimoItem.data_emprestimo).toLocaleString('pt-BR')}
                            </Text>
                          )}
                        </View>
                      )}
                    </View>
                    <View style={styles.ferramentaItemActions}>
                      {!selectionModeDetalhes && item.disponivel && !estaEmprestada && (
                        <TouchableOpacity
                          style={[styles.emprestarItemButton, { backgroundColor: theme.primary }]}
                          onPress={() => handleEmprestar(item)}
                          disabled={loading}
                        >
                          <Text style={styles.emprestarItemTexto}>Emprestar</Text>
                        </TouchableOpacity>
                      )}
                      {!selectionModeDetalhes && estaEmprestada && podeDevolverItem && (
                        <TouchableOpacity
                          style={[styles.devolverItemButton, { backgroundColor: '#38A169' }]}
                          onPress={() => handleDevolver(item, emprestimoItem.id)}
                          disabled={loading}
                        >
                          <Text style={styles.devolverItemTexto}>
                            {loading ? '...' : 'Devolver'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {!selectionModeDetalhes && estaEmprestada && !podeDevolverItem && (
                        <View style={[styles.naoPodeDevolverBadge, { backgroundColor: theme.background }]}>
                          <Text style={[styles.naoPodeDevolverTexto, { color: theme.text }]}>
                            Em uso
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={[styles.infoContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Detalhes</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>{ferramenta?.detalhes || grupoFerramentas?.detalhes || 'Não informado'}</Text>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Local</Text>
          <View style={styles.localRow}>
            <Ionicons name="location-outline" size={16} color={theme.text} style={{ marginRight: 5 }} />
            <Text style={[styles.infoText, { color: theme.text }]}>{ferramenta?.local || grupoFerramentas?.local || 'Não informado'}</Text>
          </View>
        </View>
        {/* Mensagem de erro do botão devolver */}
        {erroDevolver ? (
          <View style={styles.erroBox}><Text style={styles.erroText}>{erroDevolver}</Text></View>
        ) : null}
        {/* Botão de Emprestar/Devolver */}
        {!grupoFerramentas && (
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            {emprestada && podeDevolver ? (
              <TouchableOpacity style={[styles.botao, { backgroundColor: '#38A169' }]} onPress={handleDevolver} disabled={loading}>
                <Text style={styles.textoBotao}>{loading ? 'Devolvendo...' : 'Devolver'}</Text>
              </TouchableOpacity>
            ) : !emprestada ? (
              <TouchableOpacity style={[styles.botao, { backgroundColor: '#236D4D' }]} onPress={() => handleEmprestar()} disabled={loading}>
                <Text style={styles.textoBotao}>{loading ? 'Emprestando...' : 'Emprestar'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        
        {/* Botão de emprestar para grupo */}
        {grupoFerramentas && grupoFerramentas.disponivel > 0 && !mostrarListaFerramentas && (
          <View style={{ alignItems: 'center', marginBottom: 30 }}>
            <TouchableOpacity 
              style={[styles.botao, { backgroundColor: '#236D4D' }]} 
              onPress={() => {
                const ferramentasDisponiveis = obterFerramentasDisponiveis(grupoFerramentas);
                if (ferramentasDisponiveis.length > 0) {
                  handleEmprestar(ferramentasDisponiveis[0]);
                }
              }} 
              disabled={loading}
            >
              <Text style={styles.textoBotao} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                {loading ? 'Emprestando...' : `Emprestar (${grupoFerramentas.disponivel}/${grupoFerramentas.total})`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContentContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  image: {
    width: 180,
    height: 180,
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#EAF7EF',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  infoContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#334155',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 10,
  },
  infoText: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
  },
  localRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  botao: {
    minWidth: 200,
    maxWidth: '90%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  historicoBox: {
    width: '90%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historicoTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 6,
  },
  historicoUsuario: {
    fontSize: 15,
    marginBottom: 2,
  },
  historicoData: {
    fontSize: 14,
    opacity: 0.7
  },
  historicoStatus: {
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 8,
  },
  erroBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 12,
    alignItems: 'center',
    alignSelf: 'center'
  },
  erroText: {
    color: '#C53030',
    fontSize: 15
  },
  grupoInfoContainer: {
    width: '90%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  grupoStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  verFerramentasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  verFerramentasTexto: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
    flexShrink: 1,
  },
  devolverTodasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  devolverTodasTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listaFerramentasContainer: {
    width: '90%',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  ferramentaItemLista: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  ferramentaItemInfo: {
    flex: 1,
  },
  ferramentaItemNome: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  ferramentaItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  ferramentaItemStatusTexto: {
    fontSize: 13,
  },
  emprestarItemButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emprestarItemTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  devolverItemButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devolverItemTexto: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  ferramentaItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  naoPodeDevolverBadge: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  naoPodeDevolverTexto: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
  },
  emprestimoInfoItem: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  emprestimoInfoTexto: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  emprestimoInfoData: {
    fontSize: 11,
    opacity: 0.5,
  },
  checkboxContainerLista: {
    marginRight: 10,
  },
  selectionActionsContainerDetalhes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 0,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectionCountDetalhes: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonTextDetalhes: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});