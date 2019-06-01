import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
	beforeModel(transition) {
		let resourceConfig = this.modelFor('page-scenario'),
			destConfigs = resourceConfig.destConfigs,
			firstDestConfig = destConfigs.get('firstObject'),
			proposalId = transition.params['page-scenario']['proposal_id'];

		this.transitionTo('/scenario/' + proposalId + '/index/hospital/' +
			firstDestConfig.get('id'));
	},
	model() {
		let pageScenarioModel = this.modelFor('page-scenario'),
			destConfigs = pageScenarioModel.destConfigs,
			goodsConfigs = pageScenarioModel.goodsConfigs,
			businessInputs = pageScenarioModel.businessInputs,
			resourceConfRep = pageScenarioModel.resourceConfRep;

		this.controllerFor('page-scenario.index').set('businessInputs', businessInputs);
		this.controllerFor('page-scenario').set('businessInputs', businessInputs);

		return hash({
			businessInputs: businessInputs,
			resourceConfManager: pageScenarioModel.resourceConfManager,
			goodsConfigs,
			destConfigs,
			resourceConfRep,
			salesConfigs: pageScenarioModel.salesConfigs
		});
	}
});