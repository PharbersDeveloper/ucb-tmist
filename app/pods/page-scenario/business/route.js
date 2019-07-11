import Route from '@ember/routing/route';
import { hash } from 'rsvp';

export default Route.extend({
	beforeModel() {
		let resourceConfig = this.modelFor('page-scenario'),
			destConfigHospitals = resourceConfig.destConfigHospitals,
			firstDestConfig = destConfigHospitals.get('firstObject');
		// proposalId = transition.params['page-scenario']['proposal_id']

		this.transitionTo('/scenario/' + 'business/hospital/' +
			firstDestConfig.get('id'));
	},
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			{ destConfigHospitals, goodsConfigs, businessInputs, goodsInputs,
				resourceConfRep, managerGoodsConfigs, resourceConfigManager } = pageScenarioModel;

		this.controllerFor('page-scenario.business').set('businessInputs', businessInputs);
		this.controllerFor('page-scenario').set('businessInputs', businessInputs);

		return hash({
			businessInputs,
			goodsInputs,
			managerGoodsConfigs,
			resourceConfigManager,
			goodsConfigs,
			selfGoodsConfigs: pageScenarioModel.selfGoodsConfigs,
			destConfigHospitals,
			resourceConfRep,
			salesConfigs: pageScenarioModel.salesConfigs
		});
	}
});
