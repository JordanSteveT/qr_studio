import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { DEFAULT_QR_DESIGN } from '~/types/design'
import QrShapeEditor from '~/components/editor/QrShapeEditor.vue'
import QrColorEditor from '~/components/editor/QrColorEditor.vue'
import QrFrameEditor from '~/components/editor/QrFrameEditor.vue'
import QrAdvancedSettings from '~/components/editor/QrAdvancedSettings.vue'
import QrDesignTabs from '~/components/editor/QrDesignTabs.vue'

describe('Composants de personnalisation graphique (QR-005)', () => {
  it('QrShapeEditor permet de choisir la forme des modules et émet la mise à jour', async () => {
    const wrapper = mount(QrShapeEditor, {
      props: {
        design: { ...DEFAULT_QR_DESIGN }
      }
    })

    const buttons = wrapper.findAll('.shape-card')
    expect(buttons.length).toBe(6)

    // Clic sur 'Dots'
    const dotsBtn = buttons.find((b) => b.text().includes('Points'))
    expect(dotsBtn).toBeDefined()
    await dotsBtn?.trigger('click')

    expect(wrapper.emitted('update:design')).toBeTruthy()
    const emitted = wrapper.emitted('update:design')?.[0]?.[0] as any
    expect(emitted.dots.type).toBe('dots')
  })

  it('QrColorEditor émet la nouvelle couleur des motifs', async () => {
    const wrapper = mount(QrColorEditor, {
      props: {
        design: { ...DEFAULT_QR_DESIGN }
      }
    })

    const hexInput = wrapper.find('input.hex-input')
    await hexInput.setValue('#ff0000')
    await hexInput.trigger('change')

    expect(wrapper.emitted('update:design')).toBeTruthy()
    const emitted = wrapper.emitted('update:design')?.[0]?.[0] as any
    expect(emitted.dots.color).toBe('#ff0000')
  })

  it('QrFrameEditor permet de sélectionner un style de cadre et de modifier le texte', async () => {
    const wrapper = mount(QrFrameEditor, {
      props: {
        design: { ...DEFAULT_QR_DESIGN }
      }
    })

    const frameBtns = wrapper.findAll('.frame-card')
    const bottomBtn = frameBtns.find((b) => b.text().includes('Bandeau bas'))
    await bottomBtn?.trigger('click')

    expect(wrapper.emitted('update:design')).toBeTruthy()
    const emitted = wrapper.emitted('update:design')?.[0]?.[0] as any
    expect(emitted.frame.type).toBe('bottom-badge')
  })

  it('QrAdvancedSettings permet de changer le niveau de redondance à H', async () => {
    const wrapper = mount(QrAdvancedSettings, {
      props: {
        design: { ...DEFAULT_QR_DESIGN }
      }
    })

    const levelCards = wrapper.findAll('.level-card')
    const maxCard = levelCards.find((c) => c.text().includes('Maximum (H)'))
    await maxCard?.trigger('click')

    expect(wrapper.emitted('update:design')).toBeTruthy()
    const emitted = wrapper.emitted('update:design')?.[0]?.[0] as any
    expect(emitted.errorCorrectionLevel).toBe('H')
  })

  it('QrDesignTabs coordonne la navigation entre sous-onglets', async () => {
    const wrapper = mount(QrDesignTabs, {
      props: {
        design: { ...DEFAULT_QR_DESIGN }
      }
    })

    const subTabs = wrapper.findAll('.sub-tab-btn')
    expect(subTabs.length).toBe(5)

    // Clic sur 'Couleurs'
    const colorTab = subTabs.find((t) => t.text().includes('Couleurs'))
    await colorTab?.trigger('click')

    expect(wrapper.findComponent(QrColorEditor).exists()).toBe(true)
  })
})
