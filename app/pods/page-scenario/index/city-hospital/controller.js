import Controller from '@ember/controller';

export default Controller.extend({
	salesGroupValue: 0,
	actions: {
		changeSalesValue(city, index) {
			this.set('salesGroupValue', index);
			this.set('model.city', city);
		}
	}
});
