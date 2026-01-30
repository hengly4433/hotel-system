"use client";

import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import { 
  Box, 
  Card, 
  CardActionArea, 
  CardContent, 
  Grid, 
  Typography, 
  Stack 
} from "@mui/material";
import { 
  Sell as SellIcon, 
  RequestQuote as PricesIcon, 
  Percent as TaxesIcon, 
  EventBusy as CancelIcon,
  ArrowForward as ArrowIcon
} from "@mui/icons-material";

const PRICING_MODULES = [
  {
    title: "Rate Plans",
    description: "Define base rates, meal plans, and booking conditions.",
    icon: <SellIcon fontSize="large" sx={{ color: 'white' }} />,
    href: "/admin/pricing/rate-plans",
    color: "linear-gradient(135deg, #a855f7 0%, #9333ea 100%)" // Purple
  },
  {
    title: "Nightly Prices",
    description: "Manage calendar-based pricing adjustments and seasonality.",
    icon: <PricesIcon fontSize="large" sx={{ color: 'white' }} />,
    href: "/admin/pricing/nightly-prices",
    color: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" // Blue
  },
  {
    title: "Taxes & Fees",
    description: "Configure automatic taxes, service charges, and additional fees.",
    icon: <TaxesIcon fontSize="large" sx={{ color: 'white' }} />,
    href: "/admin/pricing/taxes-fees",
    color: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" // Amber
  },
  {
    title: "Cancellation Policies",
    description: "Set up refund rules and cancellation windows for guests.",
    icon: <CancelIcon fontSize="large" sx={{ color: 'white' }} />,
    href: "/admin/pricing/cancellation-policies",
    color: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" // Red
  }
];

export default function PricingHomePage() {
  return (
    <main>
      <PageHeader title="Pricing" subtitle="Manage rate plans and pricing rules" />
      
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          {PRICING_MODULES.map((module) => (
            <Grid key={module.title} size={{ xs: 12, sm: 6, md: 6, lg: 3 }}>
              <Card sx={{ 
                  borderRadius: 4, 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                  }
              }}>
                <CardActionArea 
                    component={Link} 
                    href={module.href} 
                    sx={{ height: '100%', p: 1 }}
                >
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                    {/* Icon Box */}
                    <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: module.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        {module.icon}
                    </Box>

                    {/* Text Content */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {module.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {module.description}
                        </Typography>
                    </Box>

                    {/* Action Hint */}
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'primary.main', mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>Open</Typography>
                        <ArrowIcon fontSize="small" />
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </main>
  );
}
