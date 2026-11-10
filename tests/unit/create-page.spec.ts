import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import CreatePage from '~/pages/create.vue'

// Mocks des auto-imports Nuxt utilisés par pages/create.vue
vi.mock('vue-router', () => ({
  useRoute: () => ({ query: {} }),
  useRouter: () => ({
    replace: vi.fn().mockResolvedValue(undefined),
    push: vi.fn().mockResolvedValue(undefined)
  })
}))

vi.stubGlobal('useSeoMeta', vi.fn())

const ClientOnlyStub = defineComponent({
  name: 'ClientOnly',
  setup(_, { slots }) {
    return () => (slots.default ? h('div', { class: 'client-only-stub' }, slots.default()) : null)
  }
})

describe('Intégration complète pages/create.vue — Réactivité du preview QR', () => {
  it('monte sans boucle infinie ni warning Vue et met à jour le SVG preview en direct', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const wrapper = mount(CreatePage, {
      global: {
        stubs: {
          ClientOnly: ClientOnlyStub
        }
      }
    })

    // Attendre le montage initial asynchrone de qr-code-styling
    await new Promise(resolve => setTimeout(resolve, 80))
    await nextTick()

    // Vérifier qu'aucune boucle récursive Vue n'a été déclenchée
    const allWarns = warnSpy.mock.calls.map(c => c.join(' ')).join('\n')
    expect(allWarns).not.toContain('Maximum recursive updates')

    const host = wrapper.find('.qr-canvas-host')
    expect(host.exists()).toBe(true)
    const initialSvg = host.html()
    expect(initialSvg).toContain('<svg')

    // 1. Saisie URL en direct -> le SVG doit changer immédiatement
    const urlInput = wrapper.find('#qr-url-input')
    await urlInput.setValue('https://mon-test-reactif-2026.fr')
    await urlInput.trigger('input')
    await new Promise(resolve => setTimeout(resolve, 30))
    await nextTick()

    const svgAfterUrl = host.html()
    expect(svgAfterUrl).not.toBe(initialSvg)

    // 2. Changement de forme (Points) -> le SVG doit changer
    const pointsBtn = wrapper.findAll('.shape-card').find(b => b.text().includes('Points'))
    expect(pointsBtn).toBeDefined()
    await pointsBtn!.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 40))
    await nextTick()

    const svgAfterShape = host.html()
    expect(svgAfterShape).not.toBe(svgAfterUrl)

    // 3. Changement de couleur -> le SVG doit refléter la nouvelle couleur
    const colorTab = wrapper.findAll('.sub-tab-btn').find(b => b.text().includes('Couleurs'))
    expect(colorTab).toBeDefined()
    await colorTab!.trigger('click')
    await nextTick()

    const hexInput = wrapper.find('input.hex-input')
    await hexInput.setValue('#ff5a36')
    await hexInput.trigger('input')
    await new Promise(resolve => setTimeout(resolve, 40))
    await nextTick()

    const svgAfterColor = host.html()
    expect(svgAfterColor).toContain('#ff5a36')

    // 4. Activation d'un cadre -> le bandeau s'affiche dans le preview
    const frameTab = wrapper.findAll('.sub-tab-btn').find(b => b.text().includes('Cadre'))
    await frameTab!.trigger('click')
    await nextTick()

    const bottomBadgeBtn = wrapper.findAll('.frame-card').find(b => b.text().includes('Bandeau bas'))
    await bottomBadgeBtn!.trigger('click')
    await nextTick()

    expect(wrapper.find('.frame-banner--bottom').exists()).toBe(true)
    expect(wrapper.find('.frame-banner--bottom').text()).toBe('SCANNEZ-MOI')

    // 5. Changement de type vers Wi-Fi + saisie SSID -> le SVG doit changer immédiatement
    const wifiTab = wrapper.findAll('button[role="tab"]').find(b => b.text().includes('Wi-Fi'))
    expect(wifiTab).toBeDefined()
    await wifiTab!.trigger('click')
    await new Promise(resolve => setTimeout(resolve, 40))
    await nextTick()

    const svgAfterType = host.html()
    expect(svgAfterType).not.toBe(svgAfterColor)

    const ssidInput = wrapper.find('#wifi-ssid')
    await ssidInput.setValue('Cafe_Des_Arts_5G')
    await ssidInput.trigger('input')
    await new Promise(resolve => setTimeout(resolve, 40))
    await nextTick()

    expect(host.html()).not.toBe(svgAfterType)

    warnSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
