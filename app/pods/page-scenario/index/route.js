import Route from '@ember/routing/route';
import { A } from '@ember/array';
import RSVP, { hash } from 'rsvp';

export default Route.extend({
	eachArray(array, key) {
		return array.map(ele => {
			return ele.get(key);
		});
	},
	beforeModel(transition) {
		let proposalId = transition.params['page-scenario']['proposal_id'],
			currentChindRouteName = transition.targetName.split('.').get('lastObject'),
			currentController = this.controllerFor('page-scenario.index');

		currentController.set('proposalId', proposalId);
		currentController.set('groupValue', currentChindRouteName);
	},
	model() {
		const pageScenarioModel = this.modelFor('page-scenario'),
			paper = pageScenarioModel.paper,
			goodsConfigs = pageScenarioModel.goodsConfigs;

		let seasons = A([]),
			tmpData = A([]),
			tmpHead = A([]),
			lineColorTm = A(['#57D9A3', '#79E2F2', '#FFE380', '#8777D9 ']);

		return paper.get('salesReports')
			.then(data => {
				// 获取产品salesReport
				let increaseSalesReports = data.sortBy('time'),
					promiseArray = increaseSalesReports.map(ele => {
						return ele.get('productSalesReports');
					}),
					seasonsPrimary = increaseSalesReports.map(ele => {
						return ele.get('scenario');
					});

				return hash({
					productSalesReports: RSVP.Promise.all(promiseArray),
					seasons: RSVP.Promise.all(seasonsPrimary)
				});


			}).then(result => {
				let promiseArray = A([]),
					data = result.productSalesReports;

				tmpHead = result.seasons.map(ele => {
					let name = ele.get('name') || '';

					return name.slice(0, 4) + name.slice(-4);
				});
				// 获取基于周期的数据
				tmpData = data.map((productSalesReports, index) => {
					let shareData = this.eachArray(productSalesReports, 'share'),
						goodsConfigIds = productSalesReports.map(ele => ele.get('goodsConfig')),
						productNames = this.eachArray(productSalesReports, 'productName');

					promiseArray = goodsConfigIds;
					return {
						date: seasons[index],
						shareData,
						goodsConfigIds,
						productNames
					};
				});
				return RSVP.Promise.all(promiseArray);
			}).then(data => {
				let promiseArray = data.map(ele => {
					return ele.get('productConfig');
				});

				return RSVP.Promise.all(promiseArray);
			}).then(data => {
				let promiseArray = data.map(ele => {
					return ele.get('product');
				});

				return RSVP.Promise.all(promiseArray);
			}).then(data => {
				// 拼装基于产品的数据
				let lineData = data.map((gc, index) => {
					return {
						name: gc.get('name'),
						date: tmpHead,
						data: tmpData.map(item => item.shareData[index])
					};
				});

				return hash({
					paper,
					goodsConfigs,
					selfGoodsConfigs: pageScenarioModel.selfGoodsConfigs,
					competeGoodsConfigs: pageScenarioModel.competeGoodsConfigs,
					destConfigHospitals: pageScenarioModel.destConfigHospitals,
					salesConfigs: pageScenarioModel.salesConfigs,
					resourceConfRep: pageScenarioModel.resourceConfRep,
					resourceConfManager: pageScenarioModel.resourceConfManager,
					lineDataTm: lineData,
					lineColorTm
				});
			});
	}
	// beforeModel(transition) {
	// 	let resourceConfig = this.modelFor('page-scenario'),
	// 		destConfigHospitals = resourceConfig.destConfigHospitals,
	// 		firstDestConfig = destConfigHospitals.get('firstObject'),
	// 		proposalId = transition.params['page-scenario']['proposal_id'];

	// 	this.transitionTo('/scenario/' + proposalId + '/index/hospital/' +
	// 		firstDestConfig.get('id'));
	// },
	// model() {
	// 	let pageScenarioModel = this.modelFor('page-scenario'),
	// 		destConfigHospitals = pageScenarioModel.destConfigHospitals,
	// 		goodsConfigs = pageScenarioModel.goodsConfigs,
	// 		businessInputs = pageScenarioModel.businessInputs,
	// 		resourceConfRep = pageScenarioModel.resourceConfRep;

	// 	this.controllerFor('page-scenario.index').set('businessInputs', businessInputs);
	// 	this.controllerFor('page-scenario').set('businessInputs', businessInputs);

	// 	return hash({
	// 		businessInputs: businessInputs,
	// 		resourceConfManager: pageScenarioModel.resourceConfManager,
	// 		goodsConfigs,
	// 		destConfigHospitals,
	// 		resourceConfRep,
	// 		salesConfigs: pageScenarioModel.salesConfigs
	// 	});
	// }
});