import Route from '@ember/routing/route';

export default Route.extend({
	// model 为 paper 实例
	model(params) {
		let paperId = params['paper_id'];

		return this.store.findRecord('paper', paperId, { reload: true });
	}
});