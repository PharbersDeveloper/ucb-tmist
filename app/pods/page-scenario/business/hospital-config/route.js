import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { A } from '@ember/array';
import { hash, all } from 'rsvp';

export default Route.extend({
	model(params) {
		const store = this.get('store'),
			pageScenarioModel = this.modelFor('page-scenario'),
			managerConf = pageScenarioModel.resourceConfigManager,
			repConfs = pageScenarioModel.resourceConfRep,
			{ salesConfigs, scenario, increaseSalesReports } = pageScenarioModel,
			currentController = this.controllerFor('page-scenario.business.hospitalConfig');

		let dCId = params['destConfig_id'],
			destConfig = store.peekRecord('destConfig', dCId),
			// businessController = this.controllerFor('page-scenario.index'),
			businessInputs = pageScenarioModel.businessInputs,
			businessinput = null,
			lastSeasonHospitalSalesReports = A([]);

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
						if (ele.get('representativeConfig.representative.id') === businessinput.get('representativeId')) {
							currentController.set('tmpRc', ele);
						}
					});
				}
				return all([increaseSalesReports.lastObject.get('hospitalSalesReports'), repConfs.map(ele => ele.get('representativeConfig.representative.images'))]);
			}).then(data => {
				lastSeasonHospitalSalesReports = data[0];
				return all(data[0].map(ele => ele.get('destConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospitalConfig')));
			}).then(data => {
				return all(data.map(ele => ele.get('hospital')));
			}).then(() => {
				// let hospitalId = destConfig.get('hospitalConfig.hospital.id'),
				// 	currentHospitalSalesReports = lastSeasonHospitalSalesReports.filterBy('destConfig.hospitalConfig.hospital.id', hospitalId);

				return hash({
					lastSeasonHospitalSalesReports,
					// currentHospitalSalesReports,
					scenario,
					notFirstPhase: scenario.get('phase') !== 1,
					managerConf,
					repConfs,
					destConfig,
					businessinput,
					goodsInputs: businessinput.get('goodsinputs'),
					businessInputs,
					salesConfigs: salesConfigs.filterBy('destConfig.hospitalConfig.hospital.id', destConfig.get('hospitalConfig.hospital.id'))
				});
			});
	}
});
