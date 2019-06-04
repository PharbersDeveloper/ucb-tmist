import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
	beforeModel(transition) {
		let resourceConfig = this.modelFor('page-scenario'),
			destConfigs = resourceConfig.destConfigs,
			firstDestConfig = destConfigs.get('firstObject'),
			proposalId = transition.params['page-scenario']['proposal_id'];

		this.transitionTo('/scenario/' + proposalId + '/business/hospital/' +
			firstDestConfig.get('id'));
	},
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			destConfigs = pageScenarioModel.destConfigs,
			goodsConfigs = pageScenarioModel.goodsConfigs,
			businessInputs = pageScenarioModel.businessInputs,
			resourceConfRep = pageScenarioModel.resourceConfRep;

		this.controllerFor('page-scenario.business').set('businessInputs', businessInputs);
		this.controllerFor('page-scenario').set('businessInputs', businessInputs);

		return hash({
			businessInputs: businessInputs,
			resourceConfManager: pageScenarioModel.resourceConfManager,
			goodsConfigs,
			selfGoodsConfigs: pageScenarioModel.selfGoodsConfigs,
			destConfigs,
			resourceConfRep,
			salesConfigs: pageScenarioModel.salesConfigs
		});
	}
});