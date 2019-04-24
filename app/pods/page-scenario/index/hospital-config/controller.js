import Controller from '@ember/controller';

export default Controller.extend({
	actions: {
		changedRep(item) {
			let businessinput = this.get('businessinput');

			this.set('tmpRc', item);
			businessinput.setProperties({
				resourceConfigId: item.id,
				resourceConfig: item
			});
		},
		reInput() {
			let businessinput = this.get('businessinput');

			this.set('tmpRc', null);

			businessinput.setProperties({
				resourceConfigId: '',
				resourceConfig: null,
				visitTime: '',
				meetingPlaces: '',
				salesTarget: '',
				budget: ''
			});
		}
	}
});
