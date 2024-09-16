import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState({
      currentUser: (state) => state.user.current
    })
  },
  mounted () {
    if (this.currentUser) {
      this.loadWishlist();
    }
  },
  methods: {

    loadWishlist () {
      return this.$store.dispatch('wishlist/load');
    }
  }
};
