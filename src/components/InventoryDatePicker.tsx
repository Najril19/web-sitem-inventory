'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';

import { cn } from '@/components/ui/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type InventoryDatePickerAccent = 'emerald' | 'orange' | 'blue';

function parseISODateLocal(iso: string): Date | undefined {
  if (!iso?.trim()) return undefined;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return undefined;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return undefined;
  return dt;
}

function toISODateString(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

const accentConfig: Record<
  InventoryDatePickerAccent,
  { ring: string; selected: string; today: string; bar: string }
> = {
  emerald: {
    ring: 'focus-visible:ring-2 focus-visible:ring-emerald-500/60 focus-visible:border-emerald-500',
    selected:
      'bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white',
    today: 'bg-emerald-500/15 text-emerald-300 font-semibold aria-selected:bg-emerald-600 aria-selected:text-white',
    bar: 'from-emerald-500 to-emerald-600',
  },
  orange: {
    ring: 'focus-visible:ring-2 focus-visible:ring-orange-500/60 focus-visible:border-orange-500',
    selected:
      'bg-orange-600 text-white hover:bg-orange-600 hover:text-white focus:bg-orange-600 focus:text-white',
    today: 'bg-orange-500/15 text-orange-300 font-semibold aria-selected:bg-orange-600 aria-selected:text-white',
    bar: 'from-orange-500 to-orange-600',
  },
  blue: {
    ring: 'focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:border-blue-500',
    selected:
      'bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white',
    today: 'bg-blue-500/15 text-blue-300 font-semibold aria-selected:bg-blue-600 aria-selected:text-white',
    bar: 'from-blue-500 to-blue-600',
  },
};

export interface InventoryDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  accent?: InventoryDatePickerAccent;
  className?: string;
}

export function InventoryDatePicker({
  value,
  onChange,
  id,
  disabled,
  placeholder = 'Pilih tanggal',
  accent = 'emerald',
  className,
}: InventoryDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseISODateLocal(value);
  const cfg = accentConfig[accent];

  const labelText = selected
    ? format(selected, 'EEEE, d MMMM yyyy', { locale: localeId })
    : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cn(
            'group flex w-full items-center justify-between gap-3 rounded-lg border border-gray-600 bg-gray-700/80 px-4 py-2.5 text-left text-sm text-white shadow-inner shadow-black/20 transition-all',
            'hover:border-gray-500 hover:bg-gray-700',
            cfg.ring,
            'outline-none focus-visible:outline-none',
            disabled && 'cursor-not-allowed opacity-50',
            className
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-gray-400')}>
            {labelText}
          </span>
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-600 bg-gray-800/90 text-gray-300 transition-colors',
              'group-hover:border-gray-500 group-hover:text-white',
              `bg-gradient-to-br ${cfg.bar} border-0 text-white shadow-md`
            )}
          >
            <CalendarDays className="size-4" aria-hidden />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto overflow-hidden border border-gray-700 bg-gray-900 p-0 shadow-2xl shadow-black/60"
        sideOffset={8}
      >
        <div className={cn('h-1 w-full bg-gradient-to-r', cfg.bar)} />
        <div className="px-4 pb-1 pt-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Kalender</p>
          <p className="text-sm font-semibold text-white">Pilih tanggal</p>
        </div>
        <div className="px-2 pb-3">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(toISODateString(d));
                setOpen(false);
              }
            }}
            defaultMonth={selected ?? new Date()}
            initialFocus
            className="rounded-lg bg-transparent text-gray-100 [--cell-size:2.25rem]"
            classNames={{
              months: 'flex flex-col gap-3',
              month: 'flex flex-col gap-3',
              caption:
                'relative flex items-center justify-center border-b border-gray-700/80 pb-3 pt-1',
              caption_label: 'text-sm font-semibold capitalize text-white',
              nav: 'flex items-center gap-1',
              nav_button: cn(
                'inline-flex size-8 items-center justify-center rounded-lg border border-gray-600 bg-gray-800 text-gray-200',
                'opacity-90 transition-colors hover:bg-gray-700 hover:text-white hover:opacity-100'
              ),
              nav_button_previous: 'absolute left-0',
              nav_button_next: 'absolute right-0',
              table: 'w-full border-collapse',
              head_row: 'flex',
              head_cell:
                'flex-1 text-center text-[0.7rem] font-medium uppercase tracking-wide text-gray-500',
              row: 'mt-1 flex w-full',
              cell: 'relative flex-1 p-0 text-center text-sm focus-within:relative focus-within:z-10',
              day: cn(
                'mx-auto flex size-9 items-center justify-center rounded-lg font-normal text-gray-200',
                'hover:bg-gray-700 hover:text-white',
                'focus-visible:ring-2 focus-visible:ring-offset-0',
                accent === 'emerald' && 'focus-visible:ring-emerald-500/50',
                accent === 'orange' && 'focus-visible:ring-orange-500/50',
                accent === 'blue' && 'focus-visible:ring-blue-500/50'
              ),
              day_selected: cfg.selected,
              day_today: cfg.today,
              day_outside: 'text-gray-600 opacity-60 aria-selected:text-white',
              day_disabled: 'text-gray-600 opacity-40',
              day_hidden: 'invisible',
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
