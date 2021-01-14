import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState({
      currentUser: (state) => state.user.current
    })
  },
  mounted () {
    if (this.currentUser) {
      this.loadWishlist()
    } else {
      this.$bus.$on('user-after-loggedin', this.loadWishlist)
    }
  },
  methods: {
    clearWishlist () {
      return this.$store.dispatch('wishlist/reset')
    },
    loadWishlist () {
      this.$bus.$off('user-after-loggedin', this.loadWishlist)
      this.$bus.$on('user-after-logout', this.clearWishlist)

      return this.$store.dispatch('wishlist/load')
    }
  }
}
