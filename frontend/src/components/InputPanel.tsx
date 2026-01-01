import { useMemo } from 'react';
import { Box, TextField, Button, Paper, Typography, LinearProgress, Chip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import FilterListIcon from '@mui/icons-material/FilterList';

interface InputPanelProps {
  inputData: string;
  onInputChange: (value: string) => void;
  onStart: () => void;
  onStop: () => void;
  isRunning: boolean;
  progress: number;
  total: number;
  disabled?: boolean;
}

export function InputPanel({
  inputData,
  onInputChange,
  onStart,
  onStop,
  isRunning,
  progress,
  total,
  disabled = false,
}: InputPanelProps) {
  const lineCount = inputData.trim() ? inputData.trim().split('\n').length : 0;

  const duplicateCount = useMemo(() => {
    const lines = inputData.split('\n');
    const seen = new Set<string>();
    let count = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        if (seen.has(trimmed)) {
          count++;
        } else {
          seen.add(trimmed);
        }
      }
    }

    return count;
  }, [inputData]);

  const handleDeduplicate = () => {
    const lines = inputData.split('\n');
    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !seen.has(trimmed)) {
        seen.add(trimmed);
        uniqueLines.push(trimmed);
      } else if (!trimmed) {
        uniqueLines.push(line);
      }
    }

    onInputChange(uniqueLines.join('\n'));
  };

  return (
    <Paper variant='outlined' sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          输入
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {lineCount} 行
        </Typography>
      </Box>

      <TextField
        multiline
        fullWidth
        minRows={10}
        maxRows={20}
        placeholder="每行一条数据"
        value={inputData}
        onChange={(e) => onInputChange(e.target.value)}
        disabled={disabled || isRunning}
        sx={{ mb: 2, flexGrow: 1 }}
      />

      {isRunning && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              进度
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {progress} / {total}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={total > 0 ? (progress / total) * 100 : 0}
          />
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        {!isRunning ? (
          <>
            <Button
              variant="outlined"
              onClick={handleDeduplicate}
              disabled={disabled || !inputData.trim() || duplicateCount === 0}
              startIcon={<FilterListIcon />}
              // endIcon={duplicateCount > 0 ? <Chip size="small" label={duplicateCount} color="warning" /> : null}
              sx={{ whiteSpace: 'nowrap' }}
            >
              去重
              {duplicateCount > 0 && <Chip size="small" label={duplicateCount} color="info" sx={{ ml: 1 }} />}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={onStart}
              disabled={disabled || !inputData.trim()}
              startIcon={<PlayArrowIcon />}
            >
              开始
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            onClick={onStop}
            color="error"
            startIcon={<StopIcon />}
          >
            停止
          </Button>
        )}
      </Box>
    </Paper>
  );
}
