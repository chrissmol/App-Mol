import {
  Apple, Archive, ArrowLeft, ArrowUpRight, BellRing, CalendarCheck, CalendarDays,
  ChartNoAxesColumnIncreasing, ChartNoAxesCombined, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleHelp, Clock3,
  CalendarCheck2, ClipboardList, Compass, Copy, createIcons, Crown, Download, Dumbbell, Eye, EyeOff, FilePlus2,
  Flame, Footprints, Info, Languages, Layers3, LayoutDashboard, LayoutTemplate, LockKeyhole,
  LogOut, Medal, Minus, Monitor, Moon, Palette, Pencil, Play, Plus, Replace, Ruler, Scale,
  Search, Send, Settings2, Share2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Star,
  Sun, Target, TimerReset, Trash2, TriangleAlert, TrendingDown, TrendingUp, Trophy, Truck, Upload, User,
  Utensils, Weight, X
} from 'lucide';

const icons = {
  Apple, Archive, ArrowLeft, ArrowUpRight, BellRing, CalendarCheck, CalendarDays,
  ChartNoAxesColumnIncreasing, ChartNoAxesCombined, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleHelp, ClipboardList, Clock3,
  Compass, Copy, Crown, Download, Dumbbell, Eye, EyeOff, FilePlus2, Flame, Footprints, Info, Languages,
  CalendarCheck2, Layers3, LayoutDashboard, LayoutTemplate, LockKeyhole, LogOut, Medal,
  Minus, Monitor, Moon, Palette, Pencil, Play, Plus, Replace, Ruler, Scale, Search, Send,
  Settings2, Share2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Star, Sun, Target,
  TimerReset, Trash2, TriangleAlert, TrendingDown, TrendingUp, Trophy, Truck, Upload, User, Utensils, Weight, X
};

const kebabCase = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z])(\d)/g, '$1-$2').toLocaleLowerCase('en-US');
export const registeredIconNames = Object.keys(icons).map(kebabCase);

export function renderIcons(root = document) {
  createIcons({ icons, root });
}

// Compatibilidade com os controllers existentes enquanto a renderização
// continua centralizada e limitada somente aos ícones usados pelo Mol.
if (typeof window !== 'undefined') window.lucide = { createIcons: ({ root = document } = {}) => renderIcons(root) };
