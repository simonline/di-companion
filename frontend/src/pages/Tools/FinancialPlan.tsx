import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import {
  AttachMoney,
  Info,
  ArrowBack
} from '@mui/icons-material';
import { CenteredFlexBox } from '@/components/styled';
import Header from '@/sections/Header';
import DocumentManager from '@/components/DocumentManager';
import { useNavigate } from 'react-router-dom';
import { categoryColors, CategoryEnum } from '@/utils/constants';
import { useAuthContext } from '@/hooks/useAuth';

function FinancialPlan() {
  const navigate = useNavigate();
  const { startup } = useAuthContext();

  return (
    <>
      <Header title="Financial Plan" />
      <CenteredFlexBox>
        <Box sx={{ maxWidth: 1200, width: '100%', mt: 4 }}>
          <Box sx={{ mb: 1 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/startup')}
              sx={{ color: 'text.secondary' }}
            >
              Back to Startup
            </Button>
          </Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: `${categoryColors.sustainability}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AttachMoney sx={{ color: categoryColors.sustainability, fontSize: 28 }} />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" fontWeight="700">
                    Financial Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload your financial plan for future analysis
                  </Typography>
                </Box>
              </Stack>

              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  bgcolor: `${categoryColors.sustainability}08`,
                  borderLeft: `4px solid ${categoryColors.sustainability}`,
                }}
                icon={<Info sx={{ color: categoryColors.sustainability }} />}
              >
                <Typography variant="body2">
                  <strong>What to Upload:</strong> Financial plans, revenue models, cash flow projections, budget spreadsheets, or financial forecasts. Supported formats: PDF, Excel (.xlsx, .xls), CSV.
                </Typography>
              </Alert>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="600" gutterBottom>
                  Helpful Tips for Creating Your Financial Plan:
                </Typography>
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 3 }}>
                  <Typography variant="body2" component="li">
                    Use <a href="https://www.liveplan.com" target="_blank" rel="noopener noreferrer">LivePlan</a>, <a href="https://finmodelslab.com" target="_blank" rel="noopener noreferrer">FinModelsLab</a> or <a href="https://www.smartsheet.com/free-financial-planning-templates" target="_blank" rel="noopener noreferrer">smartsheet</a> for templates
                  </Typography>
                  <Typography variant="body2" component="li">
                    Try <a href="https://www.projectionhub.com" target="_blank" rel="noopener noreferrer">ProjectionHub</a> for automated financial projections
                  </Typography>
                  <Typography variant="body2" component="li">
                    Detail your unit economics and the underlying assumptions
                  </Typography>
                  <Typography variant="body2" component="li">
                    Understand your cashflow and the drivers
                  </Typography>
                  <Typography variant="body2" component="li">
                    Show monthly burn rate and runway
                  </Typography>
                  <Typography variant="body2" component="li">
                    Include 3-year revenue projections (1-6 monthly, 6-12 by quarter, 2nd&3rd year in semester)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <DocumentManager
            category={CategoryEnum.sustainability}
            entityType="startup"
            entityId={startup?.id}
            entityField="financial_plan"
            title="Financial Plan"
            description="Upload financial plans, revenue models, or budget projections for analysis."
          />
        </Box>
      </CenteredFlexBox>
    </>
  );
}

export default FinancialPlan;