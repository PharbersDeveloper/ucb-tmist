import Route from '@ember/routing/route';

export default Route.extend({
	// model 为 paper 实例
	model(params) {
		let paperId = params['paper_id'];

		return this.store.findRecord('paper', paperId, { reload: true });
	},
	setupController(controller) {
		this._super(...arguments);
		if (localStorage.getItem('isHistory') === 'true') {
			controller.set('isHistory', true);
		} else {
			controller.set('isHistory', false);
		}
	},
	activate() {
		this._super(...arguments);
		let controller = this.controllerFor('page-report');

		if (localStorage.getItem('isHistory') === 'true') {
			controller.set('isHistory', true);
		} else {
			controller.set('isHistory', false);
		}
	}
});