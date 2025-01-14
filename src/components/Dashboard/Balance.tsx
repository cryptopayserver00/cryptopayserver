import { axisClasses, BarChart } from '@mui/x-charts';
import { useState } from 'react';
import { dataset } from './Dataset';

type TickParamsSelectorProps = {
  tickPlacement: 'end' | 'start' | 'middle' | 'extremities';
  tickLabelPlacement: 'tick' | 'middle';
  setTickPlacement: React.Dispatch<React.SetStateAction<'end' | 'start' | 'middle' | 'extremities'>>;
  setTickLabelPlacement: React.Dispatch<React.SetStateAction<'tick' | 'middle'>>;
};

const valueFormatter = (value: number | null) => `${value}mm`;

const chartSetting = {
  yAxis: [
    {
      label: 'rainfall (mm)',
    },
  ],
  series: [{ dataKey: 'seoul', label: 'Seoul rainfall', valueFormatter }],
  height: 300,
  sx: {
    [`& .${axisClasses.directionY} .${axisClasses.label}`]: {
      transform: 'translateX(-10px)',
    },
  },
};

const series = [
  {
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
];

const Balance = () => {
  const [tickPlacement, setTickPlacement] = useState<'start' | 'end' | 'middle' | 'extremities'>('middle');
  const [tickLabelPlacement, setTickLabelPlacement] = useState<'middle' | 'tick'>('middle');

  return (
    <BarChart
      series={series}
      // width={500}
      height={300}
    />
  );
};

export default Balance;
