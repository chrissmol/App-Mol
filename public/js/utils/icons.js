import {
  Apple, Archive, ArrowLeft, BellRing, CalendarCheck, CalendarDays,
  ChartNoAxesColumnIncreasing, ChartNoAxesCombined, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleHelp, Clock3,
  Compass, Copy, createIcons, Download, Dumbbell, Eye, EyeOff, FilePlus2,
  Info, Languages, Layers3, LayoutDashboard, LayoutTemplate, LockKeyhole,
  LogOut, Medal, Minus, Monitor, Moon, Palette, Pencil, Play, Plus, Replace, Ruler, Scale,
  Search, Send, Settings2, Share2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Star,
  Sun, Target, TimerReset, Trash2, TriangleAlert, TrendingDown, TrendingUp, Trophy, Upload, User,
  Utensils, X
} from 'lucide';

const icons = {
  Apple, Archive, ArrowLeft, BellRing, CalendarCheck, CalendarDays,
  ChartNoAxesColumnIncreasing, ChartNoAxesCombined, Check, CheckCircle2,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleHelp, Clock3,
  Compass, Copy, Download, Dumbbell, Eye, EyeOff, FilePlus2, Info, Languages,
  Layers3, LayoutDashboard, LayoutTemplate, LockKeyhole, LogOut, Medal,
  Minus, Monitor, Moon, Palette, Pencil, Play, Plus, Replace, Ruler, Scale, Search, Send,
  Settings2, Share2, ShieldCheck, SlidersHorizontal, Smartphone, Sparkles, Star, Sun, Target,
  TimerReset, Trash2, TriangleAlert, TrendingDown, TrendingUp, Trophy, Upload, User, Utensils, X
};

const kebabCase = name => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Za-z])(\d)/g, '$1-$2').toLocaleLowerCase('en-US');
export const registeredIconNames = Object.keys(icons).map(kebabCase);

export function renderIcons(root = document) {
  createIcons({ icons, root });
}

// Compatibilidade com os controllers existentes enquanto a renderização
// continua centralizada e limitada somente aos ícones usados pelo Mol.
if (typeof window !== 'undefined') window.lucide = { createIcons: ({ root = document } = {}) => renderIcons(root) };
