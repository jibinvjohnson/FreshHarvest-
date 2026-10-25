'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface HarvestChartProps {
  data: Array<{
    name: string;
    expected: number;
    actual: number;
    variance: number;
  }>;
}

export function HarvestChart({ data }: HarvestChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d4" />
          <XAxis dataKey="name" stroke="#5c635b" fontSize={12} tickLine={false} />
          <YAxis stroke="#5c635b" fontSize={12} unit=" kg" />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#d7eab9', borderRadius: '8px' }}
            formatter={(value: number, name: string) => [`${value} kg`, name === 'expected' ? 'Expected Yield' : 'Actual Yield']}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="expected" fill="#96cca9" name="Expected (kg)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="actual" fill="#2e7647" name="Actual (kg)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
