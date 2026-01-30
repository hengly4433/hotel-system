"use client";

import * as React from "react";
import { Paper, Typography, Box } from "@mui/material"; // Removed Grid imports
import { GradientCard } from "@/components/ui/GradientCard";
import PageHeader from "@/components/ui/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const visitData = [
  { name: "JAN", chn: 20, usa: 40, uk: 10 },
  { name: "FEB", chn: 40, usa: 30, uk: 20 },
  { name: "MAR", chn: 30, usa: 20, uk: 10 },
  { name: "APR", chn: 50, usa: 40, uk: 30 },
  { name: "MAY", chn: 40, usa: 60, uk: 40 },
  { name: "JUN", chn: 30, usa: 70, uk: 50 },
  { name: "JUL", chn: 50, usa: 40, uk: 30 },
  { name: "AUG", chn: 60, usa: 40, uk: 20 },
];

const sourceData = [
  { name: "Search Engines", value: 30 },
  { name: "Direct Click", value: 30 },
  { name: "Bookmarks Click", value: 40 },
];

const COLORS = ["#ff718b", "#2bc6fc", "#8e67f0"];

export default function AdminDashboard() {
  return (
    <main>
      <PageHeader title="Dashboard" subtitle="Overview" />

      {/* Top Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <GradientCard
            title="Weekly Sales"
            value="$ 15,0000"
            change="Increased by 60%"
            gradient="linear-gradient(to right, #ffbf96, #fe7096)"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <GradientCard
            title="Weekly Orders"
            value="45,6334"
            change="Decreased by 10%"
            gradient="linear-gradient(to right, #90caf9, #047edf)"
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <GradientCard
            title="Visitors Online"
            value="95,5741"
            change="Increased by 5%"
            gradient="linear-gradient(to right, #84d9d2, #07cdae)"
          />
        </Box>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Bar Chart */}
        <Box sx={{ flex: 7 }}>
          <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">Visit And Sales Statistics</Typography>
                <Box>
                    {/* Fake Legend */}
                    <Typography component="span" variant="caption" sx={{ color: '#b66dff', mr: 2 }}>● CHN</Typography>
                    <Typography component="span" variant="caption" sx={{ color: '#ff718b', mr: 2 }}>● USA</Typography>
                    <Typography component="span" variant="caption" sx={{ color: '#25bef9', mr: 2 }}>● UK</Typography>
                </Box>
            </Box>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={visitData} barSize={10}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9aa0ac', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9aa0ac', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="chn" fill="#b66dff" radius={[10, 10, 0, 0]} />
                <Bar dataKey="usa" fill="#ff718b" radius={[10, 10, 0, 0]} />
                <Bar dataKey="uk" fill="#25bef9" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Box>

        {/* Donut Chart */}
        <Box sx={{ flex: 5 }}>
            <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Traffic Sources</Typography>
            <Box sx={{ height: 250, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={0}
                        dataKey="value"
                    >
                        {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
             </Box>
             <Box sx={{ mt: 2 }}>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}><span style={{width: 10, height: 10, borderRadius: '50%', background: '#ff718b', marginRight: 8}}></span> Search Engines</Typography>
                    <Typography variant="body2" color="text.secondary">30%</Typography>
                 </Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}><span style={{width: 10, height: 10, borderRadius: '50%', background: '#2bc6fc', marginRight: 8}}></span> Direct Click</Typography>
                    <Typography variant="body2" color="text.secondary">30%</Typography>
                 </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}><span style={{width: 10, height: 10, borderRadius: '50%', background: '#8e67f0', marginRight: 8}}></span> Bookmarks Click</Typography>
                    <Typography variant="body2" color="text.secondary">40%</Typography>
                 </Box>
             </Box>
          </Paper>
        </Box>
      </Box>
    </main>
  );
}
