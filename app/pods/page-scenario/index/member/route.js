import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		let pageScenarioModel = this.modelFor('page-scenario'),
			resourceConfReps = pageScenarioModel.resourceConfRep;

		return resourceConfReps;
	}
});
