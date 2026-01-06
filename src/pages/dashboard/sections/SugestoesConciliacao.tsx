import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  VisibilityOff as VisibilityOffIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import extratoBancarioService from '../../../services/extrato-bancario.service';
import { ExtratoBancario, StatusExtratoItem, TipoTransacao } from '../../../types/api.types';

interface SugestoesConciliacaoProps {
  contasBancarias: Array<{ id: string; descricao: string; banco: string }>;
}

const SugestoesConciliacao: React.FC<SugestoesConciliacaoProps> = ({ contasBancarias }) => {
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [extratos, setExtratos] = useState<ExtratoBancario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<ExtratoBancario | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadExtratosPendentes = React.useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await extratoBancarioService.findPendentes(contaBancariaId);
      setExtratos(response.data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Erro ao carregar extratos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contaBancariaId]);

  useEffect(() => {
    if (contaBancariaId) {
      loadExtratosPendentes();
    }
  }, [contaBancariaId, loadExtratosPendentes]);

  const handleAceitarSugestao = async (itemId: string) => {
    setActionLoading(true);
    try {
      await extratoBancarioService.aceitarSugestao(itemId);
      await loadExtratosPendentes();
      setDetailsOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Erro ao aceitar sugestão';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeitarSugestao = async (itemId: string) => {
    setActionLoading(true);
    try {
      await extratoBancarioService.rejeitarSugestao(itemId);
      await loadExtratosPendentes();
      setDetailsOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Erro ao rejeitar sugestão';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleIgnorarItem = async (itemId: string) => {
    setActionLoading(true);
    try {
      await extratoBancarioService.ignorarItem(itemId);
      await loadExtratosPendentes();
      setDetailsOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Erro ao ignorar item';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: StatusExtratoItem) => {
    switch (status) {
      case StatusExtratoItem.SUGESTAO:
        return 'info';
      case StatusExtratoItem.PENDENTE:
        return 'warning';
      case StatusExtratoItem.CONCILIADO:
        return 'success';
      case StatusExtratoItem.IGNORADO:
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: StatusExtratoItem) => {
    switch (status) {
      case StatusExtratoItem.SUGESTAO:
        return 'Com Sugestão';
      case StatusExtratoItem.PENDENTE:
        return 'Pendente';
      case StatusExtratoItem.CONCILIADO:
        return 'Conciliado';
      case StatusExtratoItem.IGNORADO:
        return 'Ignorado';
      default:
        return status;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success.main';
    if (score >= 60) return 'info.main';
    if (score >= 40) return 'warning.main';
    return 'error.main';
  };

  const extratosPendentes = extratos.filter(e => e.status === StatusExtratoItem.PENDENTE);
  const extratosComSugestao = extratos.filter(e => e.status === StatusExtratoItem.SUGESTAO);

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Sugestões de Conciliação
        </Typography>

        <Box sx={{ mt: 3 }}>
          {/* Seleção de Conta Bancária */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Conta Bancária</InputLabel>
            <Select
              value={contaBancariaId}
              onChange={e => setContaBancariaId(e.target.value)}
              label="Conta Bancária"
              disabled={loading}
            >
              {contasBancarias.map(conta => (
                <MenuItem key={conta.id} value={conta.id}>
                  {conta.banco} - {conta.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Estatísticas */}
          {contaBancariaId && !loading && extratos.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Com Sugestão
                </Typography>
                <Typography variant="h4" color="info.main">
                  {extratosComSugestao.length}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Pendentes
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {extratosPendentes.length}
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="h4">{extratos.length}</Typography>
              </Paper>
            </Box>
          )}

          {/* Mensagens */}
          {error && (
            <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && contaBancariaId && extratos.length === 0 && (
            <Alert severity="info">Nenhum extrato pendente de conciliação para esta conta.</Alert>
          )}

          {/* Tabela de Extratos */}
          {!loading && extratos.length > 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {extratos.map(extrato => (
                    <TableRow
                      key={extrato.id}
                      sx={{
                        backgroundColor:
                          extrato.status === StatusExtratoItem.SUGESTAO
                            ? 'action.hover'
                            : 'inherit',
                      }}
                    >
                      <TableCell>{formatDate(extrato.dataTransacao)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{extrato.descricao}</Typography>
                        {extrato.documento && (
                          <Typography variant="caption" color="text.secondary">
                            Doc: {extrato.documento}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            extrato.tipoTransacao === TipoTransacao.CREDITO ? (
                              <TrendingUpIcon />
                            ) : (
                              <TrendingDownIcon />
                            )
                          }
                          label={
                            extrato.tipoTransacao === TipoTransacao.CREDITO ? 'Crédito' : 'Débito'
                          }
                          size="small"
                          color={
                            extrato.tipoTransacao === TipoTransacao.CREDITO ? 'success' : 'error'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color={
                            extrato.tipoTransacao === TipoTransacao.CREDITO
                              ? 'success.main'
                              : 'error.main'
                          }
                        >
                          {formatCurrency(extrato.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(extrato.status)}
                          color={getStatusColor(extrato.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {extrato.scoreMatch !== undefined && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={extrato.scoreMatch}
                              sx={{
                                width: 60,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: 'grey.300',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: getScoreColor(extrato.scoreMatch),
                                },
                              }}
                            />
                            <Typography
                              variant="caption"
                              fontWeight="bold"
                              color={getScoreColor(extrato.scoreMatch)}
                            >
                              {extrato.scoreMatch.toFixed(0)}%
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {extrato.status === StatusExtratoItem.SUGESTAO && (
                            <>
                              <Tooltip title="Aceitar Sugestão">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleAceitarSugestao(extrato.id)}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rejeitar Sugestão">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRejeitarSugestao(extrato.id)}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Ver Detalhes">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setSelectedItem(extrato);
                                setDetailsOpen(true);
                              }}
                            >
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Ignorar">
                            <IconButton size="small" onClick={() => handleIgnorarItem(extrato.id)}>
                              <VisibilityOffIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Dialog de Detalhes */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Detalhes da Transação</DialogTitle>
          <DialogContent>
            {selectedItem && (
              <Box sx={{ mt: 2 }}>
                {/* Dados do Extrato */}
                <Typography variant="h6" gutterBottom>
                  Extrato Bancário
                </Typography>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2">
                    <strong>Data:</strong> {formatDate(selectedItem.dataTransacao)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Descrição:</strong> {selectedItem.descricao}
                  </Typography>
                  {selectedItem.documento && (
                    <Typography variant="body2">
                      <strong>Documento:</strong> {selectedItem.documento}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Valor:</strong> {formatCurrency(selectedItem.valor)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tipo:</strong>{' '}
                    {selectedItem.tipoTransacao === TipoTransacao.CREDITO ? 'Crédito' : 'Débito'}
                  </Typography>
                </Box>

                {/* Sugestão de Conciliação */}
                {selectedItem.sugestao && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Sugestão de Conciliação
                    </Typography>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                          Score de Confiança:
                        </Typography>
                        <Chip
                          label={`${selectedItem.sugestao.score}%`}
                          color={
                            selectedItem.sugestao.score >= 80
                              ? 'success'
                              : selectedItem.sugestao.score >= 60
                                ? 'info'
                                : 'warning'
                          }
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2">
                        <strong>Data:</strong> {formatDate(selectedItem.sugestao.movimentacao.data)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Descrição:</strong> {selectedItem.sugestao.movimentacao.descricao}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Valor:</strong>{' '}
                        {formatCurrency(selectedItem.sugestao.movimentacao.valor)}
                      </Typography>

                      {/* Razões da Sugestão */}
                      {selectedItem.sugestao.razoes.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            Razões da Sugestão:
                          </Typography>
                          {selectedItem.sugestao.razoes.map((razao, index) => (
                            <Chip key={index} label={razao} size="small" sx={{ mr: 1, mb: 1 }} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </>
                )}

                {selectedItem.movimentacaoSugerida && !selectedItem.sugestao && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Movimentação Sugerida
                    </Typography>
                    <Box sx={{ mb: 2, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                      <Typography variant="body2">
                        <strong>Data:</strong>{' '}
                        {formatDate(selectedItem.movimentacaoSugerida.dataMovimento)}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Descrição:</strong> {selectedItem.movimentacaoSugerida.descricao}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Valor:</strong>{' '}
                        {formatCurrency(selectedItem.movimentacaoSugerida.valor)}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            {selectedItem?.status === StatusExtratoItem.SUGESTAO && (
              <>
                <Button
                  onClick={() => selectedItem && handleRejeitarSugestao(selectedItem.id)}
                  color="error"
                  disabled={actionLoading}
                >
                  Rejeitar
                </Button>
                <Button
                  onClick={() => selectedItem && handleAceitarSugestao(selectedItem.id)}
                  variant="contained"
                  color="success"
                  disabled={actionLoading}
                >
                  {actionLoading ? <CircularProgress size={24} /> : 'Aceitar'}
                </Button>
              </>
            )}
            {selectedItem?.status === StatusExtratoItem.PENDENTE && (
              <Button
                onClick={() => selectedItem && handleIgnorarItem(selectedItem.id)}
                color="inherit"
                disabled={actionLoading}
              >
                Ignorar
              </Button>
            )}
            <Button onClick={() => setDetailsOpen(false)} disabled={actionLoading}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SugestoesConciliacao;
