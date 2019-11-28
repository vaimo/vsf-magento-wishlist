import { Module } from 'vuex'
import actions from './actions'
import mutations from './mutations'
import getters from './getters'
import state from './state'
import RootState from '@vue-storefront/core/types/RootState'
import MagentoWishlistState from '../types/MagentoWishlistState'

export const module: Module<MagentoWishlistState, RootState> = {
  namespaced: true,
  actions,
  mutations,
  getters,
  state
}