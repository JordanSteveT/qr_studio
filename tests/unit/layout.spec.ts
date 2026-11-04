import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Container from '~/components/layout/Container.vue'
import EditorHeader from '~/components/editor/EditorHeader.vue'

describe('QR Studio — Structure & Layout (QR-002)', () => {
  describe('Container.vue', () => {
    it('doit rendre un conteneur div standard avec le slot par défaut', () => {
      const wrapper = mount(Container, {
        slots: {
          default: '<span class="test-content">Contenu</span>'
        }
      })

      expect(wrapper.classes()).toContain('app-container')
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('doit supporter la prop fluid et la prop as', () => {
      const wrapper = mount(Container, {
        props: {
          as: 'section',
          fluid: true
        }
      })

      expect(wrapper.element.tagName).toBe('SECTION')
      expect(wrapper.classes()).toContain('app-container--fluid')
    })
  })

  describe('EditorHeader.vue', () => {
    it('doit afficher le titre du projet passé en prop', () => {
      const wrapper = mount(EditorHeader, {
        props: {
          projectName: 'Mon Super QR Code',
          isDirty: false
        }
      })

      expect(wrapper.find('.project-title').text()).toBe('Mon Super QR Code')
      expect(wrapper.find('.dirty-badge').exists()).toBe(false)
    })

    it('doit afficher le badge "Non enregistré" lorsque isDirty est true', () => {
      const wrapper = mount(EditorHeader, {
        props: {
          projectName: 'Projet Test',
          isDirty: true
        }
      })

      expect(wrapper.find('.dirty-badge').exists()).toBe(true)
      expect(wrapper.find('.dirty-text').text()).toBe('Non enregistré')
    })

    it('doit émettre @save lors du clic sur le bouton enregistrer', async () => {
      const wrapper = mount(EditorHeader, {
        props: {
          projectName: 'Projet',
          isDirty: true
        }
      })

      await wrapper.find('.save-btn').trigger('click')
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')?.length).toBe(1)
    })

    it('doit permettre le renommage et émettre @rename avec le nouveau nom', async () => {
      const wrapper = mount(EditorHeader, {
        props: {
          projectName: 'Ancien Nom',
          isDirty: false
        }
      })

      // Clic pour passer en mode édition
      await wrapper.find('.name-display').trigger('click')
      expect(wrapper.find('.name-input').exists()).toBe(true)

      // Saisie du nouveau nom
      const input = wrapper.find('.name-input')
      await input.setValue('Nouveau Nom de QR')
      await wrapper.find('.name-confirm-btn').trigger('click')

      expect(wrapper.emitted('rename')).toBeTruthy()
      expect(wrapper.emitted('rename')?.[0]).toEqual(['Nouveau Nom de QR'])
    })

    it('doit émettre les événements @export-json, @import-json et @reset', async () => {
      const wrapper = mount(EditorHeader)

      const buttons = wrapper.findAll('.tool-btn')
      // bouton 0: Importer, bouton 1: JSON, bouton 2: Réinitialiser
      await buttons[0]?.trigger('click')
      expect(wrapper.emitted('import-json')).toBeTruthy()

      await buttons[1]?.trigger('click')
      expect(wrapper.emitted('export-json')).toBeTruthy()

      await buttons[2]?.trigger('click')
      expect(wrapper.emitted('reset')).toBeTruthy()
    })
  })
})
