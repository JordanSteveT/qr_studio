import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QrTypeSelector from '~/components/editor/QrTypeSelector.vue'
import QrContentForm from '~/components/editor/QrContentForm.vue'
import FormUrl from '~/components/forms/FormUrl.vue'
import FormWifi from '~/components/forms/FormWifi.vue'
import type { QrContentType } from '~/types/content'

describe('Composants de formulaires de contenu (QR-004)', () => {
  it('QrTypeSelector affiche les 10 types et émet le type cliqué', async () => {
    const wrapper = mount(QrTypeSelector, {
      props: {
        activeType: 'URL'
      }
    })

    const buttons = wrapper.findAll('button[role="tab"]')
    expect(buttons.length).toBe(10)

    // Clic sur le bouton Wi-Fi (3ème bouton)
    const wifiBtn = buttons.find((b) => b.text().includes('Wi-Fi'))
    expect(wifiBtn).toBeDefined()
    await wifiBtn?.trigger('click')

    expect(wrapper.emitted('select')).toBeTruthy()
    expect(wrapper.emitted('select')?.[0]).toEqual(['WIFI'])
  })

  it('FormUrl affiche le champ URL et émet la mise à jour', async () => {
    const wrapper = mount(FormUrl, {
      props: {
        modelValue: { type: 'URL', url: 'https://test.fr' }
      }
    })

    const input = wrapper.find('input#qr-url-input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('https://test.fr')

    await input.setValue('https://nouveau.fr')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([
      { type: 'URL', url: 'https://nouveau.fr' }
    ])
  })

  it('QrContentForm change de vue dynamiquement et sérialise la donnée Wi-Fi', async () => {
    const wrapper = mount(QrContentForm, {
      props: {
        initialContent: {
          type: 'WIFI',
          ssid: 'MonWifi',
          password: 'secretpassword',
          encryption: 'WPA',
          hidden: false
        }
      }
    })

    expect(wrapper.findComponent(FormWifi).exists()).toBe(true)

    // L'émission initialement déclenchée doit contenir la chaîne Wi-Fi sérialisée
    const emittedEncoded = wrapper.emitted('update:encodedData')
    expect(emittedEncoded).toBeTruthy()
    const lastEncoded = emittedEncoded?.[emittedEncoded.length - 1]?.[0]
    expect(lastEncoded).toContain('WIFI:S:MonWifi;T:WPA;P:secretpassword;H:false;;')
  })
})
