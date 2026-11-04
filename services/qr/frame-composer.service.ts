import type { QrFrameSettings } from '~/types/design'

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
      case 'speech-bubble':
        return {
          totalWidth: qrWidth + padding * 2,
          totalHeight: qrHeight + padding * 2 + badgeHeight + 10,
          qrOffsetX: padding,
          qrOffsetY: padding + badgeHeight + 10
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

    // Dessin de la structure du cadre
    const frameColor = frame.frameColor || '#3b82f6'
    const textColor = frame.textColor || '#ffffff'
    const text = (frame.text || '').trim().slice(0, 30)
    const padding = qrOffsetX

    ctx.save()

    if (frame.type === 'bottom-badge') {
      // Bordure externe douce
      ctx.strokeStyle = frameColor
      ctx.lineWidth = Math.max(3, Math.round(qrW * 0.015))
      ctx.strokeRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding)

      // Bandeau inférieur
      const badgeH = totalHeight - (qrOffsetY + qrH + padding / 2)
      const badgeY = qrOffsetY + qrH + Math.round(padding * 0.2)
      ctx.fillStyle = frameColor
      ctx.fillRect(padding / 2, badgeY, totalWidth - padding, badgeH)

      // Texte du bandeau
      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(badgeH * 0.45))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, totalWidth / 2, badgeY + badgeH / 2)
      }
    } else if (frame.type === 'top-badge') {
      // Bordure externe
      ctx.strokeStyle = frameColor
      ctx.lineWidth = Math.max(3, Math.round(qrW * 0.015))
      ctx.strokeRect(padding / 2, padding / 2, totalWidth - padding, totalHeight - padding)

      // Bandeau supérieur
      const badgeH = qrOffsetY - padding / 2 - Math.round(padding * 0.2)
      ctx.fillStyle = frameColor
      ctx.fillRect(padding / 2, padding / 2, totalWidth - padding, badgeH)

      // Texte du bandeau
      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(badgeH * 0.45))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, totalWidth / 2, padding / 2 + badgeH / 2)
      }
    } else if (frame.type === 'speech-bubble') {
      const bubbleH = qrOffsetY - 12 - padding / 2
      ctx.fillStyle = frameColor

      // Rectangle arrondi de la bulle
      const radius = 8
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
      // Pointe vers le bas
      ctx.lineTo(totalWidth / 2 + 10, by + bh)
      ctx.lineTo(totalWidth / 2, by + bh + 10)
      ctx.lineTo(totalWidth / 2 - 10, by + bh)
      ctx.lineTo(bx + radius, by + bh)
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - radius)
      ctx.lineTo(bx, by + radius)
      ctx.quadraticCurveTo(bx, by, bx + radius, by)
      ctx.closePath()
      ctx.fill()

      // Texte
      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(bh * 0.45))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(text, totalWidth / 2, by + bh / 2)
      }
    } else if (frame.type === 'full-card') {
      // Carte complète
      ctx.fillStyle = frameColor
      ctx.fillRect(0, 0, totalWidth, totalHeight)

      // Carte blanche centrale pour le QR
      ctx.fillStyle = '#ffffff'
      const cardRadius = 12
      const cx = padding / 2
      const cy = padding / 2
      const cw = totalWidth - padding
      const ch = qrH + padding

      ctx.beginPath()
      ctx.roundRect ? ctx.roundRect(cx, cy, cw, ch, cardRadius) : ctx.rect(cx, cy, cw, ch)
      ctx.fill()

      // Texte en bas de la carte
      if (text) {
        ctx.fillStyle = textColor
        const fontSize = Math.max(12, Math.round(padding * 0.6))
        ctx.font = `bold ${fontSize}px ${frame.fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const textY = cy + ch + (totalHeight - (cy + ch)) / 2
        ctx.fillText(text, totalWidth / 2, textY)
      }
    }

    ctx.restore()

    // Dessin de la matrice QR au centre
    ctx.drawImage(sourceCanvas, qrOffsetX, qrOffsetY)

    return targetCanvas
  }

  /**
   * Compose une chaîne SVG composite avec le cadre décoratif
   */
  public static composeSvg(sourceSvg: string, frame: QrFrameSettings): string {
    if (frame.type === 'none') {
      return sourceSvg
    }

    // Extraction des dimensions du SVG source
    const widthMatch = sourceSvg.match(/width="(\d+)"/)
    const heightMatch = sourceSvg.match(/height="(\d+)"/)
    const qrW = widthMatch && widthMatch[1] ? parseInt(widthMatch[1], 10) : 300
    const qrH = heightMatch && heightMatch[1] ? parseInt(heightMatch[1], 10) : 300

    const { totalWidth, totalHeight, qrOffsetX, qrOffsetY } = this.calculateDimensions(qrW, qrH, frame)
    const frameColor = frame.frameColor || '#3b82f6'
    const textColor = frame.textColor || '#ffffff'
    const text = (frame.text || '').trim().slice(0, 30)

    // Nettoyage du tag <svg> racine pour l'imbriquer
    const cleanSource = sourceSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')

    let frameElements = ''

    if (frame.type === 'bottom-badge') {
      const badgeH = Math.round(qrH * 0.18)
      const badgeY = qrOffsetY + qrH + 5
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
        <rect x="10" y="10" width="${totalWidth - 20}" height="${totalHeight - 20}" fill="none" stroke="${frameColor}" stroke-width="4" rx="8" />
        <rect x="10" y="${badgeY}" width="${totalWidth - 20}" height="${badgeH}" fill="${frameColor}" rx="4" />
        <text x="${totalWidth / 2}" y="${badgeY + badgeH / 2 + 5}" fill="${textColor}" font-family="${frame.fontFamily}" font-weight="bold" font-size="16" text-anchor="middle">${text}</text>
      `
    } else if (frame.type === 'top-badge') {
      const badgeH = Math.round(qrH * 0.18)
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
        <rect x="10" y="10" width="${totalWidth - 20}" height="${totalHeight - 20}" fill="none" stroke="${frameColor}" stroke-width="4" rx="8" />
        <rect x="10" y="10" width="${totalWidth - 20}" height="${badgeH}" fill="${frameColor}" rx="4" />
        <text x="${totalWidth / 2}" y="${10 + badgeH / 2 + 5}" fill="${textColor}" font-family="${frame.fontFamily}" font-weight="bold" font-size="16" text-anchor="middle">${text}</text>
      `
    } else {
      frameElements = `
        <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
        <rect x="5" y="5" width="${totalWidth - 10}" height="${totalHeight - 10}" fill="none" stroke="${frameColor}" stroke-width="3" rx="8" />
        <text x="${totalWidth / 2}" y="${totalHeight - 15}" fill="${textColor}" font-family="${frame.fontFamily}" font-weight="bold" font-size="15" text-anchor="middle">${text}</text>
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
