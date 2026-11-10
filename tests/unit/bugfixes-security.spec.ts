import { describe, it, expect } from 'vitest'
import { sanitizeSvgContent, utf8ToBase64 } from '~/utils/svg-sanitizer.util'
import { FrameComposerService } from '~/services/qr/frame-composer.service'
import { formatICalDate } from '~/services/qr/serializers'
import { projectJsonExportSchema } from '~/services/validation/project.schema'
import { DEFAULT_QR_DESIGN } from '~/types/design'
import { DEFAULT_CONTENTS } from '~/types/content'

describe('Correctifs de sécurité, rendu SVG et sérialisation', () => {
  describe('Assainissement SVG (SEC-002)', () => {
    it('supprime les balises script, foreignObject et attributs on* dans un logo SVG', () => {
      const maliciousSvg =
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)" viewBox="0 0 100 100"><script>alert("xss")</script><foreignObject><div>evil</div></foreignObject><circle cx="50" cy="50" r="40" onclick="steal()" fill="#d9f24a"/></svg>'
      const cleaned = sanitizeSvgContent(maliciousSvg)

      expect(cleaned).toContain('<svg')
      expect(cleaned).toContain('<circle')
      expect(cleaned).not.toContain('<script')
      expect(cleaned).not.toContain('<foreignObject')
      expect(cleaned).not.toContain('onload=')
      expect(cleaned).not.toContain('onclick=')
    })

    it('neutralise les liens javascript: dans href', () => {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect width="10" height="10"/></a></svg>'
      const cleaned = sanitizeSvgContent(svg)
      expect(cleaned).not.toContain('javascript:')
    })

    it('encode en Base64 des caractères UTF-8 sans erreur', () => {
      const encoded = utf8ToBase64('<svg><title>Café &amp; Événement</title></svg>')
      expect(encoded.length).toBeGreaterThan(0)
    })
  })

  describe('FrameComposerService — SVG complet et échappement XML', () => {
    const sourceSvg = '<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300"/></svg>'

    it('supprime la déclaration <?xml?> imbriquée et échappe le texte XML', () => {
      const composed = FrameComposerService.composeSvg(sourceSvg, {
        type: 'bottom-badge',
        text: 'A & B <test>',
        frameColor: '#1a1523',
        textColor: '#d9f24a',
        fontFamily: 'Onest, sans-serif'
      })

      expect(composed).not.toContain('<?xml')
      expect(composed).toContain('A &amp; B &lt;test&gt;')
    })

    it('génère correctement un SVG pour les styles full-card et speech-bubble', () => {
      const fullCard = FrameComposerService.composeSvg(sourceSvg, {
        type: 'full-card',
        text: 'CARTE',
        frameColor: '#1a1523',
        textColor: '#d9f24a',
        fontFamily: 'Onest, sans-serif'
      })
      expect(fullCard).toContain('fill="#1a1523"')
      expect(fullCard).toContain('fill="#d9f24a"')
      expect(fullCard).toContain('CARTE')

      const bubble = FrameComposerService.composeSvg(sourceSvg, {
        type: 'speech-bubble',
        text: 'BULLE',
        frameColor: '#ff5a36',
        textColor: '#ffffff',
        fontFamily: 'Onest, sans-serif'
      })
      expect(bubble).toContain('<polygon')
      expect(bubble).toContain('BULLE')
    })
  })

  describe('formatICalDate — All-Day sans décalage horaire', () => {
    it('préserve la date calendaire exacte pour les événements sur toute la journée', () => {
      expect(formatICalDate('2026-11-15', true)).toBe('20261115')
      expect(formatICalDate('2026-01-01T00:00', true)).toBe('20260101')
    })
  })

  describe('Validation stricte Data URL dans projectJsonExportSchema', () => {
    it('rejette une Data URL non-image malveillante lors d’un import JSON', () => {
      const invalidExport = {
        app: 'QR Studio',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        name: 'Test XSS',
        content: DEFAULT_CONTENTS.URL,
        design: {
          ...DEFAULT_QR_DESIGN,
          logo: {
            ...DEFAULT_QR_DESIGN.logo,
            hasLogo: true,
            logoDataUrl: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='
          }
        }
      }

      const result = projectJsonExportSchema.safeParse(invalidExport)
      expect(result.success).toBe(false)
    })

    it('accepte les types de coins glassy/none et une Data URL PNG valide', () => {
      const validExport = {
        app: 'QR Studio',
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        name: 'Projet Valide',
        content: DEFAULT_CONTENTS.URL,
        design: {
          ...DEFAULT_QR_DESIGN,
          cornersSquare: { color: '#1a1523', type: 'none' },
          logo: {
            ...DEFAULT_QR_DESIGN.logo,
            hasLogo: true,
            logoDataUrl: 'data:image/png;base64,iVBORw0KGgo='
          }
        }
      }

      const result = projectJsonExportSchema.safeParse(validExport)
      expect(result.success).toBe(true)
    })
  })
})

