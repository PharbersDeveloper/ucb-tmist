import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	tagName: '',
	icon: computed('sortIcons', 'sortIconProperty', function () {
		return 'down';
	})
});
