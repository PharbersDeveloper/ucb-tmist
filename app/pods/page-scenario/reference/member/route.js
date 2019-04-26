import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let totalConfig = this.modelFor('page-scenario.reference'),
			resourceConfReps = totalConfig.resourceConfRep;

		return resourceConfReps;
	}
});
