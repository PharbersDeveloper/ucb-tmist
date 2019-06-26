import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	tagName: '',
	icon: computed('sortIcons', 'sortIconProperty', function () {
		console.log(this.sortIcons);
		console.log(this.sortIconProperty);
		return 'down';
	})
});
