import { useState, useRef, useCallback, useEffect } from 'react';
import { Container, Grid, Alert, Button, AppBar, Toolbar, Typography } from '@mui/material';
import { useSnackbar, closeSnackbar } from 'notistack';
import { SettingsPanel, InputPanel, ResultPanel } from './components';
import { checkData } from './services/api';
import type { CheckResultItem, CheckStatus } from './types';

const STORAGE_KEY_BACKEND_URL = 'checker_backend_url';

interface ClearUndoState {
  type: CheckStatus;
  items: CheckResultItem[];
  snackbarKey: string | number;
}

function App() {
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_BACKEND_URL) || '';
  });
  const [inputData, setInputData] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const [validItems, setValidItems] = useState<CheckResultItem[]>([]);
  const [invalidItems, setInvalidItems] = useState<CheckResultItem[]>([]);
  const [unknownItems, setUnknownItems] = useState<CheckResultItem[]>([]);

  const clearUndoRef = useRef<ClearUndoState | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (backendUrl) {
      localStorage.setItem(STORAGE_KEY_BACKEND_URL, backendUrl);
    }
  }, [backendUrl]);

  const statusLabels: Record<CheckStatus, string> = {
    valid: '有效',
    invalid: '无效',
    unknown: '未知',
  };

  const handleUndo = useCallback(() => {
    const clearUndo = clearUndoRef.current;
    if (!clearUndo) return;

    switch (clearUndo.type) {
      case 'valid':
        setValidItems(clearUndo.items);
        break;
      case 'invalid':
        setInvalidItems(clearUndo.items);
        break;
      case 'unknown':
        setUnknownItems(clearUndo.items);
        break;
    }

    closeSnackbar(clearUndo.snackbarKey);
    clearUndoRef.current = null;
  }, []);

  const handleStart = useCallback(async () => {
    if (!backendUrl) {
      enqueueSnackbar('请先在设置中配置后端地址', { variant: 'error' });
      return;
    }

    const lines = inputData
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      enqueueSnackbar('请输入要检查的数据', { variant: 'error' });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    setTotal(lines.length);
    abortControllerRef.current = new AbortController();

    let currentInput = inputData;

    for (let i = 0; i < lines.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      const line = lines[i];

      try {
        const response = await checkData(backendUrl, line);
        const resultItem: CheckResultItem = {
          data: line,
          status: response.status,
          detail: response.detail,
        };

        switch (response.status) {
          case 'valid':
            setValidItems((prev) => [...prev, resultItem]);
            break;
          case 'invalid':
            setInvalidItems((prev) => [...prev, resultItem]);
            break;
          default:
            setUnknownItems((prev) => [...prev, resultItem]);
        }
      } catch (err) {
        const resultItem: CheckResultItem = {
          data: line,
          status: 'unknown',
          detail: err instanceof Error ? err.message : '请求失败',
        };
        setUnknownItems((prev) => [...prev, resultItem]);
      }

      const lineIndex = currentInput.indexOf(line);
      if (lineIndex !== -1) {
        const beforeLine = currentInput.substring(0, lineIndex);
        const afterLine = currentInput.substring(lineIndex + line.length);
        currentInput = (beforeLine + afterLine).replace(/^\n+|\n+$/g, '').replace(/\n{2,}/g, '\n');
        setInputData(currentInput);
      }

      setProgress(i + 1);
    }

    setIsRunning(false);
    abortControllerRef.current = null;
  }, [backendUrl, inputData, enqueueSnackbar]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsRunning(false);
  }, []);

  const handleClear = useCallback((type: CheckStatus) => {
    let items: CheckResultItem[] = [];

    switch (type) {
      case 'valid':
        items = validItems;
        setValidItems([]);
        break;
      case 'invalid':
        items = invalidItems;
        setInvalidItems([]);
        break;
      case 'unknown':
        items = unknownItems;
        setUnknownItems([]);
        break;
    }

    const key = enqueueSnackbar(`已清空${statusLabels[type]}列表`, {
      variant: 'info',
      autoHideDuration: 5000,
      action: (snackbarId) => (
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            const undo = clearUndoRef.current;
            if (undo && undo.snackbarKey === snackbarId) {
              switch (undo.type) {
                case 'valid':
                  setValidItems(undo.items);
                  break;
                case 'invalid':
                  setInvalidItems(undo.items);
                  break;
                case 'unknown':
                  setUnknownItems(undo.items);
                  break;
              }
              clearUndoRef.current = null;
            }
            closeSnackbar(snackbarId);
          }}
        >
          撤销
        </Button>
      ),
    });

    clearUndoRef.current = { type, items, snackbarKey: key };
  }, [validItems, invalidItems, unknownItems, enqueueSnackbar, statusLabels]);

  const noBackendConfigured = !backendUrl;

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="h1">
            数据检查器
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <SettingsPanel
        backendUrl={backendUrl}
        onBackendUrlChange={setBackendUrl}
        disabled={isRunning}
      />

      {noBackendConfigured && (
        <Alert severity="info" sx={{ mb: 2 }}>
          请先在设置中配置后端地址
        </Alert>
      )}

      <InputPanel
        inputData={inputData}
        onInputChange={setInputData}
        onStart={handleStart}
        onStop={handleStop}
        isRunning={isRunning}
        progress={progress}
        total={total}
        disabled={noBackendConfigured}
      />

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ResultPanel
            title="有效"
            status="valid"
            items={validItems}
            onClear={() => handleClear('valid')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ResultPanel
            title="无效"
            status="invalid"
            items={invalidItems}
            onClear={() => handleClear('invalid')}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ResultPanel
            title="未知"
            status="unknown"
            items={unknownItems}
            onClear={() => handleClear('unknown')}
          />
        </Grid>
      </Grid>
      </Container>
    </>
  );
}

export default App;
