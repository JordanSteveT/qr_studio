import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useQrEngine } from '~/composables/useQrEngine'
import QrContentForm from '~/components/editor/QrContentForm.vue'
import QrColorEditor from '~/components/editor/QrColorEditor.vue'
import QrPreview from '~/components/qr/QrPreview.vue'
import { DEFAULT_QR_DESIGN } from '~/types/design'

describe('Mise à jour instantanée du preview QR', () => {
  it('useQrEngine déclenche immédiatement le premier rendu puis coalesce les appels rapides', async () => {
    vi.useFakeTimers()
    const { mountQrCode, updateQrCode, currentData, isRendering } = useQrEngine()
    const container = document.createElement('div')

    await mountQrCode(container, { data: 'https://initial.fr', design: DEFAULT_QR_DESIGN })
    const initialHtml = container.innerHTML
    expect(initialHtml.length).toBeGreaterThan(0)

    // Premier appel : mise à jour immédiate (0 ms) sans attente de debounce
    updateQrCode('https://instant.fr')
    expect(currentData.value).toBe('https://instant.fr')
    expect(isRendering.value).toBe(true)

    // Appels rapides suivants : coalescés sur le trailing timer (25 ms)
    updateQrCode('https://final.fr')
    expect(currentData.value).toBe('https://final.fr')

    vi.advanceTimersByTime(40)
    expect(isRendering.value).toBe(false)
    vi.useRealTimers()
  })

  it('QrContentForm émet immédiatement update:encodedData même pendant la saisie en cours', async () => {
    const wrapper = mount(QrContentForm, {
      props: {
        initialContent: { type: 'URL', url: 'https://qrstudio.app' }
      }
    })

    const urlInput = wrapper.find('input#qr-url-input')
    await urlInput.setValue('monsite')
    await urlInput.trigger('input')

    const emitted = wrapper.emitted('update:encodedData')
    expect(emitted).toBeTruthy()
    const lastPayload = emitted?.[emitted.length - 1]?.[0]
    expect(lastPayload).toBe('https://monsite')
  })

  it('QrColorEditor émet immédiatement sur @input du champ hexadécimal', async () => {
    const wrapper = mount(QrColorEditor, {
      props: {
        design: { ...DEFAULT_QR_DESIGN }
      }
    })

    const hexInput = wrapper.find('input.hex-input')
    await hexInput.setValue('#ff5a36')
    await hexInput.trigger('input')

    const emitted = wrapper.emitted('update:design')
    expect(emitted).toBeTruthy()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedDesign = emitted?.[0]?.[0] as any
    expect(updatedDesign.dots.color).toBe('#ff5a36')
  })

  it('QrPreview monte le QR code et se met à jour sans bloquer lors d’un changement de props.data', async () => {
    const wrapper = mount(QrPreview, {
      props: {
        data: 'https://qrstudio.app',
        design: DEFAULT_QR_DESIGN,
        size: 300
      }
    })

    // Attendre la résolution du montage dynamique de qr-code-styling
    await new Promise(resolve => setTimeout(resolve, 60))
    await nextTick()

    expect(wrapper.find('.qr-canvas-host svg').exists()).toBe(true)

    await wrapper.setProps({
      data: 'https://nouveau-qr-instantane.fr'
    })
    await new Promise(resolve => setTimeout(resolve, 40))
    await nextTick()

    expect(wrapper.find('.qr-canvas-host svg').exists()).toBe(true)
  })
})

