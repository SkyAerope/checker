import { Box, Paper, Typography, List, ListItem, ListItemText, Chip, IconButton, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { CheckResultItem, CheckStatus } from '../types';

interface ResultPanelProps {
  title: string;
  status: CheckStatus;
  items: CheckResultItem[];
  onClear: () => void;
}

const statusConfig: Record<CheckStatus, { color: 'success' | 'error' | 'warning'; icon: React.ReactNode }> = {
  valid: { color: 'success', icon: <CheckCircleIcon /> },
  invalid: { color: 'error', icon: <CancelIcon /> },
  unknown: { color: 'warning', icon: <HelpIcon /> },
};

export function ResultPanel({ title, status, items, onClear }: ResultPanelProps) {
  const config = statusConfig[status];

  return (
    <Paper variant='outlined' sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Chip
          size="small"
          label={items.length}
          color={config.color}
          icon={config.icon as React.ReactElement}
          sx={{ mr: 1 }}
        />
        <Tooltip title="清空">
          <span>
            <IconButton
              size="small"
              onClick={onClear}
              disabled={items.length === 0}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'grey.100',
          borderRadius: 1,
          minHeight: 200,
        }}
      >
        {items.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">暂无数据</Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {items.map((item, index) => (
              <ListItem
                key={`${item.data}-${index}`}
                divider={index < items.length - 1}
                sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <ListItemText
                  primary={item.data}
                  primaryTypographyProps={{
                    sx: { wordBreak: 'break-all', fontFamily: 'monospace' },
                  }}
                />
                {item.detail && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {item.detail}
                  </Typography>
                )}
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
