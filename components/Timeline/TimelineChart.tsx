'use client'
import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { HistoricalFigure } from '@/types'
import { getCategoryColor, ERAS, formatYear } from '@/lib/timelineUtils'

const MIN_YEAR = -4000
const MAX_YEAR = 2026
const ROW_HEIGHT = 36
const BAR_HEIGHT = 18
const AXIS_HEIGHT = 52
const LABEL_WIDTH = 176
const ERA_LABEL_Y = 14
const FIT_PADDING_RATIO = 0.18
const FIT_PADDING_MIN = 80

interface Props {
  figures: HistoricalFigure[]
  onHover: (fig: HistoricalFigure | null) => void
  onYearClick: (year: number) => void
  onSelectFigure: (fig: HistoricalFigure) => void
}

export default function TimelineChart({ figures, onHover, onYearClick, onSelectFigure }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const drawRef = useRef<() => void>(() => {})
  const prevFigureCountRef = useRef(0)

  // Each figure occupies its own dedicated row (by insertion order) — no packing
  const getRow = useCallback((figId: number) => {
    return figures.findIndex(f => f.id === figId)
  }, [figures])

  const chartHeight = Math.max(figures.length * ROW_HEIGHT + AXIS_HEIGHT + 48, 280)

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    if (!container) return
    const totalWidth = container.clientWidth
    const innerW = totalWidth - LABEL_WIDTH
    if (innerW <= 0) return

    const xBase = d3.scaleLinear()
      .domain([MIN_YEAR, MAX_YEAR])
      .range([0, innerW])

    const t = transformRef.current
    const xScaled = t.rescaleX(xBase)

    svg.attr('width', totalWidth).attr('height', chartHeight)
    svg.selectAll('*').remove()

    // ── Background ──────────────────────────────────────────────────────────
    svg.append('rect')
      .attr('width', totalWidth).attr('height', chartHeight)
      .attr('fill', '#0a0a0f')

    const chart = svg.append('g').attr('transform', `translate(${LABEL_WIDTH},0)`)

    // ── Era bands ────────────────────────────────────────────────────────────
    const eraBands = chart.append('g')
    for (const era of ERAS) {
      const x1 = xScaled(era.startYear)
      const x2 = xScaled(era.endYear)
      if (x2 < 0 || x1 > innerW) continue
      const bx = Math.max(0, x1)
      const bw = Math.min(innerW, x2) - bx
      eraBands.append('rect')
        .attr('x', bx).attr('y', AXIS_HEIGHT)
        .attr('width', bw).attr('height', chartHeight - AXIS_HEIGHT)
        .attr('fill', era.color).attr('opacity', era.opacity)
      if (bw > 56) {
        eraBands.append('text')
          .attr('x', bx + bw / 2).attr('y', ERA_LABEL_Y)
          .attr('text-anchor', 'middle')
          .attr('fill', era.color).attr('opacity', 0.6)
          .attr('font-size', '9px')
          .attr('font-family', 'DM Mono, monospace')
          .attr('letter-spacing', '0.1em')
          .text(era.name.toUpperCase())
      }
    }

    // ── Grid lines ───────────────────────────────────────────────────────────
    const gridG = chart.append('g')
    for (const tick of xScaled.ticks(12)) {
      const x = xScaled(tick)
      gridG.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', AXIS_HEIGHT).attr('y2', chartHeight)
        .attr('stroke', 'rgba(255,255,255,0.04)')
        .attr('stroke-width', 1)
    }

    // ── Row separator lines ──────────────────────────────────────────────────
    for (let i = 0; i < figures.length; i++) {
      const y = AXIS_HEIGHT + i * ROW_HEIGHT
      chart.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', 'rgba(255,255,255,0.03)')
        .attr('stroke-width', 1)
    }

    // ── Axis ─────────────────────────────────────────────────────────────────
    const axisG = chart.append('g').attr('transform', `translate(0,${AXIS_HEIGHT - 2})`)
    const axis = d3.axisBottom(xScaled)
      .ticks(12)
      .tickFormat(d => {
        const y = d as number
        return y < 0 ? `${Math.abs(y)} aC` : `${y}`
      })
    axisG.call(axis)
    axisG.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)')
    axisG.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)')
    axisG.selectAll('.tick text')
      .attr('fill', 'rgba(255,255,255,0.35)')
      .attr('font-size', '10px')
      .attr('font-family', 'DM Mono, monospace')
      .attr('y', 10)

    // Clickable axis overlay
    chart.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', AXIS_HEIGHT)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .attr('title', 'Clic para ver quién vivía en ese año')
      .on('click', (event: MouseEvent) => {
        const [mx] = d3.pointer(event)
        onYearClick(Math.round(xScaled.invert(mx)))
      })

    // Year indicator line on hover over axis
    const axisOverlay = chart.append('g').attr('opacity', 0)
    const hoverLine = axisOverlay.append('line')
      .attr('y1', 0).attr('y2', chartHeight)
      .attr('stroke', 'rgba(99,102,241,0.4)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
    const hoverLabel = axisOverlay.append('text')
      .attr('y', AXIS_HEIGHT - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#818cf8')
      .attr('font-size', '9px')
      .attr('font-family', 'DM Mono, monospace')

    chart.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', chartHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event)
        const year = Math.round(xScaled.invert(mx))
        hoverLine.attr('x1', mx).attr('x2', mx)
        hoverLabel.attr('x', mx).text(year < 0 ? `${Math.abs(year)} a.C.` : year)
        axisOverlay.attr('opacity', 1)
      })
      .on('mouseleave', () => axisOverlay.attr('opacity', 0))

    // ── Bars ─────────────────────────────────────────────────────────────────
    const barsG = chart.append('g')
    for (const figure of figures) {
      const row = getRow(figure.id)
      if (row < 0) continue
      const color = getCategoryColor(figure.category)
      const x1 = xScaled(figure.birthYear)
      const x2 = xScaled(figure.deathYear)
      const barW = Math.max(x2 - x1, 3)
      const y = AXIS_HEIGHT + row * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2

      // Skip bars fully out of view
      if (x2 < 0 || x1 > innerW) {
        // Still render a "out of view" indicator
        const side = x1 > innerW ? innerW - 6 : 0
        const arrow = x1 > innerW ? '›' : '‹'
        barsG.append('text')
          .attr('x', side + (x1 > innerW ? 4 : -4)).attr('y', y + BAR_HEIGHT / 2 + 4)
          .attr('fill', color).attr('opacity', 0.5)
          .attr('font-size', '10px').attr('text-anchor', 'middle')
          .text(arrow)
        continue
      }

      const barG = barsG.append('g')
        .attr('class', 'bar-group')
        .attr('cursor', 'pointer')

      // Glow backing
      barG.append('rect')
        .attr('x', Math.max(x1 - 2, 0)).attr('y', y - 4)
        .attr('width', Math.min(barW + 4, innerW - Math.max(x1, 0))).attr('height', BAR_HEIGHT + 8)
        .attr('rx', 5).attr('fill', color).attr('opacity', 0.08)

      // Main bar
      const clipX = Math.max(x1, 0)
      const clipW = Math.min(x2, innerW) - clipX
      barG.append('rect')
        .attr('x', clipX).attr('y', y)
        .attr('width', Math.max(clipW, 0)).attr('height', BAR_HEIGHT)
        .attr('rx', 3)
        .attr('fill', color).attr('opacity', 0.82)

      // Top highlight
      barG.append('rect')
        .attr('x', clipX).attr('y', y)
        .attr('width', Math.max(clipW, 0)).attr('height', BAR_HEIGHT * 0.35)
        .attr('rx', 3)
        .attr('fill', 'rgba(255,255,255,0.14)')

      // Birth dot
      if (x1 >= 0 && x1 <= innerW) {
        barG.append('circle')
          .attr('cx', x1).attr('cy', y + BAR_HEIGHT / 2)
          .attr('r', 3.5).attr('fill', 'white').attr('opacity', 0.85)
      }

      // Death dot
      if (x2 >= 0 && x2 <= innerW) {
        barG.append('circle')
          .attr('cx', x2).attr('cy', y + BAR_HEIGHT / 2)
          .attr('r', 2.5).attr('fill', 'white').attr('opacity', 0.35)
      }

      // Invisible hit area (full row height)
      barG.append('rect')
        .attr('x', Math.max(x1 - 2, 0)).attr('y', AXIS_HEIGHT + row * ROW_HEIGHT)
        .attr('width', Math.max(clipW + 4, 4)).attr('height', ROW_HEIGHT)
        .attr('fill', 'transparent')
        .on('mouseenter', () => onHover(figure))
        .on('mouseleave', () => onHover(null))
        .on('click', () => onSelectFigure(figure))
    }

    // ── Left label panel ─────────────────────────────────────────────────────
    // Separator line
    svg.append('line')
      .attr('x1', LABEL_WIDTH - 1).attr('x2', LABEL_WIDTH - 1)
      .attr('y1', AXIS_HEIGHT).attr('y2', chartHeight)
      .attr('stroke', 'rgba(255,255,255,0.06)')
      .attr('stroke-width', 1)

    const labelsG = svg.append('g')

    // One label per figure, each in its own dedicated row — no overlapping
    figures.forEach((figure, i) => {
      const color = getCategoryColor(figure.category)
      const rowY = AXIS_HEIGHT + i * ROW_HEIGHT
      const centerY = rowY + ROW_HEIGHT / 2

      // Row background on hover (invisible by default)
      labelsG.append('rect')
        .attr('x', 0).attr('y', rowY)
        .attr('width', LABEL_WIDTH - 2).attr('height', ROW_HEIGHT)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', function () {
          d3.select(this).attr('fill', 'rgba(255,255,255,0.04)')
          onHover(figure)
        })
        .on('mouseleave', function () {
          d3.select(this).attr('fill', 'transparent')
          onHover(null)
        })
        .on('click', () => onSelectFigure(figure))

      // Category dot
      labelsG.append('circle')
        .attr('cx', 10).attr('cy', centerY)
        .attr('r', 4)
        .attr('fill', color)
        .attr('style', `filter: drop-shadow(0 0 3px ${color})`)

      // Name
      const displayName = figure.name.length > 20 ? figure.name.slice(0, 19) + '…' : figure.name
      labelsG.append('text')
        .attr('x', 22).attr('y', centerY - 3)
        .attr('fill', 'rgba(255,255,255,0.80)')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('dominant-baseline', 'middle')
        .text(displayName)

      // Years
      const yearStr = `${figure.birthYear < 0 ? Math.abs(figure.birthYear) + ' aC' : figure.birthYear} – ${figure.deathYear < 0 ? Math.abs(figure.deathYear) + ' aC' : figure.deathYear}`
      labelsG.append('text')
        .attr('x', 22).attr('y', centerY + 10)
        .attr('fill', 'rgba(255,255,255,0.28)')
        .attr('font-size', '9px')
        .attr('font-family', 'DM Mono, monospace')
        .text(yearStr)
    })

    // ── Empty state ──────────────────────────────────────────────────────────
    if (figures.length === 0) {
      svg.append('text')
        .attr('x', totalWidth / 2).attr('y', chartHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.15)')
        .attr('font-size', '13px')
        .attr('font-family', 'DM Sans, sans-serif')
        .text('Busca un personaje histórico para añadirlo al timeline')
    }
  }, [figures, chartHeight, getRow, onHover, onYearClick, onSelectFigure])

  // Keep drawRef always current (avoids stale closures in zoom handler)
  useEffect(() => { drawRef.current = draw }, [draw])

  // Set up zoom ONCE
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 50])
      .on('zoom', (event) => {
        transformRef.current = event.transform
        drawRef.current()
      })
    d3.select<SVGSVGElement, unknown>(el).call(zoom)
    zoomRef.current = zoom
  }, [])

  // Redraw whenever figures or dimensions change
  useEffect(() => { draw() }, [draw])

  // Auto-fit: when a NEW figure is added, animate the view to show all figures
  useEffect(() => {
    if (figures.length === 0) {
      prevFigureCountRef.current = 0
      return
    }
    // Only fire when count increases (figure added, not removed or reordered)
    if (figures.length <= prevFigureCountRef.current) {
      prevFigureCountRef.current = figures.length
      return
    }
    prevFigureCountRef.current = figures.length

    const el = svgRef.current
    const container = containerRef.current
    if (!el || !container || !zoomRef.current) return

    const innerW = container.clientWidth - LABEL_WIDTH
    if (innerW <= 0) return

    const minYear = Math.min(...figures.map(f => f.birthYear))
    const maxYear = Math.max(...figures.map(f => f.deathYear))
    const span = Math.max(maxYear - minYear, 10)
    const padding = Math.max(span * FIT_PADDING_RATIO, FIT_PADDING_MIN)
    const visStart = Math.max(minYear - padding, MIN_YEAR - 50)
    const visEnd = Math.min(maxYear + padding, MAX_YEAR + 50)
    const visRange = visEnd - visStart
    const totalRange = MAX_YEAR - MIN_YEAR

    const k = Math.min(Math.max(totalRange / visRange, 0.2), 50)
    const tx = -((visStart - MIN_YEAR) / totalRange) * innerW * k

    const newTransform = d3.zoomIdentity.translate(tx, 0).scale(k)

    d3.select<SVGSVGElement, unknown>(el)
      .transition()
      .duration(700)
      .ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, newTransform)

  }, [figures]) // eslint-disable-line react-hooks/exhaustive-deps

  // Resize observer
  useEffect(() => {
    const ro = new ResizeObserver(() => drawRef.current())
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: 280 }}>
      <svg
        ref={svgRef}
        style={{ display: 'block', cursor: 'grab', userSelect: 'none' }}
      />
    </div>
  )
}
