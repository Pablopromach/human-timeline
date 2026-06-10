'use client'
import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import { HistoricalFigure, Civilization } from '@/types'
import { getCategoryColor, ERAS, formatYear } from '@/lib/timelineUtils'

const MIN_YEAR = -4000
const MAX_YEAR = 2026
const AXIS_HEIGHT = 56
const LABEL_WIDTH = 200
const MIN_ROW_HEIGHT = 44
const MAX_ROW_HEIGHT = 84
const TOP_PADDING = 8

interface Props {
  figures: HistoricalFigure[]
  civilizations?: Civilization[]
  onHover: (fig: HistoricalFigure | null) => void
  onYearClick: (year: number) => void
  onSelectFigure: (fig: HistoricalFigure) => void
}

const CIV_BAR_HEIGHT = 16
const CIV_TRACK_GAP = 4

export default function TimelineChart({ figures, civilizations = [], onHover, onYearClick, onSelectFigure }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity)
  const drawRef = useRef<() => void>(() => {})
  const prevFigureCountRef = useRef(0)

  const getRow = useCallback(
    (figId: number) => figures.findIndex(f => f.id === figId),
    [figures]
  )

  // Pack civilizations into non-overlapping tracks (greedy)
  const civTracks = (() => {
    if (civilizations.length === 0) return [] as Array<{ civ: Civilization; track: number }>
    const sorted = [...civilizations].sort((a, b) => a.startYear - b.startYear)
    const trackEnds: number[] = []
    return sorted.map(civ => {
      let track = trackEnds.findIndex(end => end < civ.startYear)
      if (track === -1) { track = trackEnds.length; trackEnds.push(civ.endYear) }
      else trackEnds[track] = civ.endYear
      return { civ, track }
    })
  })()
  const civRowCount = civTracks.length > 0 ? Math.max(...civTracks.map(c => c.track)) + 1 : 0
  const civBandHeight = civRowCount > 0 ? civRowCount * (CIV_BAR_HEIGHT + CIV_TRACK_GAP) + 12 : 0

  const draw = useCallback(() => {
    const svg = d3.select(svgRef.current)
    const container = containerRef.current
    if (!container) return

    const totalWidth = container.clientWidth
    const containerH = Math.max(container.clientHeight, 360)
    const innerW = totalWidth - LABEL_WIDTH
    if (innerW <= 0) return

    // Dynamic row height: fill available space, capped between MIN/MAX
    const figureRows = Math.max(figures.length, 1)
    const availForRows = containerH - AXIS_HEIGHT - civBandHeight - TOP_PADDING - 20
    let rowH = figures.length > 0
      ? Math.max(MIN_ROW_HEIGHT, Math.min(MAX_ROW_HEIGHT, availForRows / figureRows))
      : MIN_ROW_HEIGHT
    const barH = Math.round(rowH * 0.42)

    const figureBlockH = figures.length * rowH
    const computedH = AXIS_HEIGHT + civBandHeight + TOP_PADDING + figureBlockH + 20
    const chartHeight = Math.max(computedH, containerH)

    const xBase = d3.scaleLinear().domain([MIN_YEAR, MAX_YEAR]).range([0, innerW])
    const xScaled = transformRef.current.rescaleX(xBase)

    svg.attr('width', totalWidth).attr('height', chartHeight)
    svg.selectAll('*').remove()

    // ── Background gradient ─────────────────────────────────────────────────
    const bg = svg.append('defs').append('linearGradient')
      .attr('id', 'bg-gradient').attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
    bg.append('stop').attr('offset', '0%').attr('stop-color', '#0a0a0f')
    bg.append('stop').attr('offset', '100%').attr('stop-color', '#0d0d18')

    svg.append('rect')
      .attr('width', totalWidth).attr('height', chartHeight)
      .attr('fill', 'url(#bg-gradient)')

    const chart = svg.append('g').attr('transform', `translate(${LABEL_WIDTH},0)`)
    const bodyTop = AXIS_HEIGHT + civBandHeight + TOP_PADDING

    // ── Era bands (subtle background colors per era) ────────────────────────
    const eraBands = chart.append('g')
    for (const era of ERAS) {
      const x1 = xScaled(era.startYear)
      const x2 = xScaled(era.endYear)
      if (x2 < 0 || x1 > innerW) continue
      const bx = Math.max(0, x1)
      const bw = Math.min(innerW, x2) - bx
      eraBands.append('rect')
        .attr('x', bx).attr('y', bodyTop)
        .attr('width', bw).attr('height', chartHeight - bodyTop)
        .attr('fill', era.color).attr('opacity', era.opacity * 0.8)
      if (bw > 70) {
        eraBands.append('text')
          .attr('x', bx + bw / 2).attr('y', 18)
          .attr('text-anchor', 'middle')
          .attr('fill', era.color).attr('opacity', 0.75)
          .attr('font-size', '11px')
          .attr('font-family', 'DM Mono, monospace')
          .attr('font-weight', '500')
          .attr('letter-spacing', '0.12em')
          .text(era.name.toUpperCase())
      }
    }

    // ── Grid lines (every tick) ──────────────────────────────────────────────
    const gridG = chart.append('g')
    for (const tick of xScaled.ticks(12)) {
      const x = xScaled(tick)
      gridG.append('line')
        .attr('x1', x).attr('x2', x)
        .attr('y1', bodyTop).attr('y2', chartHeight)
        .attr('stroke', tick === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)')
        .attr('stroke-width', tick === 0 ? 1.5 : 1)
    }

    // ── Civilization bands ──────────────────────────────────────────────────
    if (civTracks.length > 0) {
      const civG = chart.append('g')
      for (const { civ, track } of civTracks) {
        const x1 = xScaled(civ.startYear)
        const x2 = xScaled(civ.endYear)
        const cx1 = Math.max(x1, 0)
        const cx2 = Math.min(x2, innerW)
        const cw = cx2 - cx1
        if (cw <= 0) continue
        const y = AXIS_HEIGHT + 6 + track * (CIV_BAR_HEIGHT + CIV_TRACK_GAP)
        const g = civG.append('g')
        g.append('rect')
          .attr('x', cx1).attr('y', y)
          .attr('width', cw).attr('height', CIV_BAR_HEIGHT)
          .attr('rx', 3)
          .attr('fill', civ.color).attr('opacity', 0.22)
        g.append('rect')
          .attr('x', cx1).attr('y', y)
          .attr('width', cw).attr('height', CIV_BAR_HEIGHT)
          .attr('rx', 3)
          .attr('fill', 'none')
          .attr('stroke', civ.color).attr('stroke-opacity', 0.6)
          .attr('stroke-width', 1)
        if (cw > 80) {
          g.append('text')
            .attr('x', cx1 + 8).attr('y', y + CIV_BAR_HEIGHT / 2 + 4)
            .attr('fill', civ.color)
            .attr('font-size', '11px')
            .attr('font-weight', '600')
            .attr('font-family', 'DM Sans, sans-serif')
            .text(civ.name)
        }
      }
    }

    // ── Row separator lines ──────────────────────────────────────────────────
    for (let i = 0; i <= figures.length; i++) {
      const y = bodyTop + i * rowH
      if (y > chartHeight) break
      chart.append('line')
        .attr('x1', 0).attr('x2', innerW)
        .attr('y1', y).attr('y2', y)
        .attr('stroke', 'rgba(255,255,255,0.04)')
        .attr('stroke-width', 1)
    }

    // ── Axis ─────────────────────────────────────────────────────────────────
    // Background strip behind axis for legibility
    chart.append('rect')
      .attr('x', 0).attr('y', AXIS_HEIGHT - 24)
      .attr('width', innerW).attr('height', 24)
      .attr('fill', 'rgba(10,10,15,0.7)')

    const axisG = chart.append('g').attr('transform', `translate(0,${AXIS_HEIGHT - 2})`)
    const axis = d3.axisBottom(xScaled)
      .ticks(12)
      .tickFormat(d => {
        const y = d as number
        return y < 0 ? `${Math.abs(y)} a.C.` : `${y}`
      })
    axisG.call(axis)
    axisG.select('.domain').attr('stroke', 'rgba(255,255,255,0.16)')
    axisG.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.16)')
    axisG.selectAll('.tick text')
      .attr('fill', 'rgba(255,255,255,0.62)')
      .attr('font-size', '12px')
      .attr('font-family', 'DM Mono, monospace')
      .attr('font-weight', '500')
      .attr('y', 14)

    // Axis click overlay
    chart.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', AXIS_HEIGHT)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('click', (event: MouseEvent) => {
        const [mx] = d3.pointer(event)
        onYearClick(Math.round(xScaled.invert(mx)))
      })

    // ── Year indicator line on hover ─────────────────────────────────────────
    const hoverG = chart.append('g').attr('opacity', 0).style('pointer-events', 'none')
    const hoverLine = hoverG.append('line')
      .attr('y1', bodyTop - 8).attr('y2', chartHeight)
      .attr('stroke', 'rgba(165,180,252,0.55)')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,3')
    const hoverPill = hoverG.append('rect')
      .attr('y', bodyTop - 22).attr('height', 18)
      .attr('rx', 9)
      .attr('fill', 'rgba(99,102,241,0.95)')
    const hoverText = hoverG.append('text')
      .attr('y', bodyTop - 9)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .attr('font-family', 'DM Mono, monospace')

    chart.append('rect')
      .attr('x', 0).attr('y', 0)
      .attr('width', innerW).attr('height', chartHeight)
      .attr('fill', 'transparent')
      .on('mousemove', (event: MouseEvent) => {
        const [mx] = d3.pointer(event)
        const year = Math.round(xScaled.invert(mx))
        const label = year < 0 ? `${Math.abs(year)} a.C.` : `${year}`
        hoverLine.attr('x1', mx).attr('x2', mx)
        hoverText.attr('x', mx).text(label)
        const textWidth = label.length * 7 + 18
        hoverPill.attr('x', mx - textWidth / 2).attr('width', textWidth)
        hoverG.attr('opacity', 1)
      })
      .on('mouseleave', () => hoverG.attr('opacity', 0))

    // ── Bars ─────────────────────────────────────────────────────────────────
    const barsG = chart.append('g')
    for (const figure of figures) {
      const row = getRow(figure.id)
      if (row < 0) continue
      const color = getCategoryColor(figure.category)
      const x1 = xScaled(figure.birthYear)
      const x2 = xScaled(figure.deathYear)
      const barW = Math.max(x2 - x1, 4)
      const y = bodyTop + row * rowH + (rowH - barH) / 2

      if (x2 < 0 || x1 > innerW) {
        // Off-screen indicator
        const isLeft = x2 < 0
        const ax = isLeft ? 8 : innerW - 8
        const arrow = isLeft ? '◀' : '▶'
        barsG.append('text')
          .attr('x', ax).attr('y', y + barH / 2 + 4)
          .attr('text-anchor', 'middle').attr('fill', color)
          .attr('opacity', 0.6).attr('font-size', '12px')
          .text(arrow)
        continue
      }

      const barG = barsG.append('g').attr('cursor', 'pointer')

      const clipX = Math.max(x1, 0)
      const clipW = Math.min(x2, innerW) - clipX
      if (clipW < 0) continue

      // Glow
      barG.append('rect')
        .attr('x', clipX).attr('y', y - 5)
        .attr('width', clipW).attr('height', barH + 10)
        .attr('rx', 6).attr('fill', color).attr('opacity', 0.12)

      // Main bar
      barG.append('rect')
        .attr('x', clipX).attr('y', y)
        .attr('width', clipW).attr('height', barH)
        .attr('rx', 4)
        .attr('fill', color).attr('opacity', 0.88)

      // Top highlight
      barG.append('rect')
        .attr('x', clipX).attr('y', y)
        .attr('width', clipW).attr('height', barH * 0.35)
        .attr('rx', 4)
        .attr('fill', 'rgba(255,255,255,0.18)')

      // Birth dot
      if (x1 >= 0 && x1 <= innerW) {
        barG.append('circle')
          .attr('cx', x1).attr('cy', y + barH / 2)
          .attr('r', 5).attr('fill', 'white').attr('opacity', 0.95)
        barG.append('circle')
          .attr('cx', x1).attr('cy', y + barH / 2)
          .attr('r', 2.5).attr('fill', color)
      }
      // Death dot
      if (x2 >= 0 && x2 <= innerW) {
        barG.append('circle')
          .attr('cx', x2).attr('cy', y + barH / 2)
          .attr('r', 3).attr('fill', 'white').attr('opacity', 0.5)
      }

      // Year labels inside/next to bar when zoomed enough
      if (clipW > 60) {
        const lifeSpan = figure.deathYear - figure.birthYear
        const birthLabel = figure.birthYear < 0 ? `${Math.abs(figure.birthYear)}aC` : `${figure.birthYear}`
        const deathLabel = figure.deathYear < 0 ? `${Math.abs(figure.deathYear)}aC` : `${figure.deathYear}`
        if (clipW > 140) {
          barG.append('text')
            .attr('x', clipX + 8).attr('y', y + barH / 2 + 4)
            .attr('fill', 'white').attr('opacity', 0.95)
            .attr('font-size', '11px')
            .attr('font-family', 'DM Mono, monospace')
            .attr('font-weight', '600')
            .text(`${birthLabel} → ${deathLabel}`)
        } else {
          barG.append('text')
            .attr('x', clipX + clipW / 2).attr('y', y + barH / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', 'white').attr('opacity', 0.9)
            .attr('font-size', '10px')
            .attr('font-family', 'DM Mono, monospace')
            .attr('font-weight', '600')
            .text(`${lifeSpan}a`)
        }
      }

      // Hit area
      barG.append('rect')
        .attr('x', clipX - 4).attr('y', bodyTop + row * rowH)
        .attr('width', clipW + 8).attr('height', rowH)
        .attr('fill', 'transparent')
        .on('mouseenter', () => onHover(figure))
        .on('mouseleave', () => onHover(null))
        .on('click', () => onSelectFigure(figure))
    }

    // ── Left labels panel ────────────────────────────────────────────────────
    // Dark background panel
    svg.append('rect')
      .attr('x', 0).attr('y', AXIS_HEIGHT + civBandHeight)
      .attr('width', LABEL_WIDTH).attr('height', chartHeight - AXIS_HEIGHT - civBandHeight)
      .attr('fill', '#0b0b14').attr('opacity', 0.85)

    // Separator
    svg.append('line')
      .attr('x1', LABEL_WIDTH - 0.5).attr('x2', LABEL_WIDTH - 0.5)
      .attr('y1', AXIS_HEIGHT + civBandHeight).attr('y2', chartHeight)
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1)

    // Civilizations track label
    if (civBandHeight > 0) {
      svg.append('text')
        .attr('x', LABEL_WIDTH - 12).attr('y', AXIS_HEIGHT + civBandHeight / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', 'rgba(255,255,255,0.42)')
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('font-family', 'DM Mono, monospace')
        .attr('letter-spacing', '0.12em')
        .text('CIVILIZACIONES')
    }

    // Header chips
    svg.append('text')
      .attr('x', 14).attr('y', AXIS_HEIGHT - 8)
      .attr('fill', 'rgba(255,255,255,0.4)')
      .attr('font-size', '10px')
      .attr('font-weight', '600')
      .attr('font-family', 'DM Mono, monospace')
      .attr('letter-spacing', '0.15em')
      .text('PERSONAJE')

    const labelsG = svg.append('g')
    figures.forEach((figure, i) => {
      const color = getCategoryColor(figure.category)
      const rowY = bodyTop + i * rowH
      const centerY = rowY + rowH / 2

      // Row hit
      labelsG.append('rect')
        .attr('x', 0).attr('y', rowY)
        .attr('width', LABEL_WIDTH - 1).attr('height', rowH)
        .attr('fill', 'transparent')
        .attr('cursor', 'pointer')
        .on('mouseenter', function () {
          d3.select(this).attr('fill', 'rgba(255,255,255,0.05)')
          onHover(figure)
        })
        .on('mouseleave', function () {
          d3.select(this).attr('fill', 'transparent')
          onHover(null)
        })
        .on('click', () => onSelectFigure(figure))

      // Color stripe on left edge
      labelsG.append('rect')
        .attr('x', 0).attr('y', rowY + 4)
        .attr('width', 3).attr('height', rowH - 8)
        .attr('rx', 1.5)
        .attr('fill', color)

      // Color dot with glow
      labelsG.append('circle')
        .attr('cx', 18).attr('cy', centerY - (rowH > 60 ? 6 : 0))
        .attr('r', 5).attr('fill', color)
        .attr('style', `filter: drop-shadow(0 0 4px ${color}aa)`)

      // Name
      const maxNameLen = rowH > 60 ? 22 : 24
      const displayName = figure.name.length > maxNameLen
        ? figure.name.slice(0, maxNameLen - 1) + '…'
        : figure.name
      labelsG.append('text')
        .attr('x', 32)
        .attr('y', centerY + (rowH > 60 ? -4 : -2))
        .attr('fill', 'rgba(255,255,255,0.94)')
        .attr('font-size', rowH > 60 ? '13.5px' : '12.5px')
        .attr('font-weight', '600')
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('dominant-baseline', 'middle')
        .text(displayName)

      // Years
      const yrStr = `${figure.birthYear < 0 ? Math.abs(figure.birthYear) + ' aC' : figure.birthYear} – ${figure.deathYear < 0 ? Math.abs(figure.deathYear) + ' aC' : figure.deathYear}`
      labelsG.append('text')
        .attr('x', 32).attr('y', centerY + (rowH > 60 ? 13 : 11))
        .attr('fill', 'rgba(255,255,255,0.45)')
        .attr('font-size', '10.5px')
        .attr('font-family', 'DM Mono, monospace')
        .attr('dominant-baseline', 'middle')
        .text(yrStr)

      // Category (only if row is tall enough)
      if (rowH > 60) {
        labelsG.append('text')
          .attr('x', 32).attr('y', centerY + 28)
          .attr('fill', color).attr('opacity', 0.7)
          .attr('font-size', '9.5px')
          .attr('font-weight', '600')
          .attr('font-family', 'DM Mono, monospace')
          .attr('letter-spacing', '0.06em')
          .attr('dominant-baseline', 'middle')
          .text(figure.category.toUpperCase())
      }
    })

    // ── Empty state ──────────────────────────────────────────────────────────
    if (figures.length === 0) {
      const cx = totalWidth / 2
      const cy = chartHeight / 2
      svg.append('text')
        .attr('x', cx).attr('y', cy - 8)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.22)')
        .attr('font-size', '15px')
        .attr('font-family', 'DM Sans, sans-serif')
        .text('Busca un personaje histórico para comenzar')
      svg.append('text')
        .attr('x', cx).attr('y', cy + 14)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(255,255,255,0.14)')
        .attr('font-size', '11px')
        .attr('font-family', 'DM Mono, monospace')
        .attr('letter-spacing', '0.1em')
        .text('USA LA BARRA DE BÚSQUEDA ARRIBA')
    }
  }, [figures, getRow, onHover, onYearClick, onSelectFigure, civTracks, civBandHeight])

  useEffect(() => { drawRef.current = draw }, [draw])

  // Set up zoom ONCE
  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 50])
      .filter((event) => {
        // Allow wheel always, but only drag with non-modifier left-click
        if (event.type === 'wheel') return true
        return !event.ctrlKey && !event.button
      })
      .on('zoom', (event) => {
        transformRef.current = event.transform
        drawRef.current()
      })
    d3.select<SVGSVGElement, unknown>(el).call(zoom)
    zoomRef.current = zoom
  }, [])

  useEffect(() => { draw() }, [draw])

  // Auto-fit when new figure added
  useEffect(() => {
    if (figures.length === 0) { prevFigureCountRef.current = 0; return }
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
    const padding = Math.max(span * 0.18, 80)
    const visStart = Math.max(minYear - padding, MIN_YEAR - 50)
    const visEnd = Math.min(maxYear + padding, MAX_YEAR + 50)
    const visRange = visEnd - visStart
    const totalRange = MAX_YEAR - MIN_YEAR
    const k = Math.min(Math.max(totalRange / visRange, 0.2), 50)
    const tx = -((visStart - MIN_YEAR) / totalRange) * innerW * k
    const newTransform = d3.zoomIdentity.translate(tx, 0).scale(k)

    d3.select<SVGSVGElement, unknown>(el)
      .transition().duration(700).ease(d3.easeCubicInOut)
      .call(zoomRef.current.transform, newTransform)
  }, [figures])

  // On resize, preserve the visible window center by scaling tx proportionally
  const prevInnerWRef = useRef(0)
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      const container = containerRef.current
      const el = svgRef.current
      if (!container || !el) return
      const newInnerW = container.clientWidth - LABEL_WIDTH
      const prevInnerW = prevInnerWRef.current
      if (prevInnerW > 0 && newInnerW > 0 && Math.abs(prevInnerW - newInnerW) > 1) {
        const t = transformRef.current
        const ratio = newInnerW / prevInnerW
        const adjusted = d3.zoomIdentity.translate(t.x * ratio, 0).scale(t.k)
        transformRef.current = adjusted
        // Sync d3's internal __zoom so future zoom events build on this
        ;(el as unknown as { __zoom: d3.ZoomTransform }).__zoom = adjusted
      }
      prevInnerWRef.current = newInnerW
      drawRef.current()
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: 360 }}
    >
      <svg
        ref={svgRef}
        style={{ display: 'block', cursor: 'grab', userSelect: 'none' }}
      />
    </div>
  )
}
