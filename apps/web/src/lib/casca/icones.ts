import Bitcoin from '@lucide/svelte/icons/bitcoin';
import Bookmark from '@lucide/svelte/icons/bookmark';
import Calendar from '@lucide/svelte/icons/calendar';
import ChartCandlestick from '@lucide/svelte/icons/chart-candlestick';
import ChartPie from '@lucide/svelte/icons/chart-pie';
import Cpu from '@lucide/svelte/icons/cpu';
import House from '@lucide/svelte/icons/house';
import Newspaper from '@lucide/svelte/icons/newspaper';
import type { Component } from 'svelte';

/** Ícones dos espaços (nome lucide → componente). */
export const iconesEspaco: Record<string, Component<{ size?: number; strokeWidth?: number }>> = {
	house: House,
	newspaper: Newspaper,
	'chart-pie': ChartPie,
	bitcoin: Bitcoin,
	'chart-candlestick': ChartCandlestick,
	cpu: Cpu,
	calendar: Calendar,
	bookmark: Bookmark
};
