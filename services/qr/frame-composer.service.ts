import type { QrFrameSettings } from '~/types/design'

/**
 * Échappe les caractères spéciaux XML pour prévenir toute injection ou erreur de parsing SVG.
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Extrait la largeur et la hauteur intrinsèques d'une chaîne SVG.
 */
function extractSvgDimensions(sourceSvg: string): { width: number; height: number } {
  const widthMatch = sourceSvg.match(/\bwidth=["'](\d+(?:\.\d+)?)(?:px)?["']/i)
  const heightMatch = sourceSvg.match(/\bheight=["'](\d+(?:\.\d+)?)(?:px)?["']/i)

  if (widthMatch?.[1] && heightMatch?.[1]) {
    return {
      width: Math.round(parseFloat(widthMatch[1])),
      height: Math.round(parseFloat(heightMatch[1]))
    }
  }

  const viewBoxMatch = sourceSvg.match(/\bviewBox=["'][\d.\s-]+?\s+[\d.\s-]+?\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/i)
  if (viewBoxMatch?.[1] && viewBoxMatch?.[2]) {
    return {
      width: Math.round(parseFloat(viewBoxMatch[1])),
      height: Math.round(parseFloat(viewBoxMatch[2]))
    }
  }

  return { width: 300, height: 300 }
}

/**
 * Service de composition graphique de cadres autour des QR codes
 * Exécutable côté client sans dépendance externe
 */
export class FrameComposerService {
  /**
   * Calcule les dimensions de la composition selon le style de cadre
   */
  public static calculateDimensions(
    qrWidth: number,
    qrHeight: number,
    frame: QrFrameSettings
  ): { totalWidth: number; totalHeight: number; qrOffsetX: number; qrOffsetY: number } {
    if (frame.type === 'none') {
      return { totalWidth: qrWidth, totalHeight: qrHeight, qrOffsetX: 0, qrOffsetY: 0 }
    }

    const padding = Math.round(qrWidth * 0.08) // Marge de sécurité
    const badgeHeight = Math.round(qrHeight * 0.18) // Hauteur du bandeau CTA

    switch (frame.type) {
      case 'bottom-badge':
        return {
          totalWidth: qrWidth + padding * 2,
          totalHeight: qrHeight + padding * 2 + badgeHeight,
          qrOffsetX: padding,
          qrOffsetY: padding
        }
      case 'top-badge':
        return {
          totalWidth: qrWidth + padding * 2,
          totalHeight: qrHeight + padding * 2 + badgeHeight,
          qrOffsetX: padding,
          qrOffsetY: padding + badgeHeight
        }
      case 'speech-bubble': {
        const pointerOffset = Math.max(10, Math.round(qrHeight * 0.035))
        return {
          totalWidth: qrWidth + padding * 2,
          totalHeight: qrHeight + padding * 2 + badgeHeight + pointerOffset,
          qrOffsetX: padding,
          qrOffsetY: padding + badgeHeight + pointerOffset
        }
      }
      case 'full-card':
      default:
        return {
          totalWidth: qrWidth + padding * 2,
          totalHeight: qrHeight + padding * 2 + badgeHeight,
          qrOffsetX: padding,
          qrOffsetY: padding
        }
    }
  }

  /**
   * Compose un canvas final combinant la matrice QR et le cadre décoratif
   */
  public static composeCanvas(
    sourceCanvas: HTMLCanvasElement,
    frame: QrFrameSettings
  ): HTMLCanvasElement {
    if (frame.type === 'none') {
      return sourceCanvas
    }

    const qrW = sourceCanvas.width
    const qrH = sourceCanvas.height
    const { totalWidth, totalHeight, qrOffsetX, qrOffsetY } = this.calculateDimensions(qrW, qrH, frame)

    const targetCanvas = document.createElement('canvas')
    targetCanvas.width = totalWidth
    targetCanvas.height = totalHeight

    const ctx = targetCanvas.getContext('2d')
    if (!ctx) return sourceCanvas

    // Fond blanc neutre pour le conteneur du cadre
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, totalWidth, totalHeight)

    const frameColor = frame.frameColor || '#1a1523'
    const textColor = frame.textColor || '#fff8ee'
    const text = (frame.text || '').trim().slice(0, 30)
    const padding = qrOffsetX
    const maxTextWidth = Math.max(60, totalWidth - padding * 2)

    ctx.save()

    if (frame.type === 'bottom-badge') {
      ctx.strokeStyle = frameColor
      ctx.lineWidth = Math.max(3, Math.round(qrW * 0.015))
      ctx.strokeRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding)

      const badgeH = totalHeight - (qrOffsetY + qrH + padding / 2)
      const badgeY = qrOffsetY + qrH + Math.round(padding * 0.2)
      ctx.fillStyle = frameColor
      ctx.fillRect(padding / 2, badgeY, totalWidth - padding, badgeH)

      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(badgeH * 0.45))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, totalWidth / 2, badgeY + badgeH / 2, maxTextWidth)
      }
    } else if (frame.type === 'top-badge') {
      ctx.strokeStyle = frameColor
      ctx.lineWidth = Math.max(3, Math.round(qrW * 0.015))
      ctx.strokeRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding)

      const badgeH = qrOffsetY - padding / 2 - Math.round(padding * 0.2)
      ctx.fillStyle = frameColor
      ctx.fillRect(padding / 2, padding / 2, totalWidth - padding, badgeH)

      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(badgeH * 0.45))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, totalWidth / 2, padding / 2 + badgeH / 2, maxTextWidth)
      }
    } else if (frame.type === 'speech-bubble') {
      const pointerSize = Math.max(10, Math.round(qrH * 0.035))
      const bubbleH = qrOffsetY - pointerSize - padding / 2
      ctx.fillStyle = frameColor

      const radius = Math.max(8, Math.round(qrW * 0.03))
      const bx = padding / 2
      const by = padding / 2
      const bw = totalWidth - padding
      const bh = bubbleH

      ctx.beginPath()
      ctx.moveTo(bx + radius, by)
      ctx.lineTo(bx + bw - radius, by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + radius)
      ctx.lineTo(bx + bw, by + bh - radius)
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - radius, by + bh)
      ctx.lineTo(totalWidth / 2 + pointerSize, by + bh)
      ctx.lineTo(totalWidth / 2, by + bh + pointerSize)
      ctx.lineTo(totalWidth / 2 - pointerSize, by + bh)
      ctx.lineTo(bx + radius, by + bh)
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - radius)
      ctx.lineTo(bx, by + radius)
      ctx.quadraticCurveTo(bx, by, bx + radius, by)
      ctx.closePath()
      ctx.fill()

      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(bh * 0.45))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, totalWidth / 2, by + bh / 2, maxTextWidth)
      }
    } else if (frame.type === 'full-card') {
      ctx.fillStyle = frameColor
      ctx.fillRect(0, 0, totalWidth, totalHeight)

      ctx.fillStyle = '#ffffff'
      const cardRadius = Math.max(12, Math.round(qrW * 0.04))
      const cx = padding / 2
      const cy = padding / 2
      const cw = totalWidth - padding
      const ch = qrH + padding

      ctx.beginPath()
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(cx, cy, cw, ch, cardRadius)
      } else {
        ctx.rect(cx, cy, cw, ch)
      }
      ctx.fill()

      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(padding * 0.65))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const textY = cy + ch + (totalHeight - (cy + ch)) / 2
        ctx.fillText(text, totalWidth / 2, textY, maxTextWidth)
      }
    }

    ctx.restore()

    // Dessin de la matrice QR au centre
    ctx.drawImage(sourceCanvas, qrOffsetX, qrOffsetY)

    return targetCanvas
  }

  /**
   * Compose une chaîne SVG composite valide avec le cadre décoratif
   */
  public static composeSvg(sourceSvg: string, frame: QrFrameSettings): string {
    if (frame.type === 'none') {
      return sourceSvg
    }

    const { width: qrW, height: qrH } = extractSvgDimensions(sourceSvg)
    const { totalWidth, totalHeight, qrOffsetX, qrOffsetY } = this.calculateDimensions(qrW, qrH, frame)

    const frameColor = escapeXml(frame.frameColor || '#1a1523')
    const textColor = escapeXml(frame.textColor || '#fff8ee')
    const fontFamily = escapeXml(frame.fontFamily || 'Onest, sans-serif')
    const text = escapeXml((frame.text || '').trim().slice(0, 30))

    // Retirer la déclaration XML/DOCTYPE et la balise racine <svg> pour imbrication valide dans <g>
    const cleanSource = sourceSvg
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<svg[^>]*>/i, '')
      .replace(/<\/svg>\s*$/i, '')
      .trim()

    const padding = qrOffsetX
    const strokeW = Math.max(3, Math.round(qrW * 0.015))
    const rx = Math.max(8, Math.round(qrW * 0.03))
    let frameElements = ''

    if (frame.type === 'bottom-badge') {
      const badgeH = totalHeight - (qrOffsetY + qrH + padding / 2)
      const badgeY = qrOffsetY + qrH + Math.round(padding * 0.2)
      const fontSize = Math.max(14, Math.round(badgeH * 0.45))
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
        <rect x="${padding / 2}" y="${padding / 2}" width="${totalWidth - padding}" height="${totalHeight - padding}" fill="none" stroke="${frameColor}" stroke-width="${strokeW}" rx="${rx}" />
        <rect x="${padding / 2}" y="${badgeY}" width="${totalWidth - padding}" height="${badgeH}" fill="${frameColor}" rx="${Math.round(rx / 2)}" />
        ${text ? `<text x="${totalWidth / 2}" y="${badgeY + badgeH / 2}" dominant-baseline="central" fill="${textColor}" font-family="${fontFamily}" font-weight="bold" font-size="${fontSize}" text-anchor="middle">${text}</text>` : ''}
      `
    } else if (frame.type === 'top-badge') {
      const badgeH = qrOffsetY - padding / 2 - Math.round(padding * 0.2)
      const fontSize = Math.max(14, Math.round(badgeH * 0.45))
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
        <rect x="${padding / 2}" y="${padding / 2}" width="${totalWidth - padding}" height="${totalHeight - padding}" fill="none" stroke="${frameColor}" stroke-width="${strokeW}" rx="${rx}" />
        <rect x="${padding / 2}" y="${padding / 2}" width="${totalWidth - padding}" height="${badgeH}" fill="${frameColor}" rx="${Math.round(rx / 2)}" />
        ${text ? `<text x="${totalWidth / 2}" y="${padding / 2 + badgeH / 2}" dominant-baseline="central" fill="${textColor}" font-family="${fontFamily}" font-weight="bold" font-size="${fontSize}" text-anchor="middle">${text}</text>` : ''}
      `
    } else if (frame.type === 'speech-bubble') {
      const pointerSize = Math.max(10, Math.round(qrH * 0.035))
      const bubbleH = qrOffsetY - pointerSize - padding / 2
      const bx = padding / 2
      const by = padding / 2
      const bw = totalWidth - padding
      const fontSize = Math.max(14, Math.round(bubbleH * 0.45))
      const midX = totalWidth / 2
      const tipY = by + bubbleH + pointerSize
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
        <rect x="${bx}" y="${by}" width="${bw}" height="${bubbleH}" fill="${frameColor}" rx="${rx}" />
        <polygon points="${midX - pointerSize},${by + bubbleH} ${midX + pointerSize},${by + bubbleH} ${midX},${tipY}" fill="${frameColor}" />
        ${text ? `<text x="${midX}" y="${by + bubbleH / 2}" dominant-baseline="central" fill="${textColor}" font-family="${fontFamily}" font-weight="bold" font-size="${fontSize}" text-anchor="middle">${text}</text>` : ''}
      `
    } else {
      // full-card
      const cx = padding / 2
      const cy = padding / 2
      const cw = totalWidth - padding
      const ch = qrH + padding
      const textY = cy + ch + (totalHeight - (cy + ch)) / 2
      const fontSize = Math.max(14, Math.round(padding * 0.65))
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${frameColor}" rx="${rx}" />
        <rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" fill="#ffffff" rx="${Math.round(rx * 0.75)}" />
        ${text ? `<text x="${totalWidth / 2}" y="${textY}" dominant-baseline="central" fill="${textColor}" font-family="${fontFamily}" font-weight="bold" font-size="${fontSize}" text-anchor="middle">${text}</text>` : ''}
      `
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
      ${frameElements}
      <g transform="translate(${qrOffsetX}, ${qrOffsetY})">
        ${cleanSource}
      </g>
    </svg>`
  }
}
