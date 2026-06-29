'use client';

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Button, Label } from '@talashim/ui';
import type { CmsLensHotspot } from '@talashim/types';
import {
  DEFAULT_LENS_CHIP_TRANSLATE,
  LENS_SHOWCASE_CHIP,
} from '@sadafgold/shared';
import {
  LENS_HERO_ARTBOARD,
  detectPositionUnit,
  formatLensPosition,
  parseLensPosition,
  readChipCoords,
  readHotspotCoords,
  writeChipCoords,
  writeHotspotCoords,
  type LensHotspotViewport,
} from '../lib/lens-hotspot-coords';

const HOTSPOT_COLORS = ['#cba670', '#8b7355', '#6d5945'] as const;

type DragTarget = 'hotspot' | 'chip';

interface DragState {
  index: number;
  target: DragTarget;
}

interface LensHotspotPositionEditorProps {
  heroImageUrl: string;
  hotspots: CmsLensHotspot[];
  productLabels?: string[];
  productImages?: string[];
  onChange: (hotspots: CmsLensHotspot[]) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function chipWidthPercent(viewport: LensHotspotViewport): string {
  const artboard = LENS_HERO_ARTBOARD[viewport];
  return `${(LENS_SHOWCASE_CHIP.width / artboard.width) * 100}%`;
}

function chipHeightPercent(viewport: LensHotspotViewport): string {
  const artboard = LENS_HERO_ARTBOARD[viewport];
  return `${(LENS_SHOWCASE_CHIP.height / artboard.height) * 100}%`;
}

export function LensHotspotPositionEditor({
  heroImageUrl,
  hotspots,
  productLabels = [],
  productImages = [],
  onChange,
}: LensHotspotPositionEditorProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [viewport, setViewport] = useState<LensHotspotViewport>('desktop');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const artboard = LENS_HERO_ARTBOARD[viewport];

  const updateSpot = useCallback(
    (index: number, patch: Partial<CmsLensHotspot>) => {
      onChange(
        hotspots.map((spot, spotIndex) =>
          spotIndex === index ? { ...spot, ...patch } : spot,
        ),
      );
    },
    [hotspots, onChange],
  );

  const positionFromPointer = useCallback(
    (clientX: number, clientY: number, preferUnit: 'px' | '%'): { top: string; left: string } | null => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return null;
      }

      const rect = canvas.getBoundingClientRect();
      const pointerX = ((clientX - rect.left) / rect.width) * artboard.width;
      const pointerY = ((clientY - rect.top) / rect.height) * artboard.height;
      const x = clamp(pointerX - dragOffsetRef.current.x, 0, artboard.width);
      const y = clamp(pointerY - dragOffsetRef.current.y, 0, artboard.height);

      return {
        left: formatLensPosition(x, artboard.width, preferUnit),
        top: formatLensPosition(y, artboard.height, preferUnit),
      };
    },
    [artboard.height, artboard.width],
  );

  useEffect(() => {
    if (!drag) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const spot = hotspots[drag.index];
      if (!spot) {
        return;
      }

      if (drag.target === 'hotspot') {
        const coords = readHotspotCoords(spot, viewport);
        const preferUnit = detectPositionUnit(coords.top);
        const next = positionFromPointer(event.clientX, event.clientY, preferUnit);
        if (!next) {
          return;
        }
        onChange(
          hotspots.map((item, index) =>
            index === drag.index ? writeHotspotCoords(item, viewport, next.top, next.left) : item,
          ),
        );
        return;
      }

      const coords = readChipCoords(spot, viewport);
      const preferUnit = detectPositionUnit(coords.top);
      const next = positionFromPointer(event.clientX, event.clientY, preferUnit);
      if (!next) {
        return;
      }
      onChange(
        hotspots.map((item, index) =>
          index === drag.index ? writeChipCoords(item, viewport, next.top, next.left) : item,
        ),
      );
    };

    const handlePointerUp = () => setDrag(null);

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [drag, hotspots, onChange, positionFromPointer, viewport]);

  const startDrag = (index: number, target: DragTarget) => (event: ReactPointerEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedIndex(index);

    const canvas = canvasRef.current;
    const spot = hotspots[index];
    if (canvas && spot) {
      const rect = canvas.getBoundingClientRect();
      const coords = target === 'hotspot' ? readHotspotCoords(spot, viewport) : readChipCoords(spot, viewport);
      const anchorX = parseLensPosition(coords.left, artboard.width, artboard.width / 2);
      const anchorY = parseLensPosition(coords.top, artboard.height, artboard.height / 2);
      const pointerX = ((event.clientX - rect.left) / rect.width) * artboard.width;
      const pointerY = ((event.clientY - rect.top) / rect.height) * artboard.height;
      dragOffsetRef.current = { x: pointerX - anchorX, y: pointerY - anchorY };
    }

    setDrag({ index, target });
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  if (!heroImageUrl.trim()) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface)]/50 p-8 text-center text-sm text-muted">
        ابتدا تصویر هیرو را انتخاب کنید تا بتوانید نقاط و کارت محصول را روی تصویر قرار دهید.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">طراحی روی تصویر</h3>
          <p className="mt-1 text-xs text-muted">
            دکمه + را برای جابجایی نقطه و کارت بژ را برای جابجایی کارت محصول بکشید. هر اسلاید
            موقعیت‌های مستقل خود را دارد.
          </p>
        </div>
        <div className="flex rounded-lg border border-[var(--border-subtle)] p-0.5">
          <Button
            type="button"
            size="sm"
            variant={viewport === 'desktop' ? 'default' : 'ghost'}
            className="h-8 px-3 text-xs"
            onClick={() => setViewport('desktop')}
          >
            دسکتاپ ({LENS_HERO_ARTBOARD.desktop.width}×{LENS_HERO_ARTBOARD.desktop.height})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={viewport === 'mobile' ? 'default' : 'ghost'}
            className="h-8 px-3 text-xs"
            onClick={() => setViewport('mobile')}
          >
            موبایل ({LENS_HERO_ARTBOARD.mobile.width}×{LENS_HERO_ARTBOARD.mobile.height})
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {hotspots.map((spot, index) => {
          const label = productLabels[index]?.trim() || `نقطه ${index + 1}`;
          const isSelected = selectedIndex === index;
          return (
            <button
              key={spot.id ?? `lens-editor-spot-${index}`}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs transition ${
                isSelected
                  ? 'border-[var(--primary)] bg-[var(--primary-muted)] text-foreground'
                  : 'border-[var(--border-subtle)] bg-[var(--surface)] text-muted hover:text-foreground'
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <span
                className="ml-1.5 inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: HOTSPOT_COLORS[index] ?? HOTSPOT_COLORS[0] }}
                aria-hidden
              />
              {label}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]/30 p-4">
        {viewport === 'mobile' ? (
          <p className="mb-3 text-xs text-muted">
            در موبایل فقط موقعیت دکمه + روی تصویر ذخیره می‌شود. کارت محصول بالای تصویر به‌صورت
            ثابت نمایش داده می‌شود.
          </p>
        ) : null}

        <div
          className="mx-auto w-full"
          style={{ maxWidth: `${artboard.width}px` }}
        >
          <div
            ref={canvasRef}
            className="relative mx-auto w-full select-none touch-none overflow-hidden bg-[#d9d9d9]"
            style={{
              aspectRatio: `${artboard.width} / ${artboard.height}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImageUrl}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />

            <span
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/20 to-black/20"
              aria-hidden
            />

            {hotspots.map((spot, index) => {
              const hotspotCoords = readHotspotCoords(spot, viewport);
              const chipCoords = readChipCoords(spot, viewport);
              const hotspotLeft = parseLensPosition(hotspotCoords.left, artboard.width, artboard.width / 2);
              const hotspotTop = parseLensPosition(hotspotCoords.top, artboard.height, artboard.height / 2);
              const chipLeft = parseLensPosition(chipCoords.left, artboard.width, hotspotLeft);
              const chipTop = parseLensPosition(chipCoords.top, artboard.height, hotspotTop - 40);
              const label = productLabels[index]?.trim() || `محصول ${index + 1}`;
              const imageUrl = productImages[index]?.trim();
              const isSelected = selectedIndex === index;
              const color = HOTSPOT_COLORS[index] ?? HOTSPOT_COLORS[0];
              const chipTranslateX = spot.chipTranslateX ?? DEFAULT_LENS_CHIP_TRANSLATE.x;
              const chipTranslateY = spot.chipTranslateY ?? DEFAULT_LENS_CHIP_TRANSLATE.y;

              return (
                <div key={spot.id ?? `lens-editor-layer-${index}`}>
                  <button
                    type="button"
                    className={`absolute z-20 flex h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] font-light leading-none transition ${
                      isSelected
                        ? 'border-white bg-white text-[#564739] shadow-md'
                        : 'border-white/90 bg-white/25 text-white'
                    }`}
                    style={{
                      left: `${(hotspotLeft / artboard.width) * 100}%`,
                      top: `${(hotspotTop / artboard.height) * 100}%`,
                      boxShadow: isSelected ? `0 0 0 3px ${color}55` : undefined,
                    }}
                    aria-label={`جابجایی نقطه ${index + 1}`}
                    onPointerDown={startDrag(index, 'hotspot')}
                  >
                    +
                  </button>

                  {viewport === 'desktop' ? (
                    <button
                      type="button"
                      className={`absolute z-10 box-border flex items-center gap-[3%] overflow-hidden rounded-sm border-0 bg-[#efe9e3] px-[3.5%] py-[9%] text-right shadow-sm transition ${
                        isSelected ? 'ring-2 ring-[var(--primary)]' : 'opacity-95'
                      }`}
                      style={{
                        left: `${(chipLeft / artboard.width) * 100}%`,
                        top: `${(chipTop / artboard.height) * 100}%`,
                        width: chipWidthPercent(viewport),
                        minHeight: chipHeightPercent(viewport),
                        transform: `translate(${chipTranslateX}, ${chipTranslateY})`,
                        direction: 'ltr',
                      }}
                      aria-label={`جابجایی کارت ${label}`}
                      onPointerDown={startDrag(index, 'chip')}
                    >
                      <span className="min-w-0 flex-1 text-[#564739]" dir="rtl">
                        <span className="block truncate text-[clamp(9px,1.8cqw,12px)] font-normal leading-tight">
                          {label}
                        </span>
                        <span className="mt-0.5 block text-[clamp(8px,1.6cqw,11px)] font-extralight text-[#6d5945]">
                          قیمت · وزن
                        </span>
                      </span>
                      <span
                        className="flex shrink-0 items-center justify-center overflow-hidden bg-[#d9cfc3]"
                        style={{
                          width: `${(LENS_SHOWCASE_CHIP.thumbWidth / LENS_SHOWCASE_CHIP.width) * 100}%`,
                          aspectRatio: `${LENS_SHOWCASE_CHIP.thumbWidth} / ${LENS_SHOWCASE_CHIP.thumbHeight}`,
                        }}
                      >
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt=""
                            draggable={false}
                            className="h-[80%] w-auto max-w-[85%] object-contain"
                          />
                        ) : null}
                      </span>
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted">
        ابعاد مرجع {viewport === 'desktop' ? 'دسکتاپ' : 'موبایل'}: {artboard.width}×
        {artboard.height} پیکسل — کارت محصول {LENS_SHOWCASE_CHIP.width}×{LENS_SHOWCASE_CHIP.height}{' '}
        (همان نسبت صفحه اصلی). مقادیر ذخیره‌شده با فروشگاه هماهنگ می‌مانند.
      </p>

      <button
        type="button"
        className="text-xs font-medium text-[var(--primary)] hover:underline"
        onClick={() => setShowAdvanced((value) => !value)}
      >
        {showAdvanced ? 'پنهان کردن تنظیمات دستی' : 'تنظیمات دستی (پیشرفته)'}
      </button>

      {showAdvanced ? (
        <div className="space-y-4">
          {hotspots.map((spot, index) => (
            <div
              key={spot.id ?? `lens-editor-fields-${index}`}
              className="grid gap-3 rounded-lg border border-[var(--border-subtle)] p-4 md:grid-cols-4"
            >
              <p className="md:col-span-4 text-xs font-medium text-foreground">
                نقطه {index + 1}
                {productLabels[index] ? ` — ${productLabels[index]}` : ''}
              </p>
              <Field
                label={viewport === 'desktop' ? 'عمودی (+)' : 'عمودی موبایل (+)'}
                value={readHotspotCoords(spot, viewport).top}
                onChange={(top) =>
                  updateSpot(
                    index,
                    writeHotspotCoords(spot, viewport, top, readHotspotCoords(spot, viewport).left),
                  )
                }
              />
              <Field
                label={viewport === 'desktop' ? 'افقی (+)' : 'افقی موبایل (+)'}
                value={readHotspotCoords(spot, viewport).left}
                onChange={(left) =>
                  updateSpot(
                    index,
                    writeHotspotCoords(spot, viewport, readHotspotCoords(spot, viewport).top, left),
                  )
                }
              />
              <Field
                label={viewport === 'desktop' ? 'عمودی کارت' : 'عمودی کارت موبایل'}
                value={readChipCoords(spot, viewport).top}
                onChange={(top) =>
                  updateSpot(
                    index,
                    writeChipCoords(spot, viewport, top, readChipCoords(spot, viewport).left),
                  )
                }
              />
              <Field
                label={viewport === 'desktop' ? 'افقی کارت' : 'افقی کارت موبایل'}
                value={readChipCoords(spot, viewport).left}
                onChange={(left) =>
                  updateSpot(
                    index,
                    writeChipCoords(spot, viewport, readChipCoords(spot, viewport).top, left),
                  )
                }
              />
              <Field
                label="ترجمه X کارت"
                value={spot.chipTranslateX ?? ''}
                onChange={(chipTranslateX) => updateSpot(index, { chipTranslateX })}
                placeholder={DEFAULT_LENS_CHIP_TRANSLATE.x}
              />
              <Field
                label="ترجمه Y کارت"
                value={spot.chipTranslateY ?? ''}
                onChange={(chipTranslateY) => updateSpot(index, { chipTranslateY })}
                placeholder={DEFAULT_LENS_CHIP_TRANSLATE.y}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-[11px]">{label}</Label>
      <input
        className="mt-1 h-9 w-full rounded-md border border-[var(--border-subtle)] bg-background px-2 text-xs text-foreground"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        dir="ltr"
      />
    </div>
  );
}
