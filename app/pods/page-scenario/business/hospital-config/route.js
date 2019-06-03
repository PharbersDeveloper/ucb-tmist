import Route from '@ember/routing/route';
import { hash } from 'rsvp';
import { isEmpty } from '@ember/utils';

export default Route.extend({
	model(params) {
		const store = this.get('store'),
			pageScenarioModel = this.modelFor('page-scenario'),
			managerConf = pageScenarioModel.resourceConfManager,
			repConfs = pageScenarioModel.resourceConfRep,
			salesConfigs = pageScenarioModel.salesConfigs,
			scenario = pageScenarioModel.scenario,
			currentController = this.controllerFor('page-scenario.business.hospitalConfig');

		let dCId = params['destConfig_id'],
			// businessController = this.controllerFor('page-scenario.index'),
			businessInputs = pageScenarioModel.businessInputs,
			businessinput = null;

		/**
		 * 当前的业务决策实例
		 */
		businessinput = businessInputs.filterBy('destConfig.id', dCId).get('firstObject');

		/**
		 * 获取总业务指标/总预算/总名额
		 */
		return managerConf.get('managerConfig')
			.then(mc => {
				return {
					tbi: mc.get('totalBusinessIndicators'),
					tbg: mc.get('totalBudgets'),
					tmp: mc.get('totalMeetingPlaces')
				};
			}).then(data => {
				currentController.setProperties({
					totalBusinessIndicators: data.tbi,
					totalBudgets: data.tbg,
					totalMeetingPlaces: data.tmp,
					businessInputs,
					businessinput: businessinput
				});
				// 判断是否已经选择代表
				if (isEmpty(businessinput.get('resourceConfig.id'))) {
					currentController.set('tmpRc', '');
				} else {
					repConfs.forEach(ele => {
						if (ele.id === businessinput.get('resourceConfigId')) {
							currentController.set('tmpRc', ele);
						}
					});
				}
			})
			.then(() => {
				return hash({
					scenario,
					notFirstPhase: scenario.get('phase') !== 1,
					managerConf,
					repConfs,
					destConfig: store.peekRecord('destConfig', dCId),
					businessinput,
					goodsInputs: businessinput.get('goodsinputs'),
					businessInputs,
					salesConfigs
				});
			});
	}
});
