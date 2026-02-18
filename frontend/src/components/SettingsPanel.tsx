import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Collapse,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { checkHealth } from '../services/api';

interface SettingsPanelProps {
  backendUrl: string;
  onBackendUrlChange: (url: string) => void;
  concurrency: number;
  onConcurrencyChange: (value: number) => void;
  disabled?: boolean;
}

export function SettingsPanel({
  backendUrl,
  onBackendUrlChange,
  concurrency,
  onConcurrencyChange,
  disabled = false,
}: SettingsPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [inputUrl, setInputUrl] = useState(backendUrl);
  const [inputConcurrency, setInputConcurrency] = useState(String(concurrency));
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const parsedConcurrency = Number.parseInt(inputConcurrency, 10);
  const concurrencyValid = Number.isFinite(parsedConcurrency) && parsedConcurrency >= 1;

  const handleSave = () => {
    onBackendUrlChange(inputUrl);
    if (concurrencyValid) {
      const next = Math.min(Math.max(parsedConcurrency, 1), 64);
      onConcurrencyChange(next);
      setInputConcurrency(String(next));
    }
    setTestResult(null);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const healthy = await checkHealth(inputUrl);
      setTestResult(healthy ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Paper sx={{ mb: 2 }} variant='outlined'>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <SettingsIcon sx={{ mr: 1 }} />
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          设置
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <TextField
            fullWidth
            label="后端地址"
            placeholder="http://localhost:8000/check"
            value={inputUrl}
            onChange={(e) => {
              setInputUrl(e.target.value);
              setTestResult(null);
            }}
            disabled={disabled}
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="并发数"
            type="number"
            value={inputConcurrency}
            onChange={(e) => {
              setInputConcurrency(e.target.value);
            }}
            disabled={disabled}
            size="small"
            inputProps={{ min: 1, max: 64 }}
            helperText="范围 1-64，默认 8"
            error={inputConcurrency.trim().length > 0 && !concurrencyValid}
            sx={{ mb: 2 }}
          />

          {testResult && (
            <Alert
              severity={testResult === 'success' ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {testResult === 'success'
                ? '连接成功'
                : (() => {
                  const url = new URL(inputUrl);
                  url.pathname = '/health';
                  return `连接${url.toString()}失败，请检查后端地址`;
                })()
              }
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleTest}
              disabled={disabled || testing || !inputUrl}
              startIcon={testing ? <CircularProgress size={16} /> : null}
            >
              测试连接
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={
                disabled
                || !inputUrl
                || !concurrencyValid
                || (inputUrl === backendUrl && parsedConcurrency === concurrency)
              }
            >
              保存
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
