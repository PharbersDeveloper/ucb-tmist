import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';

export default Route.extend({
	model(params) {
		let dCId = params['destConfig_id'],
			store = this.get('store'),
			totalModels = this.modelFor('page-scenario'),
			managerConf = totalModels.resourceConfManager,
			repConfs = totalModels.resourceConfRep,
			salesConfigs = totalModels.salesConfigs,
			currentController = this.controllerFor('page-scenario.index.hospital-config'),
			businessInputs = store.peekAll('businessinput'),
			businessinput = null;

		/**
		 * 当前的业务决策实例
		 */
		businessInputs.forEach(ele => {
			if (ele.get('destConfig.id') === dCId) {
				businessinput = ele;
			}
		});
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
					businessinput: businessinput
				});
				// 判断是否已经选择代表
				if (isEmpty(businessinput.get('resourceConfigId'))) {
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
				return RSVP.hash({
					managerConf,
					repConfs,
					destConfig: store.peekRecord('destConfig', dCId),
					businessinput,
					salesConfigs
				});
			});
	}
});
