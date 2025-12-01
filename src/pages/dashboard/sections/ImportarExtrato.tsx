import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import extratoBancarioService from '../../../services/extrato-bancario.service';
import { FormatoExtrato, ResultadoImportacao } from '../../../types/api.types';

interface ImportarExtratoProps {
  contasBancarias: Array<{ id: string; descricao: string; banco: string }>;
  onImportSuccess?: (resultado: ResultadoImportacao) => void;
}

const ImportarExtrato: React.FC<ImportarExtratoProps> = ({ contasBancarias, onImportSuccess }) => {
  const [contaBancariaId, setContaBancariaId] = useState('');
  const [formato, setFormato] = useState<FormatoExtrato>(FormatoExtrato.OFX);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArquivo(file);
      setError('');
      setResultado(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      // Validar extensão
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (
        (formato === FormatoExtrato.OFX && extension !== 'ofx') ||
        (formato === FormatoExtrato.CSV && extension !== 'csv')
      ) {
        setError(`Arquivo deve ter extensão .${formato.toLowerCase()}`);
        return;
      }
      setArquivo(file);
      setError('');
      setResultado(null);
    }
  };

  const handleImportar = async () => {
    if (!contaBancariaId) {
      setError('Selecione uma conta bancária');
      return;
    }

    if (!arquivo) {
      setError('Selecione um arquivo para importar');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await extratoBancarioService.importar(contaBancariaId, formato, arquivo);

      setResultado(response.data!);
      setArquivo(null);

      if (onImportSuccess && response.data) {
        onImportSuccess(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao importar extrato');
    } finally {
      setLoading(false);
    }
  };

  const getAcceptedFileTypes = () => {
    return formato === FormatoExtrato.OFX ? '.ofx' : '.csv';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Importar Extrato Bancário
        </Typography>

        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Seleção de Conta Bancária */}
          <FormControl fullWidth>
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

          {/* Seleção de Formato */}
          <FormControl fullWidth>
            <InputLabel>Formato do Arquivo</InputLabel>
            <Select
              value={formato}
              onChange={e => {
                setFormato(e.target.value as FormatoExtrato);
                setArquivo(null);
              }}
              label="Formato do Arquivo"
              disabled={loading}
            >
              <MenuItem value={FormatoExtrato.OFX}>OFX</MenuItem>
              <MenuItem value={FormatoExtrato.CSV}>CSV</MenuItem>
            </Select>
          </FormControl>

          {/* Área de Upload */}
          <Paper
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              p: 4,
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : 'grey.300',
              backgroundColor: isDragging ? 'action.hover' : 'background.paper',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {arquivo ? arquivo.name : 'Arraste o arquivo aqui ou clique para selecionar'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Formatos aceitos: {formato}
            </Typography>
            <input
              type="file"
              accept={getAcceptedFileTypes()}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
              disabled={loading}
            />
            <label htmlFor="file-upload">
              <Button component="span" variant="outlined" disabled={loading} sx={{ mt: 2 }}>
                Selecionar Arquivo
              </Button>
            </label>
          </Paper>

          {/* Botão de Importar */}
          <Button
            variant="contained"
            onClick={handleImportar}
            disabled={!arquivo || !contaBancariaId || loading}
            fullWidth
            size="large"
          >
            {loading ? <CircularProgress size={24} /> : 'Importar Extrato'}
          </Button>

          {/* Mensagens de Erro */}
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Resultado da Importação */}
          {resultado && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Importação concluída com sucesso!
                </Typography>
              </Alert>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" gutterBottom>
                  Total de transações importadas: <strong>{resultado.totalImportado}</strong>
                </Typography>

                <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Com Sugestão de Conciliação
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {resultado.comSugestao}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Sem Sugestão
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {resultado.semSugestao}
                    </Typography>
                  </Box>
                </Box>

                {resultado.comSugestao > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <CheckCircleIcon fontSize="small" color="success" />
                      {resultado.comSugestao} transação(ões) possui(em) sugestões automáticas de
                      conciliação
                    </Typography>
                  </Box>
                )}

                {resultado.semSugestao > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" display="flex" alignItems="center" gap={1}>
                      <WarningIcon fontSize="small" color="warning" />
                      {resultado.semSugestao} transação(ões) aguardando análise manual
                    </Typography>
                  </Box>
                )}

                {/* Barra de progresso visual */}
                {resultado.totalImportado > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={(resultado.comSugestao / resultado.totalImportado) * 100}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      {((resultado.comSugestao / resultado.totalImportado) * 100).toFixed(1)}% com
                      sugestões automáticas
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ImportarExtrato;
