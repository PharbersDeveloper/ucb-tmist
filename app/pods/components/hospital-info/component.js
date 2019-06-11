import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
	classNames: ['mb-4', 'bg-white'],
	localClassNames: 'hospital',
	showContent: false,
	icon: computed('showContent', function () {
		let showContent = this.get('showContent');

		return showContent ? 'right' : 'down';
	}),
	currentSalesConfigs: computed('salesConfigs', function () {
		let hospitalId = this.hospitalConfig.get('hospital.id'),
			salesConfigs = this.salesConfigs;

		return salesConfigs.filterBy('destConfig.hospitalConfig.hospital.id', hospitalId);
	}),
	actions: {
		showContent() {
			this.toggleProperty('showContent');
		}
	}
});
